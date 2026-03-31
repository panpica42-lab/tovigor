# Repository Guidelines

## Project Structure & Module Organization
This repository is a `uni-app` application built on Vue 2. Core entry files live at the root: `main.js`, `App.vue`, `pages.json`, `manifest.json`, and `uni.scss`.

- `pages/`: page-level views grouped by feature, such as `freeTraining/`, `partTraining/`, `smartAssess/`, `games/`, and `serial-test/`.
- `components/`: shared UI, including modal and layout primitives.
- `utils/`: reusable logic and service modules, including serial-device integration in `serialService.js`.
- `static/`: bundled static assets.
- `docs/`: product and development notes.
- `_deprecated/`: legacy code kept for reference only; avoid new work here.

Register new routes in `pages.json` and keep feature-specific components close to the page that uses them when reuse is limited.

## Build, Test, and Development Commands
- `npm install`: install project dependencies.
- `npm run serve`: alias for local H5 development.
- `npm run dev:h5`: start the Vue CLI dev server for browser testing.
- `npm run build:h5`: create the production H5 build.

Example:
```bash
npm run dev:h5
```

## Coding Style & Naming Conventions
Follow the existing style: tab indentation in `.js`, `.vue`, and JSON-like config files. Use single quotes in JavaScript unless the file already differs. Prefer `camelCase` for variables and functions, `PascalCase` for globally registered components, and kebab-case file names for page and component `.vue` files such as `free-training-intro.vue`.

Keep page logic feature-local when possible. Shared device or business logic belongs in `utils/` or a reusable component.

## Encoding Rules
Treat all Chinese text in this repository as UTF-8. When editing `.vue`, `.nvue`, `.js`, or `.md` files that contain Chinese comments, UI copy, or logs, preserve readable Chinese and do not introduce mojibake or replacement text.

If a file already contains garbled Chinese, do not continue editing those broken strings blindly. First confirm the intended text, then repair or replace it in valid UTF-8 before making further content changes.

## nvue / Android Rules
Treat `nvue` pages on Android as a separate rendering environment from standard `.vue` pages. Do not assume WebView behavior applies to native rendering, especially for `video`, overlays, `z-index`, fixed/absolute positioning, and gesture handling.

For floating controls on `nvue` pages, prefer page-local implementations over reusing generic `.vue` UI components unless the component has already been verified on real Android devices. SVG or `image` rendering inside fixed `nvue` overlays can fail even when the same asset works in `.vue` pages.

When adjusting `nvue` fullscreen interactions, preserve the event-receiving structure and layer order whenever possible. Seemingly harmless layout or `z-index` refactors can change gesture hit-testing and break double-tap behavior. Verify `nvue` interaction changes on a real Android device before considering the task complete.

## Testing Guidelines
There is no automated test suite configured in `package.json` yet. Validate changes by running `npm run dev:h5` for local checks and `npm run build:h5` before submitting larger changes. For hardware-related work, use the serial test pages under `pages/serial-test/` and document manual verification steps in your PR.

## Commit & Pull Request Guidelines
Recent history favors concise, purpose-first commits, commonly with prefixes like `feat:`, `refactor:`, and `docs:`. Keep commits scoped to one change set and use imperative summaries, for example `feat: add action selection dialog`.

PRs should include:
- a short description of the user-facing or technical change
- linked issue or task ID when available
- screenshots or recordings for UI changes
- manual verification notes, especially for serial/device flows
