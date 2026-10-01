const fs = require("fs");
const path = require("path");
const { createRequire } = require("module");

function getBrowserLauncher() {
  try {
    const puppeteer = require("puppeteer-core");
    const chromePaths = [
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
      "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe"
    ];
    const executablePath = chromePaths.find((p) => fs.existsSync(p));
    if (!executablePath) {
      throw new Error("No Chrome or Edge executable found.");
    }
    return async () => {
      const browser = await puppeteer.launch({
        executablePath,
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
      });
      return {
        browser,
        newPage: async () => {
          const page = await browser.newPage();
          await page.setViewport({ width: 2400, height: 1800, deviceScaleFactor: 2 });
          return page;
        },
        getElement: async (page) => page.$("#diagram"),
        screenshot: async (element, outputPath) => element.screenshot({ path: outputPath, omitBackground: false }),
        close: () => browser.close()
      };
    };
  } catch (err) {
    try {
      const playwright = require("playwright");
      return async () => {
        const browser = await playwright.chromium.launch({ headless: true });
        return {
          browser,
          newPage: async () => {
            return browser.newPage({
              viewport: { width: 2400, height: 1800 },
              deviceScaleFactor: 2
            });
          },
          getElement: async (page) => page.locator("#diagram").elementHandle(),
          screenshot: async (element, outputPath) => element.screenshot({ path: outputPath, omitBackground: false }),
          close: () => browser.close()
        };
      };
    } catch {
      throw err;
    }
  }
}
const sourceDir = __dirname;
const files = fs
  .readdirSync(sourceDir)
  .filter((file) => file.endsWith(".mmd"))
  .sort();

async function renderDiagram(runner, page, file, index) {
  const sourcePath = path.join(sourceDir, file);
  const outputPath = sourcePath.replace(/\.mmd$/i, ".png");
  const source = fs.readFileSync(sourcePath, "utf8");
  const id = `diagram_${index}`;

  await page.evaluate(
    async ({ id, source }) => {
      const container = document.getElementById("diagram");
      container.innerHTML = "";
      const result = await window.mermaid.render(id, source);
      container.innerHTML = result.svg;
    },
    { id, source }
  );

  const diagram = await runner.getElement(page);
  await runner.screenshot(diagram, outputPath);
  console.log(`Rendered ${file} -> ${path.basename(outputPath)}`);
}

(async () => {
  const launch = getBrowserLauncher();
  const runner = await launch();
  const page = await runner.newPage();

  await page.setContent(`<!doctype html>
    <html>
      <head>
        <style>
          body {
            margin: 0;
            background: white;
            font-family: Arial, Helvetica, sans-serif;
          }
          #diagram {
            display: inline-block;
            min-width: 640px;
            padding: 28px;
            background: white;
          }
          #diagram svg {
            max-width: none !important;
            height: auto !important;
          }
        </style>
      </head>
      <body>
        <div id="diagram"></div>
      </body>
    </html>`);

  await page.addScriptTag({
    url: "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js",
  });

  await page.evaluate(() => {
    window.mermaid.initialize({
      startOnLoad: false,
      securityLevel: "loose",
      theme: "default",
      flowchart: { htmlLabels: true, curve: "basis" },
      sequence: { useMaxWidth: false },
      class: { useMaxWidth: false },
      er: { useMaxWidth: false },
    });
  });

  for (const [index, file] of files.entries()) {
    await renderDiagram(runner, page, file, index + 1);
  }

  await runner.close();
})();

