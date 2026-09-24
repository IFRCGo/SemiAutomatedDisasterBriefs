# ucl-comp0016-group-22-project

Annex automation project for the IFRC.

## Setting up

This project runs on [npm](https://www.npmjs.com/). Ensure that you have npm installed.

## Running the project

To install dependencies, run `npm install`.

To run the development server, use `npm run dev`.

## Dependencies

### Runtime dependencies

- @ifrc-go/icons
- @ifrc-go/ui
- @tanstack/react-query
- @togglecorp/fujs
- docx
- html2canvas
- jiti
- openapi-fetch
- react
- react-chartjs-2
- react-dom
- react-focus-on
- react-router-dom
- recharts
- sanitize-html

### Development dependencies

- @eslint/js
- @types/react
- @types/react-dom
- @types/sanitize-html
- @typescript-eslint/eslint-plugin
- @typescript-eslint/parser
- @vitejs/plugin-react
- eslint
- eslint-plugin-react
- eslint-plugin-react-hooks
- globals
- prettier
- typescript
- typescript-eslint
- vite

## Deployment

Running `npm run build` will:

1. Generate API types from the OpenAPI schema
2. Compile TypeScript and build with Vite

The output will be in `dist/`. To deploy, serve the contents of `dist/` using a static HTTP server like [nginx](https://nginx.org/en/), Apache, or Caddy.
