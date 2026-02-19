# Diagram Pipeline

This module uses a source-of-truth diagram flow:

- `mermaid/` editable physiology flow definitions (`.mmd`)
- `svg/` exported static assets
- `reactflow/` interactive node/edge definitions used in UI

## Edit Flow
1. Edit Mermaid source in `src/diagrams/mermaid/*.mmd`
2. Regenerate SVG assets:
   ```bash
   npm run diagrams:build
   ```
3. If interaction changes are needed, update the corresponding `src/diagrams/reactflow/*.ts` definitions.

## Notes
- Mermaid SVGs are reference artifacts.
- Live interactivity in page is driven by React Flow definitions.
