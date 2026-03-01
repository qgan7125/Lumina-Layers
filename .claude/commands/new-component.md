Create a new feature component following the Lumina Studio component pattern.

## Usage
`/new-component <FeatureName>`

Example: `/new-component ColorPicker`

## Pattern (reference: `frontend/src/components/LUT/`)

Every feature component is a self-contained folder with exactly three files:

```
frontend/src/components/{FeatureName}/
├── {FeatureName}.tsx          ← component (arrow function, export default)
├── {FeatureName}.module.scss  ← co-located styles
└── hooks/
    └── use{FeatureName}.ts    ← co-located hook (named function export)
```

## Rules

**Component (`{FeatureName}.tsx`)**
- Arrow function: `const {FeatureName}: React.FC<Props> = ({ ... }) => { ... }`
- `export default {FeatureName}` at the bottom (NOT named export)
- Import hook from `./hooks/use{FeatureName}`
- Use `useNotify()` from `'../Notification'` for all success/error feedback — never local Snackbar state
- Use `<FileUpload>` from `'../FileUpload/FileUpload'` for any file input — never `<input type="file">`
- Use MUI `sx` prop only for runtime-dynamic values (e.g. a hex color from state); all static styles go in SCSS

**Hook (`hooks/use{FeatureName}.ts`)**
- Named function export: `export function use{FeatureName}() { ... }`
- Combines all related `useQuery` and `useMutation` calls for this feature into one function
- Imports generated API functions from `'../../../api/generated'`
- Returns a flat object: `{ data, isLoading, mutateAsync, isPending, ... }`
- Invalidates related query keys `onSuccess` where needed

**SCSS (`{FeatureName}.module.scss`)**
- First line: `@use 'variables' as *;` (`loadPaths` is configured in vite.config.ts — no relative path needed)
- Class naming: `.block`, `.block__element`, `.block--modifier`
- Max 3 levels of nesting — no deeper
- No `style` prop usage anywhere

**Import order inside `.tsx`:**
1. React and React ecosystem (`react`, `react-i18next`)
2. MUI components (`@mui/material/...`)
3. MUI icons (`@mui/icons-material/...`)
4. Internal hooks, stores, shared components
5. SCSS module (always last)

## Task

The argument provided is: $ARGUMENTS

1. Parse the feature name from the argument (PascalCase). The hook name is `use{FeatureName}`.
2. Identify which API endpoints this component will use by searching the generated SDK:
   ```
   frontend/src/api/generated/sdk.gen.ts
   ```
3. Create the three files under `frontend/src/components/{FeatureName}/`:
   - `hooks/use{FeatureName}.ts` — wire the relevant API calls
   - `{FeatureName}.module.scss` — scaffold the styles using variables
   - `{FeatureName}.tsx` — build the component using the hook, `useNotify`, and `FileUpload` where needed
4. After creating the files, print a summary showing the file paths and the API endpoints wired.

Do not create any additional files. Do not add the component to any route — leave that to the developer.
