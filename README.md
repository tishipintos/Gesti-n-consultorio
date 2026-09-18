# React + TypeScript + Vite

## Vista previa y Expo

La aplicación utiliza React DOM, React Router y Tailwind mediante Vite. Para verla
con la configuración completa actual, ejecutar `npm run dev`.

Expo tiene una entrada explícita en `src/main.tsx` y está limitado a web. Esto
evita que busque `App` desde `expo/AppEntry` con la estructura de pnpm. La vista
web de Expo aún necesita instalar sus dependencias web y configurar el procesador
PostCSS de Tailwind; no está lista hasta completar esos pasos. Expo Go nativo
requiere una adaptación adicional porque las pantallas usan elementos del DOM.

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
