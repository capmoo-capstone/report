# Nexus Procure Report Diagrams

This folder contains editable Mermaid diagram sources and PNG exports for the Nexus Procure MVP final project report.

Removed scope is intentionally excluded: notification system, home page, overview dashboard, and personal KPI dashboard.

## How to Edit

1. Open any `.mmd` file in a text editor.
2. Edit labels, arrows, or nodes as plain text.
3. Regenerate the PNG with Mermaid CLI if you have `npx`:

```powershell
npx -y @mermaid-js/mermaid-cli -i .\01-system-context.mmd -o .\01-system-context.png -b white
```

To regenerate all PNGs from this folder:

```powershell
Get-ChildItem . -Filter *.mmd | ForEach-Object {
  npx -y @mermaid-js/mermaid-cli -i $_.FullName -o ($_.FullName -replace '\.mmd$', '.png') -b white
}
```

This package also includes `render-all.cjs`, which was used to generate the PNGs on this machine:

```powershell
node .\render-all.cjs
```

## Diagram List

| No. | Diagram | Source | PNG |
| --- | --- | --- | --- |
| 01 | System Context | [01-system-context.mmd](./01-system-context.mmd) | [01-system-context.png](./01-system-context.png) |
| 02 | Use Case | [02-use-case.mmd](./02-use-case.mmd) | [02-use-case.png](./02-use-case.png) |
| 03 | Project Creation Activity | [03-project-creation-activity.mmd](./03-project-creation-activity.mmd) | [03-project-creation-activity.png](./03-project-creation-activity.png) |
| 04 | Job Assignment Activity | [04-job-assignment-activity.mmd](./04-job-assignment-activity.mmd) | [04-job-assignment-activity.png](./04-job-assignment-activity.png) |
| 05 | Procurement Workflow Activity | [05-procurement-workflow-activity.mmd](./05-procurement-workflow-activity.mmd) | [05-procurement-workflow-activity.png](./05-procurement-workflow-activity.png) |
| 06 | Project Status State Machine | [06-project-status-state-machine.mmd](./06-project-status-state-machine.mmd) | [06-project-status-state-machine.png](./06-project-status-state-machine.png) |
| 07 | Login Sequence | [07-login-sequence.mmd](./07-login-sequence.mmd) | [07-login-sequence.png](./07-login-sequence.png) |
| 08 | Create Project Sequence | [08-create-project-sequence.mmd](./08-create-project-sequence.mmd) | [08-create-project-sequence.png](./08-create-project-sequence.png) |
| 09 | Document Upload and Version Sequence | [09-document-version-sequence.mmd](./09-document-version-sequence.mmd) | [09-document-version-sequence.png](./09-document-version-sequence.png) |
| 10 | ER Diagram | [10-er-diagram.mmd](./10-er-diagram.mmd) | [10-er-diagram.png](./10-er-diagram.png) |
| 11 | Class Diagram | [11-class-diagram.mmd](./11-class-diagram.mmd) | [11-class-diagram.png](./11-class-diagram.png) |
| 12 | Component Diagram | [12-component-diagram.mmd](./12-component-diagram.mmd) | [12-component-diagram.png](./12-component-diagram.png) |
| 13 | Deployment Diagram | [13-deployment-diagram.mmd](./13-deployment-diagram.mmd) | [13-deployment-diagram.png](./13-deployment-diagram.png) |
| 14 | UI Flow | [14-ui-flow.mmd](./14-ui-flow.mmd) | [14-ui-flow.png](./14-ui-flow.png) |
| 18 | Vendor Submission Sequence | [18-vendor-submission-sequence.mmd](./18-vendor-submission-sequence.mmd) | [18-vendor-submission-sequence.png](./18-vendor-submission-sequence.png) |
