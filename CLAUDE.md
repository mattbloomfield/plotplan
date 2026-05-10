# Property Layout Designer

A browser-based property/yard design tool. Users upload a property image, calibrate scale (pixels to feet), and place/arrange landscape items with precise measurements.

## Tech Stack

- **Framework:** React 19 + TypeScript (strict mode)
- **Canvas:** Konva + react-konva for 2D rendering
- **State:** Zustand (single store: `useDesignerStore`)
- **Styling:** Tailwind CSS v4
- **Build:** Vite

## Project Structure

```
src/
├── components/
│   ├── Canvas/       # DesignerCanvas, CanvasItem, SelectionTransformer, BackgroundImage, CalibrationLine
│   ├── Sidebar/      # ItemPalette, ItemProperties, ImageUpload, ScaleCalibration
│   └── Toolbar/      # Toolbar
├── store/            # useDesignerStore (Zustand)
├── hooks/            # useKeyboardShortcuts
├── types/            # TypeScript interfaces (LayoutItem, InteractionMode, etc.)
├── utils/            # itemDefaults, scale conversions, storage (localStorage)
├── App.tsx
└── main.tsx
```

## Commands

- `npm run dev` — start dev server
- `npm run build` — production build (Vite)
- `npx tsc --noEmit` — type-check without emitting

## Key Patterns

- **Interaction modes:** `select`, `calibrate`, `place`, `draw-polygon` — stored in Zustand, drive cursor and click behavior
- **Item shapes:** `circle`, `rect`, `polygon` — polygon items store relative vertex `points[]` and use Konva `Line` with `closed={true}`
- **Polygon vertex handles:** rendered as draggable Konva `Circle`s on selected polygons; must `cancelBubble` on drag events to prevent parent Group from intercepting
- **Coordinate system:** items store position in stage pixels; `widthFt`/`heightFt` use calibrated `pixelsPerFoot` for real-world sizing
- **Undo/redo:** snapshot-based history (max 50) in the store; `pushHistory()` before mutations
- **Persistence:** localStorage via `save()`/`load()` in the store; auto-loads on app mount; Cmd+S saves

## Conventions

- Prefer editing existing files over creating new ones
- No separate test framework currently configured
- Item definitions live in `src/utils/itemDefaults.ts`
- All canvas event handlers go in `DesignerCanvas.tsx`; per-item rendering in `CanvasItem.tsx`
