# React + TypeScript + Vite

## Celular: React Native y Expo Go

1. Instalar dependencias con `npm install`.
2. Ejecutar `npm start -- --clear` en la computadora.
3. Conectar el celular y la computadora al mismo Wi-Fi.
4. Abrir el QR con Expo Go en Android o con la c?mara del iPhone.
5. Mantener la terminal abierta mientras se usa la app. Debe estar seleccionado
   Expo Go, no un development build. La versi?n de Expo Go debe admitir SDK 57.

La entrada `index.js` carga `src/entry.native.ts` en iOS/Android y registra
`src/native/NativeApp.tsx`. Las pantallas usan componentes React Native,
React Navigation, SQLite y selectores nativos de fecha/hora; no usan un WebView.

Funciones nativas: agenda por fecha, b?squeda y alta/edici?n/baja de pacientes,
historia cl?nica, creaci?n/edici?n/baja de turnos, estados y pagos, recordatorios
de consultas/controles/pagos, c?mara y galer?a, fotos por etapa y comparaci?n
lado a lado de dos fotos. Los recordatorios son internos: no son notificaciones
push ni alarmas del sistema con la app cerrada.

Los datos se guardan localmente con `expo-sqlite/kv-store`. Las fotos se copian
al directorio de documentos de la app y se guardan referencias relativas para
no depender de la ruta del sandbox de iOS. La c?mara pide permiso al usarse.
Los datos web siguen en localStorage: no hay migraci?n autom?tica ni
sincronizaci?n entre computadora y celular. Desinstalar/borrar los datos de
Expo Go puede eliminar la informaci?n local del tel?fono.

## Vista web

`npm run dev` inicia la web original con Vite. `npm run web` inicia Expo web.
La entrada web sigue usando `src/main.tsx`, React DOM y React Router. Metro
procesa Tailwind mediante `postcss.config.mjs`; Vite conserva su plugin propio.
Los m?dulos `src/platform/*` seleccionan almacenamiento, UUID y eventos de
primer plano seg?n la plataforma. El store, los tipos y las reglas de
recordatorios se comparten; las pantallas nativas viven en `src/native/`.

## Verificaci?n

- `npm run lint`: an?lisis est?tico.
- `npm run build`: TypeScript y compilaci?n web Vite.
- `npm run check:native`: tipos con resoluci?n de m?dulos nativos.
- `npm test`: persistencia, fallos de guardado, eliminaci?n relacionada y recordatorios.
- `npx expo export --platform all --output-dir dist-native`: bundles iOS, Android y web.

Validación de la adaptación: los cinco tests pasaron; TypeScript nativo, build
Vite y exportación de las tres plataformas completados. Lint pasa con advertencias
preexistentes. En Expo Go sobre emulador Android se verificaron arranque, alta de
paciente, creación de turno, registro de pago y persistencia al cerrar/reabrir.
La cámara/galería y la ejecución en iPhone físico requieren validación en dispositivo.

El Vault `Consultorio/` mencionado en AGENTS.md no est? presente en este checkout.
La arquitectura de esta adaptaci?n se documenta aqu?, sin crear otro Vault.

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
