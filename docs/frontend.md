# Frontend

React application in `frontend/`. A yarn workspace within the monorepo.

---

## Tech Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Package manager | Yarn (Berry) | Workspaces, single lockfile, fast installs |
| Language | TypeScript (strict) | Type safety across API boundary and components |
| Build | Vite | Fast HMR, native ESM |
| Formatter | Prettier | Consistent style across the codebase |
| UI framework | React 18 | |
| Routing | TanStack Router | Type-safe file-based routing, URL per tab |
| Component library | Material UI v6 | Rich components, `ThemeProvider` for light/dark |
| Styling | SCSS modules | Scoped styles, nesting, variables; MUI overrides |
| Server state | TanStack React Query | Job polling via `refetchInterval`, cache invalidation |
| UI state | Zustand | Replacement history, color selection, free color set |
| HTTP client | Axios | Base URL config, interceptors for error handling |
| API types | `@hey-api/openapi-ts` | Auto-generated from FastAPI's `/openapi.json` |
| 3D preview | Three.js + GLTFLoader | Loads GLB files; full scene control |
| Crop | react-cropper | Replaces 867-line `crop_extension.py` |
| i18n | i18next + react-i18next | JSON files ported from `core/i18n.py` |

---

## Prettier Config

`.prettierrc` in `frontend/`:

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2
}
```

---

## Routing

Each tab has its own URL. TanStack Router uses file-based routing with Vite plugin codegen — `routeTree.gen.ts` is auto-generated, no manual registration.

| URL | Route file | Tab |
|-----|-----------|-----|
| `/` | `index.tsx` | Redirect → `/converter` |
| `/converter` | `converter.tsx` | Image converter |
| `/calibration` | `calibration.tsx` | Calibration board generator |
| `/extractor` | `extractor.tsx` | Color extractor |
| `/advanced` | `advanced.tsx` | Outline, cloisonné, coating, free colors |
| `/merge` | `merge.tsx` | LUT merge |
| `/settings` | `settings.tsx` | Settings & about |

The `AppHeader` navigation bar uses MUI `Tabs` with TanStack `<Link>` components for correct active-state detection without extra logic.

---

## Component Tree

```
__root.tsx  (RootLayout)
├── AppHeader
│   ├── LuminaLogo
│   ├── NavTabs          ← MUI Tabs + TanStack <Link> per route
│   ├── LanguageToggle   ← zh / en
│   └── ThemeToggle      ← light / dark
└── <Outlet />
    ├── /converter  → <ConverterTab>
    │   ├── ConverterSidebar
    │   │   ├── LutSelector           ← dropdown + upload
    │   │   ├── ImageUploadZone
    │   │   │   └── CropModal         ← react-cropper
    │   │   ├── DimensionSliders      ← width / height / thickness
    │   │   ├── ReliefSection         ← accordion: height map + per-color heights
    │   │   ├── ColorModeRadio        ← 4-Color / 6-Color / 8-Color / BW
    │   │   ├── ModelingModeRadio     ← High-Fidelity / Pixel / Vector
    │   │   ├── AdvancedSettings      ← accordion: quantize, tolerance, cleanup, etc.
    │   │   └── GenerateButton
    │   └── ConverterWorkspace
    │       ├── PreviewImage2D        ← cached preview PNG with cache-bust ?t=
    │       ├── PaletteGrid           ← clickable color swatches from image
    │       ├── LutColorGrid          ← clickable LUT color swatches (hue filter + search)
    │       ├── ReplacementControls   ← apply / undo / clear
    │       ├── ModelViewer           ← Three.js canvas, GLB preview
    │       └── OutputActions         ← download 3MF + open in slicer
    ├── /calibration  → <CalibrationTab>
    ├── /extractor    → <ExtractorTab>
    │   └── CornerMarkerCanvas        ← click-to-mark 4 corners (React pointer events)
    ├── /advanced     → <AdvancedTab>
    ├── /merge        → <LutMergeTab>
    └── /settings     → <SettingsTab>
```

### Gradio → React replacement map

| Gradio | React |
|--------|-------|
| `crop_extension.py` (867 lines HTML/JS) | `<CropModal>` with react-cropper (~50 lines) |
| `palette_extension.py` HTML generator | `<PaletteGrid>` + `<LutColorGrid>` |
| `gr.Model3D` | `<ModelViewer>` — Three.js + GLTFLoader + OrbitControls |
| `gr.Image.select` click handler | `<CornerMarkerCanvas>` with React pointer events |

---

## State Ownership

| State | Lives in | Sent to server |
|-------|----------|---------------|
| `session_id` | React state + `sessionStorage` | Every request |
| `replacement_map` | Zustand | At generate time |
| Undo history | Zustand (array of map snapshots) | Never |
| `color_height_map` | Zustand | At generate time |
| `free_color_set` | Zustand | At generate time |
| Selected color | Zustand | Per highlight request |
| `lang` / `isDark` | Zustand + `localStorage` | Never |
| Preview cache (numpy arrays) | **Server session store** | N/A |

---

## OpenAPI Type Generation

FastAPI auto-generates `/openapi.json`. `@hey-api/openapi-ts` reads it and outputs typed code into `src/api/generated/` (gitignored).

`frontend/openapi-ts.config.ts`:

```ts
import { defineConfig } from '@hey-api/openapi-ts'

export default defineConfig({
  client: '@hey-api/client-axios',
  input: 'http://localhost:7860/openapi.json',
  output: 'src/api/generated',
})
```

Generated files:
- `types.gen.ts` — all request/response interfaces
- `services.gen.ts` — typed Axios service functions

**Usage pattern:** Components never import from `generated/` directly. TanStack Query hooks in `hooks/` wrap the generated service functions:

```ts
// hooks/useLutList.ts
import { useQuery } from '@tanstack/react-query'
import { LutService } from '../api/generated/services.gen'

export const useLutList = () =>
  useQuery({ queryKey: ['lut-list'], queryFn: LutService.list })
```

Regenerate after any endpoint change:
```bash
yarn generate-api   # from repo root, requires backend running
```

---

## MUI + SCSS Integration

- `ThemeProvider` controls the palette (primary, secondary, error colors) and typography for light/dark mode
- Per-component styles use **CSS Modules** (`.module.scss`) — co-located with the component file
- Global tokens in `src/styles/_variables.scss` mirror MUI's theme spacing and breakpoints so both stay in sync
- MUI's `sx` prop is used only for **runtime dynamic styles** (e.g., `color: palette[hex]`); all static styles go in SCSS

---

## Three.js Model Viewer

`<ModelViewer glbUrl={string} />` wraps a Three.js canvas:

- `GLTFLoader` fetches the GLB from `/api/files/output/{filename}`
- Scene: `PerspectiveCamera` + `OrbitControls` (rotate, zoom, pan)
- Lighting: `AmbientLight` (0.6) + `DirectionalLight` (1.0, top-right)
- Resizes with a `ResizeObserver` on the container element
- `glbUrl` change → disposes old scene objects → loads new GLB

---

## Monorepo Scripts

Root `package.json`:

```json
{
  "private": true,
  "workspaces": ["frontend"],
  "scripts": {
    "dev":          "concurrently -n backend,frontend -c blue,green \"uvicorn backend.main:app --reload --port 7860\" \"yarn workspace frontend dev\"",
    "build":        "yarn workspace frontend build",
    "generate-api": "yarn workspace frontend run openapi-ts"
  },
  "devDependencies": {
    "concurrently": "^9.0.0"
  }
}
```

Initial VSCode SDK setup (run once):
```bash
yarn dlx @yarnpkg/sdks vscode
```
