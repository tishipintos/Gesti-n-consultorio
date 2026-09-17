# Guía de trabajo del proyecto

## Documentación de Obsidian

El Vault existente es `Consultorio/` y forma parte del proyecto. Su entrada es `Consultorio/00 - Dashboard.md`. Obsidian y React trabajan sobre los mismos archivos: reutilizar este Vault, sin crear carpetas de documentación duplicadas.

### Lectura del proyecto: Obsidian primero

- Para entender o retomar el proyecto, consultar primero el Vault, no recorrer ni leer todos los archivos de código.
- Partir de `Consultorio/00 - Dashboard.md` y `Consultorio/06 - Mapa de la app.md`; seguir solo las notas y los módulos de `Consultorio/Mapa de la app/` relevantes para la tarea. Reutilizar el contexto ya leído cuando siga vigente.
- Abrir después únicamente los archivos de código necesarios para implementar o verificar el cambio, o resolver información faltante o desactualizada en las notas.
- Si el código contradice la documentación, verificar el comportamiento real y corregir puntualmente las notas afectadas, incluidos sus diagramas y enlaces.

- Cada vez que hagas un cambio importante en el código, comprobá si la documentación necesita actualizarse.
- Si cambia la arquitectura, actualizá `Consultorio/01 - Arquitectura.md`.
- Si agregás, eliminás o modificás significativamente componentes, actualizá `Consultorio/03 - Componentes.md`.
- Si agregás o modificás APIs, servicios o endpoints, actualizá `Consultorio/04 - API.md`.
- Si completás una tarea presente en `Consultorio/02 - Tareas.md`, marcala como completada (`- [x]`). Usá `- [ ]` para pendientes reales.
- Si tomás una decisión técnica importante, registrala brevemente en `Consultorio/05 - Decisiones.md`.
- No llenes la documentación con cambios triviales. Mantenela breve, clara y útil.
- Usá enlaces internos de Obsidian con formato `[[Nombre de nota]]` cuando corresponda.
- Antes de implementar tareas grandes, revisá `Consultorio/02 - Tareas.md` y las notas relevantes.
- Nunca sobrescribas notas personales o contenido escrito por el usuario salvo que sea estrictamente necesario. Conservá las secciones que parezcan escritas manualmente por él; integrá los cambios de forma puntual.
- No inventes información que no exista en el código. Diferenciá hechos comprobados, decisiones nuevas e incertidumbres; no atribuyas motivos históricos sin evidencia.

## Flujo de trabajo

1. Revisar la documentación relevante en Obsidian antes de modificar el proyecto.
2. Revisar el código afectado y respetar la estructura y el estilo actuales.
3. Implementar el cambio solicitado.
4. Ejecutar las verificaciones disponibles: `npm run lint` y `npm run build`. No hay un script de tests definido actualmente; informar cualquier verificación que no se pueda ejecutar.
5. Actualizar la documentación afectada según las reglas anteriores.
6. Resumir qué archivos de código y documentación cambiaron y los resultados de las verificaciones.

No agregar dependencias npm, sincronización externa ni scripts de sincronización para esta integración. No cambiar configuraciones internas de `Consultorio/.obsidian/` salvo que sea necesario. No modificar funcionalidades React por tareas de configuración documental que no lo requieran.
