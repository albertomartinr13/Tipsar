# Tipsar — primera versión local

Red social de pronósticos en español. Esta entrega funciona localmente y no está publicada en internet. No recibe dinero ni ejecuta apuestas.

## Abrir

Requiere **Node.js 22.13 o superior**, preferiblemente una versión LTS compatible con `node:sqlite`. No necesita `npm install` ni servicios externos.

```sh
cd tipsar
npm start
```

Abre http://127.0.0.1:4173. Para detenerla: Ctrl+C. Los datos se conservan en `data/tipsar.sqlite`. No borres ni compartas esta carpeta: contiene cuentas e historial. No ejecutes dos servidores contra la misma base.

## Probar todo el recorrido

1. Registra tu cuenta, confirma mayoría de edad y solicita ser tipster en Ajustes.
2. Detén el servidor. En tu computadora, asigna a tu propia cuenta el rol administrador:
   `npm run admin -- tu-correo@example.com`
3. Reinicia con `npm start`. Entra al panel **Admin** y aprueba la solicitud de una segunda cuenta. No hay contraseña de administrador incluida.
4. Desde esa segunda cuenta, publica un pick en **Partidos**, con un evento futuro, cuota decimal y 0.5–5 unidades. También puedes cargar una captura desde “Subir ticket”. La captura pasa a revisión manual.
5. En otra sesión del navegador, inicia sesión con un tercer usuario, sigue al tipster y revisa **Siguiendo**. Cambia entre “Datos demo” y “Comunidad real” para ver el entorno del ticket.
6. En Admin, registra el marcador final del evento demo e indica fuente y motivo. El pick pasa a ganado/perdido/push. Puedes simular resultados futuros exclusivamente para practicar con los eventos demo.
7. Revisa el perfil. Corrige el marcador para comprobar cómo se recalculan las estadísticas y se conserva auditoría.
8. Los rankings oficiales necesitan 10 tickets por semana, 30 por mes o 50 históricos; si no hay muestra suficiente, no hay ganador. Para una prueba, el administrador puede cambiar estos mínimos. Restáuralos después.

Los perfiles ficticios de ejemplo son independientes de las cuentas reales. No tienen contraseñas utilizables ni permiten iniciar sesión. Sus tickets están identificados como demo. Un usuario real puede publicar un ticket demo; el ticket sigue perteneciendo al entorno demo y no entra en la clasificación real.

## Implementado

- Cinco secciones, diseño azul/blanco y adaptación a celular y escritorio.
- Autenticación con correo y contraseña real; scrypt con sal aleatoria, sesiones de servidor persistidas y cookies HttpOnly/SameSite. Sin credenciales fijas.
- Exploración pública; interacción con cuenta; solicitud, aprobación/rechazo y revocación de tipsters desde servidor.
- Catálogo demo de fútbol/NFL, alta administrativa de eventos reales o demo, mercados de ganador y total.
- Publicación previa al inicio según hora del servidor; valores bloqueados; protección de reenvíos por identificador de publicación. No existe una ruta para borrar o editar picks publicados.
- Capturas PNG/JPEG/WebP convertidas a PNG, reducidas y sin metadatos por el navegador; límites y comprobaciones PNG en servidor. Datos estructurados obligatorios y revisión manual. Sin OCR.
- Tickets visuales, exportación PNG y enlaces de tickets. Seguir, reacciones, comentarios, guardar, reportar y bloquear.
- Marcadores manuales, push, anulación, aplazamiento a revisión y correcciones con motivo/auditoría. Repetir un resultado no duplica tickets ni ganancias.
- Estadísticas y rankings con una sola implementación compartida en `domain.mjs`; curva acumulada y advertencia de muestra pequeña.
- Rankings combinados con el mismo peso para posición en ganancia y ROI; filtros de deporte, periodo y entorno.
- Notificaciones internas y preferencias por categoría; ajustes, cierre de sesión y eliminación de cuenta. Historial desidentificado conservado al eliminar la cuenta.
- Moderación que oculta publicaciones sin quitar su efecto estadístico.
- SQLite, limitación de solicitudes, validación del servidor, política de contenido, escape de texto y borradores de términos/privacidad dentro de la web.
- Manifest, iconos PNG y service worker para el cascarón PWA. Las respuestas de cuentas/API no se guardan en caché. Sin conexión se muestra un aviso, no se inventan resultados ni se aceptan publicaciones.

## Recuperación de contraseña

El formulario genera un token aleatorio de un solo uso, válido 15 minutos. **El envío de correo no está conectado.** Al ejecutar `npm start`, el operador encuentra el token en `data/reset-local.json` y debe entregárselo únicamente al titular después de verificarlo. El usuario elige “Ya tengo un token” e introduce el token y su nueva contraseña. Se invalidan las sesiones anteriores. No expongas este archivo ni uses este procedimiento local como recuperación pública.

## Reglas

- Fútbol: resultados de 90 minutos más añadido; no incluir prórroga/penales. NFL: final con prórroga. Quien registre resultados debe usar esta convención.
- Ganador NFL con empate: push. Total exactamente igual a la línea: push. Anulado/push: cero. Aplazado: revisión, sin resolver automáticamente.
- Ganancia: unidades × (cuota − 1), o −unidades al perder. Acierto: ganados/(ganados+perdidos). ROI: ganancia/unidades de tickets ganados o perdidos. Pendientes, revisión, push y anulados se excluyen de esos denominadores.
- Periodos por **publicación**, no por fecha de liquidación. Zona America/Mexico_City, semana lunes a domingo. Una corrección afecta el periodo original. Racha por publicación e identificador; una pérdida la rompe; push/anulado no cambian su valor.
- Clasificación general: `(posición por ganancia + posición por ROI) / 2`, menor es mejor. Empatados en una métrica comparten posición. Desempates de la general: ganancia, cantidad de tickets e identificador.
- La aprobación no acredita identidad ni rentabilidad. Todas las cuotas son declaradas.

## Pruebas

```sh
npm test
```

Pruebas de dominio e integración HTTP sin dependencias: permisos, recuperación del estado, validación de unidades, protección de reenvíos, liquidación, corrección, eventos cerrados, cancelación, aplazamiento y privacidad de contraseñas. Las pruebas crean su propia base temporal y no usan la base de la comunidad.

## Pendientes del alcance original

Esta es una base funcional para pruebas locales, no la totalidad del producto descrito en el encargo.

- Proveedor deportivo, sincronización programada, reintentos de proveedor y fuente automática de resultados: **no conectados**. No hay partidos reales preinstalados, marcadores en vivo ni extracción de casinos. Se pueden introducir eventos/resultados manualmente.
- Parlays, hándicap, props y liquidaciones complejas: **no habilitados**. Un mercado fuera de ganador/total requiere revisión manual.
- Correo de recuperación, confirmación de correo y notificaciones push: pendientes.
- Dinámicas de ascenso/mejor semana/mejor mes como módulos propios, carga paginada en servidor: pendientes. La interfaz limita el historial visible a los 30 tickets más recientes y los comentarios retornados a 200. Para una comunidad que crezca, implementar cursor de paginación y consultas SQL normalizadas antes de ampliar estos límites.
- Foto personalizada de perfil, filtros por fecha/competición, alertas de sincronización y resolución administrativa del estado de un reporte: pendientes.
- Prueba real de instalación PWA en iPhone/Android y compilaciones de tiendas: pendientes. Las notificaciones internas se actualizan al refrescar o interactuar, sin conexión en tiempo real.
- Moderación avanzada, analítica de seguridad, envío de correo, copias de respaldo automáticas y soporte multiinstancia: pendientes.

## Costos y servicios

La ejecución local no contrata ningún servicio. Usa el equipo y conexión del operador, sin una promesa de hosting gratuito. No se eligió proveedor deportivo: por tanto no se atribuye cobertura, licencia ni cuota gratuita a ninguno. Al elegirlo se deben verificar documentación, derechos de redistribución, deportes, mercados, datos finales y límites vigentes; conservar identificadores de proveedor y una separación entre datos reales y demo.

La base guarda el estado de esta pequeña comunidad como una transacción SQLite. Es deliberadamente de un solo proceso; antes de alojarla para público, normalizar tablas y migraciones, agregar correo, HTTPS, cookies Secure, respaldo, paginación, monitorización y revisión de privacidad. Los borradores legales necesitan datos del responsable y revisión antes de lanzar.

## Web, PWA y móviles

La elección es JavaScript web con servidor Node y SQLite: cero dependencias de terceros para arrancar y una sola interfaz reutilizable. La PWA es el primer camino móvil. El manifiesto no equivale a una aplicación publicada en tiendas.

Para instalar la PWA fuera de localhost hace falta alojarla con HTTPS. En iPhone se probará desde Safari/Añadir a pantalla de inicio; en Android desde un navegador compatible. La instalación depende del navegador y todavía no está certificada en dispositivos reales.

Para iOS/Android nativos, el siguiente paso es un contenedor como Capacitor que use este frontend, con el API alojado detrás de HTTPS y adaptaciones de autenticación/origen. **No se incluyen proyectos nativos ni compilaciones listas.** Después se requieren Xcode/Android Studio, identificadores de app, firma, cuentas de desarrollador, políticas de las tiendas para contenido relacionado con pronósticos y revisión legal. No se han abierto cuentas, pagado membresías ni enviado aplicaciones.

Referencias técnicas consultadas: https://nodejs.org/download/release/latest-jod/docs/api/sqlite.html y https://web.dev/learn/pwa/web-app-manifest .
