# General Rules

## Project Structure

- Backend: `backend/` — FastAPI, Python 3.10+
- Frontend: `frontend/` — React 18, TypeScript, Vite
- Core logic: `core/`, `utils/`, `config.py` — **never modify these**

## Code Hygiene

- Prefer editing existing files over creating new ones
- Never create files outside `backend/` or `frontend/` unless explicitly asked
- Delete dead code — do not comment it out
- No comments unless the logic is genuinely non-obvious
- No docstrings on simple functions; only on public API boundaries

## Naming Conventions

| Context | Convention |
|---------|-----------|
| Python files | `snake_case.py` |
| Python classes | `PascalCase` |
| Python functions/variables | `snake_case` |
| Python constants | `UPPER_SNAKE_CASE` |
| TS/TSX files | `PascalCase.tsx` for components, `camelCase.ts` for utils/hooks |
| Folders | `kebab-case` |
| Hooks | always prefix with `use` |
| Zustand stores | suffix with `Store` (e.g. `useAppStore`) |
| SCSS modules | same name as component (`UserCard.tsx` → `UserCard.module.scss`) |

## Git

- Commit messages: `type(scope): short description` — e.g. `feat(converter): add color replacement endpoint`
- Types: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`
- Never commit generated files (`frontend/src/api/generated/`, `__pycache__/`)
