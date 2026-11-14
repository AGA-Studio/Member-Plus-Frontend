# Member+ — Memoria del proyecto (para agentes)

> Léelo completo antes de escribir código. Resume el wiki del equipo (Outline) al **2026-11-11**, después de publicarse el MVP v0.1.
> Si algo aquí contradice el wiki, **manda el wiki** (ver sección 14). Si encuentras algo desactualizado, corrígelo aquí.
> Este repo es **solo el frontend**. El backend vive en otro repo.

## 1. Qué es

**Member+** es un **SaaS multi-negocio** de membresías/lealtad. Nosotros operamos la plataforma; cada negocio que la contrata es un inquilino con sus propios datos. Un negocio administra clientes, tarjetas de membresía por nivel y compras con descuento, puntos y cashback. El empleado cobra en caja leyendo el **QR impreso** de la tarjeta con un lector (ESP32-S3 con cámara) o con la webcam del navegador.

- Proyecto académico: Universidad Tecnológica de Tijuana · Desarrollo Web Integral · Grupo 9C. Se demuestra de principio a fin; no es un producto comercial.
- Usuario de referencia ("Juan López"): gerente de 35 a 45 años, poca experiencia con computadoras, usa sobre todo el celular. **La UI debe ser clara y con pocos pasos.**
- **No hay reconocimiento facial en ningún punto del sistema** (decisión del 11 nov 2026). El lector identifica la tarjeta, no a la persona. No se guardan fotos ni datos biométricos. Ver sección 11.
- Idioma: el código siempre en inglés. Los textos al usuario **nunca van fijos en el código**: se leen de archivos de traducción por locale (i18n), con **español (`es`) por defecto**; el idioma se detecta según el navegador. Detalle en `AGENTS.md`.

## 2. MVP v0.1 — "la rebanada de caja" (lo que se construye ahora)

Fuente: https://wiki.neyzt.org/doc/mvp-7JeVbQCyWI · **Estado en el wiki: "Propuesta, pendiente de aprobación del equipo".** Mientras no se apruebe otra cosa, es la referencia de alcance y manda sobre la lista de prioridades de *Pantallas*.

| Campo | Valor |
|---|---|
| Inicio | 11 nov 2026 |
| Congelamiento | **lunes 1 dic 2026** (tag `v0.1-mvp`) |
| Presentación | **jueves 3 dic 2026** |

**Tesis:** lo que se demuestra no son 18 pantallas, sino que **dos negocios viven en el mismo sistema sin verse** y que **una compra en caja calcula descuento, puntos y cashback en segundos**.

### Pantallas del frontend dentro del MVP
| # | Pantalla | Nota |
|---|---|---|
| 1 | Inicio de sesión | JWT en cookie httpOnly; sin registro público |
| 7 | Clientes | Alta, consulta, edición y baja. Sin fotos |
| 8 | Ficha del cliente | |
| 9 | Membresías | Alta, renovación, cancelación y registro de pago. **QR imprimible** y código corto tecleable |
| 10 | Niveles y beneficios | Editables; tres niveles de plantilla por negocio |
| 15 | Movimientos | **Solo lectura.** Cierra el relato de la demo |
| 16 | Caja | Lee el QR con el lector o la webcam, o se teclea el código |
| 17 | Registrar compra | Monto y concepto; muestra descuento, puntos y cashback |
| 18 | Comprobante | |
| 3 | Negocios (panel de plataforma) | Solo lectura: lista de negocios con su uso |

**Ambigüedad a confirmar:** el guion de la demo empieza con "Panel con métricas del negocio" (pantalla 6), pero el MVP no la lista en "Dentro". Preguntar antes de construirla.

### Fuera del MVP (no construir sin consultar)
2 Registro de negocio (el alta va por `seed.sql`) · 4 Detalle del negocio · 5 Planes · 11 Usuarios · 12 Dispositivos · 13 Configuración (nombre y logo fijos en seed) · 14 Plan y uso · portal del cliente · catálogo o inventario · canje de puntos · sucursales · app móvil · reportes · reconocimiento facial.

### Hitos (propuestos)
| Hito | Fechas | Lo que toca al frontend |
|---|---|---|
| H0 Esqueleto | 11–14 nov | Compose y CI; sin UI de producto |
| H1 Auth y datos | 15–19 nov | Login, roles, clientes, membresías con QR imprimible, niveles |
| H2 Caja | 20–23 nov | Pantallas 16 a 18 y movimientos |
| H3 Panel, IoT y deploy | 24–27 nov | Panel de plataforma, despliegue; **corte del ESP32 el 25 nov** |
| H4 Congelar | 28 nov–1 dic | Ensayos, datos definitivos, respaldo en localhost, video de 2 min |

Si el tiempo se acorta, orden de corte: panel de plataforma → filtros de movimientos → renovar y cancelar en la UI → ESP32. **No se corta:** login, aislamiento entre negocios y caja.

### Criterios de aceptación con número
- Login → panel en **≤ 2 s**; buscar tarjeta por código en **≤ 1 s**; registrar compra → comprobante en **≤ 2 s**.
- **0 filas** de otro negocio (test automático y demo manual con dos negocios).
- `docker compose up` desde cero en ≤ 3 min, sin internet.
- El QR impreso se lee con el lector **y** con la webcam del navegador.

### Guion de la demo (9 pasos, ~10 min)
1. Login como admin del negocio A · 2. Panel con métricas · 3. Alta de cliente y tarjeta Oro, se imprime el QR · 4. Subir el descuento de Oro de 15 % a 20 % · 5. Entrar a caja como empleado y **escanear la tarjeta impresa** · 6. Registrar compra de $1,000 y mostrar el desglose · 7. Comprobante y movimientos · 8. Login como admin del negocio B: no existe nada de A · 9. Panel de plataforma con los dos negocios.

Cuentas de demo: dueño de plataforma, admin A, admin B y empleado A.

## 3. Estado actual del repo

- Código de la rebanada de caja **en marcha** (PR #10 abierto). `npm run lint`, `tsc` y `npm run build` pasan. Probado en Chrome con Playwright (script de flujo completo, sin errores de consola).
- Hecho y verificado contra Figma:
  - Base: `src/components/ui/` (Button, TextField con ojo de contraseña, Alert, Badge, Switch, Spinner, Logo, MembershipCard con QR real), `src/lib/cx.ts`, token `--aspect-card` y animación `--animate-scan` en `globals.css`, `formattingLocales` (es → es-MX, en → en-US) para que los montos salgan como `$1,250.00`.
  - Pantalla 1 Login: `src/app/login`, `src/features/auth/` (acción de servidor, estados error y cargando, panel de marca).
  - Pantalla 16 Caja: `src/app/caja/page.tsx`, `src/features/cashier/` (visor de cámara con `jsqr`, campo de código, estados no encontrada, cámara bloqueada y buscando).
  - Pantalla 17 Registrar compra: `src/app/caja/[code]`, formulario con resumen en vivo (`src/lib/pricing.ts`, en centavos), interruptor de cashback, botón fijo abajo en móvil.
  - Pantalla 18 Comprobante: `src/app/caja/comprobante/[id]`.
  - **Cambio (13 nov 2026):** las pantallas 16 y 17 ahora son una sola en `/caja`. Entra con datos vacíos; el botón "Escanear tarjeta" abre un modal con el visor y el campo de código, y al encontrar la tarjeta se rellena la pantalla (`/caja?code=…`). `/caja/[code]` solo redirige. El Figma aún tiene las dos pantallas separadas.
  - Acceso: `src/proxy.ts` protege `/caja` con la cookie `mp_session`; `src/lib/session.ts` crea, borra y exige sesión.
- **Login y sesión REALES (rama `feature/real-login`, sin commit):** el login llama a FastAPI por la reescritura `/api/*` (`API_INTERNAL_URL` en `.env.local`, ver `.env.example`); la cookie `access_token` la emite el backend y es httpOnly. Next solo la lee: `src/lib/session.ts` consulta `/api/v1/auth/me` (una vez por petición, con `cache`). Cerrar sesión llama a `POST /auth/logout` (revoca el token). Errores del login: 401, 403 suspendido o inactivo, 429 con minutos de espera y red caída. El rol `platform` se rechaza en el login porque aún no hay pantallas de plataforma. El campo ahora es **Correo electrónico** (el backend usa correo); Figma ya se actualizó (textos del login, estados y notas, 12 nov 2026).
- **Pantalla de plataforma (14 nov 2026):** `/plataforma` para el rol `platform` (dueño de la plataforma): lista de negocios con estado, número de clientes y fecha de alta, búsqueda y filtro por estado, solo lectura. El login ya deja entrar a ese rol. Un cajero o admin que entra ahí vuelve a su pantalla, y la plataforma no entra a `/caja` ni al panel del negocio.
- **Animación de entrada al iniciar sesión (14 nov 2026):** al terminar la carga del botón, una pantalla del color de marca cubre todo con el logo de Member+ al centro; el logo vuela al lugar donde está en la app (el logo del sidebar del admin, el de la cabecera de plataforma, o el recuadro del negocio / avatar en caja y celular) y desde ahí un círculo se expande y descubre la app. Dura unos 2 s en total. Vive en `src/features/auth/entry-transition.tsx`, dentro del layout raíz, y usa la Web Animations API (sin librerías). Es una excepción deliberada a la regla de 300 ms de `AGENTS.md`: es una animación de marca de una sola vez, no una transición de interfaz. También se muestra al abrir la app con la sesión ya iniciada (carga completa de una URL de la app): el layout raíz lee la cookie de sesión y pinta la pantalla de marca desde el primer cuadro, así que no hay destello de la app. No se repite al recargar (F5, se detecta por la cabecera `Cache-Control: max-age=0`), ni en `/membresias/imprimir`, ni en la tarjeta pública. Con movimiento reducido se quita sin animar. Los elementos de destino llevan `data-entry-target`. **Salida (cerrar sesión):** al confirmar, el diálogo se cierra, la app se contrae con un círculo hacia su logo (o recuadro/avatar), el logo viaja al centro sobre la pantalla de marca y esta se desvanece sobre el login (~1.4 s); es el espejo del descubrimiento, no una copia. Vive en el mismo proveedor (`exit`).
- **Conectado al backend real (13 nov 2026):** sesión (con `business` de `/auth/me`), niveles, clientes, caja, comprobantes y movimientos usan la API de `../Member-Web` (`src/lib/api/backend.ts` reenvía la cookie de sesión). Solo la entrega de la tarjeta (`src/lib/api/card-delivery.ts`) sigue simulada. Los niveles se pagan (`price_cents`), no hay puntos mínimos ni "caja" (movimientos muestra al cajero). Credenciales de demo: `admin@cafe-aurora.mx`, `caja@cafe-aurora.mx`, `admin@gimnasio-titan.mx`, `owner@memberplus.mx` (plataforma, no entra al frontend), contraseña `demo12345`.
- **Entrega de la tarjeta (13 nov 2026):** página pública `/tarjeta/<token>` (sin sesión) con botones de Google Wallet, imagen PNG y PDF (se generan en el navegador con `html-to-image` y un PDF armado a mano en `src/lib/card-export.ts`). En el panel, "Entregar tarjeta" en la ficha (enviar por correo o copiar enlace) e interruptor "Enviar tarjeta por correo" al crear la membresía. Apple Wallet queda fuera. Todo con datos simulados en `src/lib/api/card-delivery.ts`; lo que falta del backend está en la sección 13 del contrato en Outline.
- **Contrato para el backend:** el documento "Contrato de API que necesita el frontend" en Outline (MemberPlus › Desarrollo, https://wiki.neyzt.org/doc/contrato-de-api-que-necesita-el-frontend-xbPbNhd4JU, 12 nov 2026) lista los endpoints, formas, fórmulas y 9 decisiones abiertas que el frontend necesita; la tabla de la sección 10 dice qué archivo de `src/lib/api/` se cambia por cada endpoint.
- **Backend:** clonado en `../Member-Web` (FastAPI, SQLModel, PostgreSQL 18, Python 3.14, `uv`). Local: `uv sync`, `uv run alembic upgrade head`, `uv run python -m scripts.seed`, `uv run uvicorn main:app --port 8000`; con `DATABASE_URL` vacío usa SQLite. Ya tiene auth, usuarios, clientes, niveles, caja, movimientos y plataforma; falta la entrega de la tarjeta (sección 13 del contrato). Sus commits van en español (`feat: agregar ...`) y sin firmas de IA.
- Dependencias nuevas: `qrcode.react` (QR de la tarjeta) y `jsqr` (leer el QR con la cámara).
- **Dónde me quedé / siguiente:**
  1. Revisión visual con el usuario de las pantallas 1, 16, 17 y 18 en navegador (el visor con cámara real aún no se ha visto con un QR de verdad; en pruebas solo se usó cámara falsa).
  2. ~~Vincular esta caja~~: descartada, Dispositivos (12) está fuera del alcance (`docs/REVISION.md`) y la caja del navegador entra con el login del empleado. Pantallas de error y sesión vencida: hechas en la rama `feature/system-errors`.
  3. Pendientes de código: insignia "Lector conectado" es fija (no hay estado de lector), lector ESP32 sin integrar, `Cancelar` de Registrar compra no existe en el código aún (Figma lo muestra arriba a la derecha), tarjeta compacta móvil sin iniciales.
  4. Después: panel del negocio (pantallas 6 a 15) y plataforma (2 a 5), fuera de la rebanada del MVP.
- **Panel del administrador (rama `feature/business-panel`, sin commit, apilada sobre la del PR #10):**
  - Roles: el rol sale del backend (`employee` → cajero → `/caja`, `admin` → `/clientes`). `src/lib/session.ts` tiene `requireUser(roles)`; `/` redirige según el rol; `src/proxy.ts` protege también `/clientes`, `/membresias`, `/niveles` y `/movimientos`. Un cajero que entra al panel vuelve a `/caja`.
  - Estructura: `src/app/(business)/` con barra lateral en escritorio y navegación inferior en móvil (`src/features/business/`).
  - Pantalla 7 Clientes: búsqueda con espera, filtros por nivel y estado, paginación, tabla en escritorio y lista en móvil.
  - Pantalla 8 Ficha: tarjeta, datos, cifras, compras, editar datos, cancelar membresía con confirmación e imprimir tarjeta. Solo existe la sección Compras; las pestañas Puntos y cashback y Datos no se hicieron.
  - Pantalla 9 Membresías: pestañas con conteo, búsqueda, filtro de nivel, "Nueva membresía" (formulario con errores) y hoja imprimible en `/membresias/imprimir` (acepta `?code=`).
  - Pantalla 10 Niveles: cuatro niveles con panel lateral (hoja desde abajo en móvil) para editar; los cambios afectan las compras nuevas en caja.
  - Pantalla 15 Movimientos: resumen, búsqueda, filtro por caja, tabla y lista agrupada. Sin filtro de periodo (los datos de prueba son relativos a hoy).
  - Falta: Panel (6) y el resto de pantallas del administrador quedan fuera del MVP; pestañas de la ficha; menú de fila (⋯); periodo en Movimientos; botón Cancelar de Registrar compra; la cookie JWT real.
  - Movimiento: `src/lib/motion.ts` (`revealClasses`) y `src/components/ui/reveal.tsx` dan la entrada escalonada (40 ms, 250 ms) a cada bloque del panel; Alert y EmptyState entran con opacidad. La caja (16 a 18) NO lleva animación de entrada porque `docs/REVISION.md` lo tiene como decisión cerrada; el usuario quiere animarla, pero primero hay que cambiar la casilla en el wiki y en `REVISION.md`, y luego añadir `Reveal` en `src/app/caja/` (pendiente, en un PR aparte). Solo sus esqueletos hacen un fundido corto (`LoadingRegion quick`). `AGENTS.md` regla 9 y `BRAND.md` sección 10 lo exigen en todo lo nuevo.
  - Esqueletos de carga: `loading.tsx` en cada ruta con datos (`clientes`, `clientes/[code]`, `membresias`, `niveles`, `movimientos`, `caja/[code]`, `caja/comprobante/[id]`) con `Skeleton` y `LoadingRegion`.
  - Estructura fija tipo SPA: `h-dvh overflow-hidden` con `ScrollArea` (el `main` hace scroll por dentro y vuelve arriba al cambiar de ruta); barra lateral, cabecera y navegación inferior no se mueven. Los esqueletos entran con fundido (`LoadingRegion`). Cerrar sesión pide confirmación (`LogoutButton`, en `src/features/auth/`). Toasts: `ToastProvider` en el layout raíz, `useToast()` y `?toast=<clave>` tras redirecciones (`FlashToast`, claves en `src/lib/toast-keys.ts`).
  - **Revisión fina contra Figma (rama `fix/figma-fidelity`, sin commit, apilada sobre `feature/real-login`):** se compararon las 9 pantallas codificadas lado a lado (escritorio y móvil). Corregido: titular del login en tres líneas y hoja móvil con 40 px de traslape; visor de la caja con degradado, chips y punto verde, alto 360 en móvil y cabecera de 64 px en móvil; Registrar compra con columnas de 420 y 560 px, botón Cancelar, avatar y línea "Vigente hasta"; comprobante con "Nuevo saldo" y "Hoy,"; panel sin cabecera móvil (el avatar con iniciales de cada título abre el cierre de sesión), filas con avatar y chevron, listas a todo el ancho en móvil, textos "Nivel: Todos"; ficha con pestañas (Compras, Puntos y cashback, Datos), distribución móvil como Figma y diálogos compartidos (`customer-dialogs.tsx`); Movimientos con filtro de periodo (7, 30, 90 días o todo), descarga de CSV (acción de servidor) y agrupación por día en móvil. Pendiente a propósito: menú ⋯ de las filas de Membresías, grupo "Administración" y los ítems sin pantalla del menú lateral, y los módulos sin diseño de móvil (Panel).
  - **Errores del sistema (rama `feature/system-errors`, sin commit; Figma página 19):** `not-found.tsx` (404, también para un cliente de otro negocio), `error.tsx` y `global-error.tsx` (con Reintentar y Volver al inicio), ruta `/sin-conexion` cuando el backend no responde (`requireUser` distingue sesión inexistente, vencida y servidor caído), toast "Tu sesión venció" al volver al login y "No tienes acceso a esa pantalla" al entrar a una ruta de otro rol. `toastTones` en `src/lib/toast-keys.ts` define el tono de cada aviso.
  - Probado con Playwright (flujo completo de crear, editar, cancelar, editar nivel, imprimir, roles y la caja); `lint`, `check:tokens`, `messages:check`, `typecheck` y `build` pasan.
- **Adaptar al `main` del 12 nov 2026** (CI, Docker y `docs/REVISION.md` llegaron de otro compañero; ya fusionado en local y pasan `lint`, `check:tokens`, `messages:check`, `typecheck` y `build`):
  1. Auth: la cookie httpOnly con el JWT la emite FastAPI, no Next. Hoy `src/lib/session.ts` la crea en Next con un token falso; al conectar el API, el login debe llamar a `/api/...` (Next lo reescribe a `API_INTERNAL_URL`) y Next solo leer la cookie. Sin rutas API propias en Next.
  2. Alcance del MVP según `docs/REVISION.md`: pantallas 1, 7, 8, 9, 10, 15, 16, 17, 18 y 3 (solo lectura). Las 2, 4, 5, 11, 12, 13 y 14 están diseñadas en Figma pero fuera de lo que se construye ahora. Siguiente a codear tras la caja: 7, 8, 9, 10 y 15.
  3. El PR debe avisar que toca archivos compartidos: `package.json`, `package-lock.json`, `src/app/globals.css`, `messages/es.json` y `messages/en.json`.
  4. Puntos: el MVP asume historial de movimientos y saldo calculado; los mocks guardan un saldo fijo.
- Decisión tomada solo para poder construir (confirmar con el equipo): una tarjeta vencida o cancelada deja registrar la compra con aviso y **sin beneficios**; el cashback ganado se calcula sobre el monto ya con descuento, sin restar el saldo usado; puntos = 1 por cada $10 (redondeo hacia abajo), cashback redondeado al centavo.
- Remote: `https://github.com/AGA-Studio/Member-Plus-Frontend.git` (rama `main`).
- CI propio desde el 12 nov 2026: `lint` (+`check:tokens`), `typecheck`, `messages` y `build` en cada PR, más una imagen `standalone` en GHCR con `image.yml`. Detalle en `docs/CI.md` y `docs/DEPLOY.md`.
- Flujo de git del equipo: **`main` es la única rama** (ya no existe `develop`). Ramas `feature/*`, `fix/*` o `docs/*` efímeras, **todo por PR**, sin commits directos a `main`. (Los agentes no hacen commit ni push sin que el usuario lo pida: `AGENTS.md` regla 4.)

## 4. Stack de ESTE repo

| Pieza | Valor |
|---|---|
| Framework | Next.js **16.4.6**, App Router, `src/app/` (Node 22) |
| UI | React 19.3.0, Tailwind CSS 4.3.3 vía `@tailwindcss/turbopack` |
| Lenguaje | TypeScript estricto, alias `@/*` → `./src/*` |
| i18n | `next-intl` 4.14.10, sin prefijo de locale en la URL; `es` (default) y `en`; textos en `messages/`, lógica en `src/i18n/` |
| Íconos | `lucide-react` (única librería permitida) |
| Fuentes | Montserrat (titulares), Geist (texto), Geist Mono (códigos), con `next/font/google` |
| Lint | ESLint 9 + `eslint-config-next` |
| Config especial | `next.config.ts`: `cacheComponents: true`, `partialPrefetching: true`. El layout raíz exporta `instant = false` porque el idioma sale de cookie y encabezados |
| Scripts | `npm run dev` · `build` · `start` · `lint` · `typecheck` · `messages:check` · `check:tokens` (no hay tests aún) |

**⚠️ Este Next.js NO es el que conoces** (ver `AGENTS.md`): APIs y convenciones pueden diferir. **Antes de escribir código de Next, lee la guía relevante en `node_modules/next/dist/docs/`** (`01-app/` es el App Router). Con `cacheComponents` activo, leer cookies o encabezados fuera de `<Suspense>` rompe el prerender.

## 5. Identidad y sistema de diseño

**Ver `BRAND.md`** (fuente única de diseño) y su copia en el wiki: https://wiki.neyzt.org/doc/identidad-de-marca-Fpod2zyJ4j

- Esencia: **"Cada cliente reconocido, cada cobro rápido."** Dirección: **"Claridad premium"**. Tema claro por defecto; modo oscuro solo manual con `data-theme="dark"`, nunca según el sistema.
- Tokens de color, tipografía, radios, sombras y anchos ya están en `src/app/globals.css`. La paleta por defecto de Tailwind está desactivada: se usan tokens (`bg-surface`, `text-muted`, `bg-primary`...).
- Voz: "tú", sin exclamaciones, botones con verbo en infinitivo, campos opcionales con "(opcional)".
- Logos en `src/assets/brand/` (PNG con transparencia; se importan con `next/image`): `logo-on-light.png`, `logo-on-dark.png`, `icon-on-light.png`, `icon-on-dark.png`. Favicon e íconos: `src/app/favicon.ico`, `icon.png`, `apple-icon.png`. Los logos son raster, no vectores. Wiki: https://wiki.neyzt.org/doc/logos-e-iconos-1nQyelGFas
- El logo de Member+ es de la plataforma; cada negocio tiene su propio logo y nombre.
- Pendiente: construir los componentes (fases A, B y C de `BRAND.md`), el interruptor de tema, el color por negocio (`--tenant-primary`) y la imagen Open Graph.

## 6. Arquitectura general (sistema completo)

```
Navegador (este repo: Next.js, cliente puro)
        │  HTTPS, cookie httpOnly (JWT)
        ▼
FastAPI (repo backend: AGA-Studio/Member-Web)  ──►  PostgreSQL 18
        ▲
        │  HTTPS + token de dispositivo
ESP32-S3 + cámara (solo lee el QR) o webcam del navegador
```

- Backend: FastAPI (Python 3.14), router → servicio → repositorio; SQLAlchemy sync. Rama `main` con tags de versión.
- **Next es cliente puro**: toda la lógica va en FastAPI. **No crear rutas API ni lógica de negocio en Next.**
- Sin Supabase: JWT propio y Postgres 18 en Compose.
- Docker Compose levanta API y BD; el frontend corre aparte en desarrollo.
- Hosting: Coolify en servidor propio con Cloudflare. **App en `memberplus.neyzt.org`** (aún sin crear) y **API en `api-memberplus.neyzt.org`** (ya sirviendo; guion y no punto, porque el certificado de Cloudflare cubre un solo nivel). El navegador llama `/api/*` y Next lo reescribe al API. **Localhost con Docker de respaldo obligatorio** para la demo.
- **El contrato de la API aún no existe** y el esquema de BD tampoco. Sin eso el frontend trabajaría a ciegas: pedir a backend rutas, payloads y errores por módulo antes de integrar.

## 7. Multi-tenant (regla más importante de la UI)

- Un solo despliegue, muchos negocios. `negocio_id` en cada tabla, tomado **del token, nunca de lo que mande el cliente**. Nunca lo pidas ni lo envíes desde el frontend.
- **El negocio NUNCA se elige en pantalla**: sale del usuario autenticado. Sin selector de negocio ni subdominios.
- Nombre y logo del negocio aparecen en todas sus pantallas (en el MVP, fijos por seed). Colores por negocio, después.

### Roles (3)
1. **Dueño de plataforma** (nosotros): ve negocios, estado, uso y métricas. **No ve datos de clientes** (decisión marcada ✅).
2. **Administrador del negocio**
3. **Empleado de caja**

El cliente final **no tiene cuenta**.

## 8. Pantallas (18)

Fuente: https://wiki.neyzt.org/doc/pantallas-PRVZeE3xY6 (se retiró la antigua "Verificación" y se renumeró la caja). Todas funcionan en computadora y celular.

**Acceso:** 1 Inicio de sesión · 2 Registro de negocio.
**Plataforma:** 3 Negocios · 4 Detalle del negocio · 5 Planes.
**Admin del negocio:** 6 Panel · 7 Clientes · 8 Ficha del cliente · 9 Membresías (con QR imprimible) · 10 Niveles y beneficios · 11 Usuarios · 12 Dispositivos · 13 Configuración · 14 Plan y uso · 15 Movimientos.
**Caja:** 16 Caja · 17 Registrar compra · 18 Comprobante.

El orden de entrega que manda es el del **MVP** (sección 2), no la lista de prioridad de *Pantallas*.

### Notas de interfaz
- **Sin verificación de identidad.** La caja muestra **nombre y nivel en grande** para que el empleado reconozca al cliente. Es disuasión, no verificación.
- El **código de la tarjeta debe ser corto y tecleable** (no un UUID); el QR codifica solo ese código. Formato (longitud y alfabeto) aún por definir.
- Estados vacíos, de error y de carga aún no están diseñados: se resuelven por pantalla con las reglas de `BRAND.md`.

### Flujo de caja
Empleado entra a Caja → lee el QR con el lector o la webcam (o teclea el código si falla) → el sistema muestra cliente, nivel y vigencia → captura monto y concepto → se calculan descuento, puntos y cashback → comprobante y queda en movimientos.

## 9. Reglas de negocio

- **Compra = solo monto + concepto libre.** Sin catálogo, artículos ni inventario.
- Cada negocio define **sus propios niveles**; Básico/Plata/Oro son plantilla inicial. Mayor nivel = más beneficio y más costo.
- Beneficios por nivel: % descuento, puntos y cashback. Se aplican **a la vez** si el negocio los habilitó.
- **Orden de cálculo:** descuento primero; puntos y cashback sobre el monto **ya descontado**. Los puntos no son dinero.
- **Cashback:** si el negocio lo habilita, es un saldo que se guarda y se descuenta en la siguiente compra **si el cliente lo aprueba**.
- **Puntos = historial de movimientos**; el saldo se calcula (supuesto del MVP).
- El nivel sube **por cobro**, no por acumular puntos.
- Tarjeta = membresía: una sola entidad (cliente, nivel, estado, vigencia, código). **Una tarjeta por cliente.** Id único global y correlativo por negocio para imprimir.
- Vigencia (meses) y precio configurables por negocio; renovación manual. Pagos de membresía: monto, fecha, método y quién los registró, sin pasarela.
- Renovar extiende la vigencia; cancelar da de baja; ambos quedan en historial y movimientos.
- Los beneficios se aplican si la tarjeta está **activa y vigente**.
- Si el lector falla, el empleado teclea el código y la operación continúa igual.
- ⚠️ **Falta el ejemplo numérico resuelto** (compra de $1,000 en un nivel, con redondeo y saldo de cashback). Sin él el criterio de aceptación no se puede verificar: pedirlo antes de mostrar cálculos en pantalla.

## 10. Autenticación, seguridad y hardware

- JWT en **cookie httpOnly** emitido por FastAPI; Argon2id; **sin NextAuth**.
- El lector (ESP32) usa un **token propio de dispositivo**, revocable y atado al negocio; el login del empleado no sirve para eso.
- HTTPS en todo; el ESP32 con CA fijada si alcanza la RAM, si no HTTP solo en red local.
- Panel de plataforma detrás de Cloudflare Access o con login propio.
- Los datos son del negocio; Member+ solo los procesa. Hacen falta dos avisos de privacidad (el nuestro y el del negocio a sus clientes).
- Respaldos: `pg_dump` diario + restic.
- **ESP32-S3** (N16R8 con cámara, modelo exacto por confirmar): solo lee el QR y hace `POST` del código. **Corte el 25 nov:** si no hay prueba de concepto, la caja usa la **webcam del navegador** y el ESP32 queda como demo aparte.
- **Implicación para el frontend:** hay que poder **leer el QR con la webcam desde el navegador** (y teclear el código). Aún no hay librería elegida: preguntar antes de agregar una dependencia.

## 11. Decisiones y conflictos

### Decididas (✅ en el wiki)
- Sin reconocimiento facial en ningún punto. **RF-11 retirado** (su ID no se reutiliza); RNF-02 ya no menciona imágenes.
- Dueño de plataforma no ve datos de clientes.
- Compra = monto y concepto; cashback como saldo; orden de cálculo; niveles por negocio.
- Identificación en caja por QR o tecleo del código.
- Auth: JWT en cookie httpOnly + Argon2id.
- Repositorios separados; hosting en Coolify; datos de demo con dos negocios.

### Abiertas (el MVP las asume, pero no están aprobadas)
- **Alta de negocio:** el MVP la hace por script/`seed.sql`, sin formulario público (la pantalla 2 queda fuera).
- **Planes y cobro:** fuera del prototipo, sin pasarela.
- **Puntos como historial** (campo vs historial).
- **Next como cliente puro** sin rutas API.
- **SQLAlchemy sync** vs async (backend).
- **Placa ESP32-S3 exacta**; Wi-Fi, energía y montaje sin responsable.
Si alguna se decide distinto, se corrige el MVP, no la casilla.

### Documentos desactualizados
1. **ERS: no usar.** Vigente: *Requisitos de referencia* + *MVP* + *Pantallas* + *Decisiones por validar*.
2. **Calendarios de Etapa 2 y de la Guía son de relleno.** Los hitos del MVP y el Kanban son el plan.
3. *Pantallas* todavía pone la pantalla 2 en la primera entrega; el MVP la corta (desvío consciente, y sube la 15).
4. "Un solo negocio" (Etapa 1, ERS) y las menciones de "artículos" están obsoletas.
5. "MVC / monolito en capas" es descriptivo: son dos apps (Next + FastAPI); el backend es router → servicio → repositorio.

## 12. Requisitos funcionales de referencia

| ID | Requisito | Prio |
|---|---|---|
| RF-01 | Crear membresía (alta de tarjeta a cliente) | Alta |
| RF-02 | Cancelar membresía | Media |
| RF-03 | Renovar membresía | Alta |
| RF-04 | Historial de compras por cliente | Alta |
| RF-05 | Mostrar puntos acumulados | Alta |
| RF-06 | Niveles de tarjeta con beneficios | Alta |
| RF-07 | CRUD de clientes | Alta |
| RF-08 | Login con permisos por rol | Alta |
| RF-09 | Registrar compra con descuento, puntos y cashback calculados | Alta |
| RF-10 | Lectura de la tarjeta en caja (QR impreso) | Alta |
| ~~RF-11~~ | *Retirado el 11 nov 2026 (sin reconocimiento facial)* | — |
| RF-12 | Consulta de movimientos | Media |

RNF: seguridad (contraseñas protegidas, permisos por rol), privacidad (sin fotos ni biometría), usabilidad (pocos pasos), compatibilidad (PC y celular), rendimiento (lectura y registro en pocos segundos), disponibilidad (operable a mano si falla el lector; funciona en localhost sin internet), escalabilidad, mantenibilidad. Los criterios de aceptación detallados por historia se definen en cada tarjeta del Kanban.

## 13. Equipo

| Integrante | Rol |
|---|---|
| Herrera Luévano Jesús Arturo | Líder de proyecto, Backend |
| **Barrios Uriarte Gaddiel Isaac** | **Frontend + UI/UX** (dueño de este repo) |
| Suastegui Leyva Yerlan Axel | Backend |
| Toledo Herrera Neyzer Joel | DevOps |

QA/pruebas e IoT los cubre todo el equipo, por tarjeta del Kanban. Profesor: Yakko Miguel Olivo Najera.

## 14. Enlaces y fuentes

Wiki en Outline (colección "9no", `wiki.neyzt.org`), **fuente de verdad**:
- Inicio: https://wiki.neyzt.org/doc/member-inicio-5Lnt5lkgYs
- **MVP (referencia de alcance):** https://wiki.neyzt.org/doc/mvp-7JeVbQCyWI
- Pantallas: https://wiki.neyzt.org/doc/pantallas-PRVZeE3xY6
- Decisiones por validar: https://wiki.neyzt.org/doc/decisiones-por-validar-vIwlwjifkU
- Guía de desarrollo: https://wiki.neyzt.org/doc/guia-de-desarrollo-member-7h0enDuFFd
- Requisitos de referencia: https://wiki.neyzt.org/doc/requisitos-de-referencia-lRY5UluSDr
- Identidad de marca: https://wiki.neyzt.org/doc/identidad-de-marca-Fpod2zyJ4j · Logos e íconos: https://wiki.neyzt.org/doc/logos-e-iconos-1nQyelGFas
- Etapa 1: https://wiki.neyzt.org/doc/etapa-1-analisis-del-proyecto-GuaqWBVcJf · Etapa 2: https://wiki.neyzt.org/doc/etapa-2-planificacion-y-diseno-xslQLtUDXR
- ERS (no usar): https://wiki.neyzt.org/doc/ers-especificacion-de-requisitos-nrBt0hTGjG

Figma "Member+ — Diseño": https://www.figma.com/design/OWje3kJvpbLxZlCOEq1WnF (plan estudiante de Gaddiel). Fundamentos: variables (Primitives, Color claro/oscuro, Tier, Radius, Spacing, Sizing, Typography móvil/escritorio) y estilos de texto, efecto y degradado, alineados con `BRAND.md`. Página "Componentes": Logo, Iconos (Lucide), Button (5 variantes × 6 estados, alto 44), Icon button, Field (5 estados), Amount field (64 px, para caja), Membership card (Bronce, Plata, Oro y Onyx), Badge (tonos y los cuatro niveles), Switch, Alert, App bar (escritorio y móvil), Stat, Summary row, Scanner (visor de cámara: escaneando, detectada y bloqueada), Avatar, Nav item, Sidebar (Business y Platform), Bottom item y Bottom nav (móvil del negocio), Search field, Tab, Metric card, Usage meter, List item, Empty state, Dialog (normal y peligro) y Pagination. Página "1 · Login": pantalla 1 terminada en escritorio (nodo `15:10`) y móvil (`17:50`), con estados error, cargando y foco, y un marco de notas (contenido, responsive, movimiento y accesibilidad). Páginas "16 · Caja" (escritorio `36:51`, móvil `36:100`), "17 · Registrar compra" (escritorio `41:48`, móvil `43:126`) y "18 · Comprobante" (escritorio `48:48`, móvil `48:120`), cada una con sus estados y su marco de notas de diseño. Los números de la caja (15% de descuento en Oro, 1 punto por cada $10, 3% de cashback) son ilustrativos: el ejemplo numérico definitivo sigue pendiente. Pantallas 2 a 15 también diseñadas (noviembre 2026), cada una en su página con escritorio 1440, móvil 390, estados clave y marco "Notas de diseño" con lo que falta decidir: 2 Registro de negocio, 3 Negocios, 4 Detalle del negocio, 5 Planes (plataforma, barra lateral Platform y barra inferior Negocios/Planes/Cuenta en móvil), 6 Panel, 7 Clientes, 8 Ficha del cliente, 9 Membresías (incluye hoja A4 de tarjetas), 10 Niveles y beneficios, 11 Usuarios, 12 Dispositivos, 13 Configuración, 14 Plan y uso, 15 Movimientos (negocio, barra lateral Business y barra inferior Panel/Clientes/Membresías/Movimientos/Más en móvil). Pendiente con el usuario: revisar detalles de todas las pantallas. Desviaciones abiertas: el código de vinculación (pantalla 12) usa Geist Mono a 40 px, fuera de la escala; en las pantallas 14 y 4 los medidores de uso están separados del componente porque el ancho de la barra no se puede ajustar en una instancia. Detalles: el botón grande de 52 px es un ajuste de altura sobre `control/lg` (aún no es variante de tamaño); el anillo de foco es un contorno real porque el estilo de efecto `Focus/Ring` no se dibuja en el render.

Otros: Kanban https://kan.neyzt.org/member-plus/final-9no · Backend https://github.com/AGA-Studio/Member-Web · Despliegue https://coolify.neyzt.org · Identidad del equipo https://id.neyzt.org

Hay un MCP de Outline disponible (`mcp__outline__*`) para leer el wiki directamente.

## 15. Reglas de trabajo para agentes

- Lee la guía de Next en `node_modules/next/dist/docs/` antes de tocar APIs de Next.
- Código en inglés; textos de UI siempre por i18n; diseño siempre con los tokens de `BRAND.md` (ver `AGENTS.md`). Mobile-first: probar en celular y escritorio.
- Nunca pidas ni envíes `negocio_id` desde el cliente; el backend lo deduce del token.
- No agregues dependencias, rutas API en Next, ni funciones fuera del MVP sin consultarlo.
- Respeta el alcance y el orden del MVP (sección 2).
- No guardes ni pidas fotos de clientes ni datos biométricos.
- Usa las skills instaladas en `.agents/skills/` al escribir UI: `ui-ux-pro-max`, `emil-design-eng`, `frontend-design` y `playwright-cli` (regla 8 de `AGENTS.md`). No se suben al repo; `skills-lock.json` las restaura con `npx skills experimental_install`. Si una skill choca con `BRAND.md` o las reglas, mandan estas.
- Movimiento: animaciones y transiciones cortas (menos de 300 ms), con las curvas de Emil Kowalski definidas en `globals.css`, siempre (regla 9). En caja solo pulsado y cambios de estado.
- Después de codificar una pantalla o componente, **compáralo con Figma** (capturas con Playwright contra `get_screenshot`) y corrige las diferencias (regla 10).
- Si el wiki cambia, actualiza este archivo.
