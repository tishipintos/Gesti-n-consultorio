# React + TypeScript + Vite

## Celular: React Native y Expo Go

1. Instalar dependencias con `npm install`.
2. Ejecutar `npm start -- --clear` en la computadora.
3. Conectar el celular y la computadora al mismo Wi-Fi.
4. Abrir el QR con Expo Go en Android o con la cámara del iPhone.
5. Mantener la terminal abierta mientras se usa la app. Debe estar seleccionado
   Expo Go, no un development build. La versión de Expo Go debe admitir SDK 57.

La entrada `index.js` carga `src/entry.native.ts` en iOS/Android y registra
`src/native/NativeApp.tsx`. Las pantallas usan componentes React Native,
React Navigation y SQLite; no usan un WebView. Los turnos tienen calendario
integrado y selector de horarios; la fecha de nacimiento usa el selector nativo.

Funciones nativas: agenda por fecha, búsqueda y alta/edición/baja de pacientes,
historia clínica, creación/edición/baja de turnos, estados y pagos, recordatorios
de consultas/controles/pagos, cámara y galería, fotos por etapa y comparación
lado a lado de dos fotos. Los recordatorios son internos: no son notificaciones
push ni alarmas del sistema con la app cerrada.

Los datos se guardan localmente con `expo-sqlite/kv-store`. Las fotos se copian
al directorio de documentos de la app y se guardan referencias relativas para
no depender de la ruta del sandbox de iOS. La cámara pide permiso al usarse.
Los datos web siguen en localStorage: no hay migración automática ni
sincronización entre computadora y celular. Desinstalar/borrar los datos de
Expo Go puede eliminar la información local del teléfono.

## Diseño compartido con la web

La interfaz nativa reproduce la referencia móvil de la web: Manrope incluida en
el bundle (sin descargar fuentes al abrir), íconos Lucide, fondo crema y acentos
mostaza, encabezados centrados y navegación inferior flotante. El calendario
mensual permite cambiar de mes, volver a hoy y ver los indicadores de turnos.
Se conservan el directorio alfabético con avatares, la ficha con acciones
Fotos/Cita, la galería antes/después, los formularios en tarjetas y las
notificaciones agrupadas. Los permisos, cámara y selectores del sistema siguen
siendo controles nativos.

Los componentes visuales están en `src/native/chrome.tsx`, `MonthCalendar.tsx`,
`PatientGallery.tsx` y `WelcomeOverlay.tsx`; los estilos y fuentes en
`src/native/theme.ts`. En los formularios, iOS ajusta el teclado desde el
ScrollView, sin sumar otro desplazamiento por el encabezado. La barra inferior
y su espacio reservado se retiran al abrir el teclado.
La web original y los datos guardados no se modifican por estos cambios visuales.

El formulario de pacientes conserva las tres tarjetas de la web: nombre y
apellido; fecha de nacimiento, teléfono y email; historia clínica. La fecha
de nacimiento es opcional y está siempre visible; cancelar el selector no
modifica el valor. Los calendarios usan filas explícitas de siete días para
evitar que el domingo salte de columna por redondeos del ancho.

Desde la agenda, `SelectPatientScreen.tsx` permite buscar o crear un paciente
antes de abrir el turno. `AppointmentDatePicker.tsx` reproduce el calendario
del formulario web. El turno muestra el paciente elegido, fecha, hora, motivo
y notas; estado y pago se muestran al editar. Crear un paciente en este flujo
conserva la fecha elegida, y guardar el turno vuelve a la agenda de ese día.
Desde la ficha de un paciente se accede directamente al formulario.

Para cargar los cambios, reiniciar con `npm start -- --clear` y volver a abrir
el proyecto desde Expo Go.

## Vista web

`npm run dev` inicia la web original con Vite. `npm run web` inicia Expo web.
La entrada web sigue usando `src/main.tsx`, React DOM y React Router. Metro
procesa Tailwind mediante `postcss.config.mjs`; Vite conserva su plugin propio.
Los módulos `src/platform/*` seleccionan almacenamiento, UUID y eventos de
primer plano según la plataforma. El store, los tipos y las reglas de
recordatorios se comparten; las pantallas nativas viven en `src/native/`.

## Verificación

- `npm run lint`: análisis estático.
- `npm run build`: TypeScript y compilación web Vite.
- `npm run check:native`: tipos con resolución de módulos nativos.
- `npm test`: persistencia, fallos de guardado, eliminación relacionada y recordatorios.
- `npx expo export --platform all --output-dir dist-native`: bundles iOS, Android y web.

Validación de la adaptación: los cinco tests pasaron; TypeScript nativo, build
Vite y exportación de las tres plataformas completados. Lint pasa con advertencias
preexistentes. En Expo Go sobre emulador Android se verificaron arranque, alta de
paciente, creación de turno, registro de pago y persistencia al cerrar/reabrir.
La cámara/galería y la ejecución en iPhone físico requieren validación en dispositivo.

El Vault `Consultorio/` mencionado en AGENTS.md no está presente en este checkout.
La arquitectura de esta adaptación se documenta aquí, sin crear otro Vault.

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
