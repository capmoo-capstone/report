const fs = require("fs");
const path = require("path");
const { createRequire } = require("module");

function loadPlaywright() {
  try {
    return require("playwright");
  } catch {
    const bundledModules =
      "C:/Users/popo1/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/";
    return createRequire(bundledModules)("playwright");
  }
}

const { chromium } = loadPlaywright();
const sourceDir = __dirname;
const files = fs
  .readdirSync(sourceDir)
  .filter((file) => file.endsWith(".mmd"))
  .sort();

async function renderDiagram(page, file, index) {
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
    { id, source },
  );

  const diagram = await page.locator("#diagram").elementHandle();
  await diagram.screenshot({ path: outputPath, omitBackground: false });
  console.log(`Rendered ${file} -> ${path.basename(outputPath)}`);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 2400, height: 1800 },
    deviceScaleFactor: 2,
  });

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
    await renderDiagram(page, file, index + 1);
  }

  await browser.close();
})();
