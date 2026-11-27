# Member+ — Memoria del proyecto (para agentes)

> Léelo completo antes de escribir código. Resume el wiki del equipo (Outline) al **2026-11-24**. La sección 3 (estado del repo) se actualizó por última vez el **2026-11-24**.
> Si algo aquí contradice el wiki, **manda el wiki** (ver sección 14). Si encuentras algo desactualizado, corrígelo aquí.
> Este repo es **solo el frontend**. El backend vive en otro repo.

## 1. Qué es

**Member+** es un **SaaS multi-negocio** de membresías/lealtad. Nosotros operamos la plataforma; cada negocio que la contrata es un inquilino con sus propios datos. Un negocio administra clientes, tarjetas de membresía por nivel y compras con descuento, puntos y cashback. El empleado cobra en caja leyendo el **QR impreso** de la tarjeta con un lector (ESP32-S3 con cámara) o con la webcam del navegador.

- Proyecto académico: Universidad Tecnológica de Tijuana · Desarrollo Web Integral · Grupo 9C. Se demuestra de principio a fin; no es un producto comercial.
- Usuario de referencia ("Juan López"): gerente de 35 a 45 años, poca experiencia con computadoras, usa sobre todo el celular. **La UI debe ser clara y con pocos pasos.**
- **No hay reconocimiento facial en ningún punto del sistema** (decisión del 11 nov 2026). El lector identifica la tarjeta, no a la persona. Desde el **16 nov 2026** (decisión del líder de proyecto) se permite guardar **una foto del cliente solo para mostrarse** en el panel, en las membresías y en la caja: nunca se compara ni se analiza, se borra al cancelar la membresía y el consentimiento lo pide el negocio. Sigue sin haber datos biométricos. Ver sección 11.
- Idioma: el código siempre en inglés. Los textos al usuario **nunca van fijos en el código**: se leen de archivos de traducción por locale (i18n), con **español (`es`) por defecto**; el idioma se detecta según el navegador. Detalle en `AGENTS.md`.

## 2. MVP v0.1 — "la rebanada de caja" (alcance de la demo)

Fuente: https://wiki.neyzt.org/doc/mvp-7JeVbQCyWI · **Estado en el wiki: "En ejecución".** Es la referencia de alcance de la demo y manda sobre la lista de prioridades de *Pantallas*.

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
| 7 | Clientes | Alta, consulta, edición y baja. Foto del cliente solo para mostrarse |
| 8 | Ficha del cliente | |
| 9 | Membresías | Alta, renovación, cancelación y registro de pago. **QR imprimible** y código corto tecleable. Desde el 19 nov 2026 viven dentro de Clientes y la ficha, sin pantalla propia |
| 10 | Niveles y beneficios | Editables; tres niveles de plantilla por negocio |
| 15 | Movimientos | **Solo lectura.** Cierra el relato de la demo |
| 16 | Caja | Lee el QR con el lector o la webcam, o se teclea el código |
| 17 | Registrar compra | Monto y concepto; muestra descuento, puntos y cashback |
| 18 | Comprobante | |
| 3 | Negocios (panel de plataforma) | Solo lectura: lista de negocios con su uso |

El paso 2 del guion de la demo usa el Panel (pantalla 6): está construido aunque el MVP no lo liste en "Dentro".

### Fuera del MVP (no construir sin consultar)
2 Registro de negocio (en la demo el alta va por `scripts/seed.py` del backend) · 5 Planes · 12 Dispositivos · 14 Plan y uso · portal del cliente · catálogo o inventario · canje de puntos · sucursales · app móvil · reportes · reconocimiento facial.

El MVP del wiki también deja fuera las pantallas 4, 11 y 13; se construyeron entre el 18 y el 21 nov 2026 (ver sección 3).

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

La rebanada del MVP y las pantallas 4, 6, 11 y 13 están en `main` y consumen el API real de `Member-Web` (sin mocks). Lo que existe hoy:

- **Login y sesión:** `src/app/login`, `src/features/auth/` (acción de servidor, estados de error y carga, panel de marca), selector de idioma es/en y widget de Turnstile cuando `TURNSTILE_SITEKEY` existe. `src/lib/session.ts` consulta `/api/v1/auth/me`; cerrar sesión llama a `POST /api/v1/auth/logout`; `src/proxy.ts` protege las rutas por rol y `/` redirige al inicio de cada rol (admin `/panel`).
- **Panel del negocio (admin):** `/panel` con indicadores y gráficas propias (`src/components/charts/`); clientes con búsqueda, filtros, paginación, alta de membresía (el precio es el del nivel y no se edita) y hoja de tarjetas con QR imprimible (`/imprimir`); la pantalla de membresías se eliminó en noviembre 2026 porque repetía a clientes (`/membresias` redirige a `/clientes`); ficha con tarjeta, datos, compras, renovación, edición, cancelación e impresión; niveles editables; movimientos con filtros y exportación CSV; `/usuarios` (alta, edición, activar y desactivar; el rol se fija al crear); `/configuracion` (nombre, vigencia, logo y color); búsqueda global de clientes, usuarios, niveles y movimientos. Vive en `src/app/(business)/` y `src/features/business/`, con barra lateral en escritorio y navegación inferior en móvil.
- **Caja (empleado):** `/caja` une las pantallas 16 y 17 (visor con `jsqr`, campo de código y resumen en vivo con `src/lib/pricing.ts`); `/caja/comprobante/[id]` es la 18.
- **Plataforma:** `/plataforma` muestra el resumen y la lista de negocios con búsqueda, filtro por estado y paginación; `/plataforma/[id]` muestra el detalle (solo conteos) y permite suspender o reactivar. El rol `platform` no entra al panel del negocio ni a caja.
- **Planes (pantallas 5 y 14):** `/plan` (admin) muestra el plan efectivo, la prueba, el precio y el uso de clientes y usuarios contra el límite (`GET /api/v1/plan/summary`); `/plataforma/planes` lista los planes públicos (`GET /api/v1/plan/list`), y la lista y el detalle de plataforma muestran el plan y lo que devuelve el API de uso (en la lista solo clientes). Ante `limit_reached` o `plan_required` (alta de cliente, alta o reactivación de usuario, logo, fotos y exportación) la pantalla dice el motivo. Los límites se leen del API; el front no cobra. Cuando el resumen trae `can_change_plan`, «Cambiar de plan» (aprobado por el equipo el 26 nov 2026) muestra los planes en tarjetas con el actual remarcado, pide confirmación con los efectos del cambio, enseña el pago simulado (`src/features/payments/`, solo si el plan tiene precio) y llama `PATCH /api/v1/plan/update`; el backend trae la ruta apagada (`PLAN_SELF_SERVICE_ENABLED=false`), así que el botón solo aparece donde se encienda. Los nombres de los planes se traducen por su clave (`plans.names`); una clave desconocida muestra el nombre del API. Vive en `src/features/plans/` y `src/lib/plan.ts`.
- **Registro de negocios (pantalla 2):** `/registro` es pública y de una sola pantalla (negocio, administrador, plan, aviso de privacidad y Turnstile; sobre la casilla va el aviso corto con responsable, datos, finalidad y a quién pedir límites); lee los planes de `GET /api/v1/plan/list`, ofrece solo los gratuitos o con prueba y envía `POST /api/v1/registration/create`. Con un plan de pago muestra un modal de pago simulado (pasos de proceso y mensaje de éxito; sin pasarela ni cobro, y lo dice en pantalla). Al crear la cuenta inicia sesión con `POST /api/v1/auth/login` (pide un token nuevo de Turnstile) y entra a `/panel`; si ese inicio falla, manda a `/login?correo=`. El login enlaza a `/registro`. Vive en `src/features/registration/` y `src/lib/registration.ts`. El API lo trae apagado (`REGISTRATION_ENABLED`).
- **Tarjeta pública:** `/tarjeta/[token]` sin sesión, con Google Wallet, PNG y PDF generados en el navegador; la entrega (correo o enlace con QR) sale de la ficha del cliente.
- **Imágenes:** logo del negocio, foto del cliente y foto de perfil con URLs firmadas que caducan en 1 h; se pueden subir o tomar con la cámara; `Avatar` y `BusinessLogo` caen a las iniciales cuando la imagen falla (`src/components/ui/remote-image.tsx`).
- **Tema y color:** modo oscuro manual desde el menú de usuario (cookie `theme`) y color por negocio en panel, caja y tarjeta pública (`src/lib/tenant-theme.ts`).
- **Estados y errores:** `not-found.tsx`, `error.tsx`, `global-error.tsx`, `/sin-conexion`, esqueletos por ruta y toasts para sesión vencida o sin permiso.
- **Pruebas:** Vitest con cobertura al 100 % en `src/lib/pricing.ts` (la fórmula, comparada con `services/pricing_service.py` del backend), `format.ts`, `customer-errors.ts` y `tenant-theme.ts`, más pruebas de `dashboard.ts`, de `registration.ts` y de la búsqueda; Playwright E2E para login, caja, aislamiento entre negocios, tarjeta pública y alta de membresía. El CI corre `lint` (+`check:tokens`), `typecheck`, `messages`, `test` y `build` como obligatorios, y `e2e` aparte (no required).
- **Excepciones de movimiento:** la animación de entrada al login (`src/features/auth/entry-transition.tsx`, ~2 s) y el sidebar tipo píldora que anima el ancho (300 ms) son excepciones deliberadas a la regla de < 300 ms y de solo transform/opacity; están registradas en `docs/REVISION.md` §1 y no se eliminan mientras el código las tenga.
- **Flujo de git:** `main` es la única rama; `feature/*`, `fix/*` o `docs/*` efímeras, todo por PR. Un merge a `main` despliega.
- **Dependencias que importan:** `next-intl` (i18n), `qrcode.react`, `jsqr`, `html-to-image`, `vitest` y `@playwright/test`. `@types/node` en 22, igual que `.nvmrc`.

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
| Config especial | `next.config.ts`: `output: "standalone"`, `cacheComponents: true`, `partialPrefetching: true`. El layout raíz exporta `instant = false` porque el idioma sale de cookie y encabezados |
| Scripts | `npm run dev` · `build` · `start` · `lint` · `typecheck` · `messages:check` · `check:tokens` · `test` y `test:coverage` (Vitest) · `test:e2e` y `test:e2e:ui` (Playwright) |

**⚠️ Este Next.js NO es el que conoces** (ver `AGENTS.md`): APIs y convenciones pueden diferir. **Antes de escribir código de Next, lee la guía relevante en `node_modules/next/dist/docs/`** (`01-app/` es el App Router). Con `cacheComponents` activo, leer cookies o encabezados fuera de `<Suspense>` rompe el prerender.

## 5. Identidad y sistema de diseño

**Ver `BRAND.md`** (fuente única de diseño) y su copia en el wiki: https://wiki.neyzt.org/doc/identidad-de-marca-Fpod2zyJ4j

- Esencia: **"Cada cliente reconocido, cada cobro rápido."** Dirección: **"Claridad premium"**. Tema claro por defecto; modo oscuro solo manual con `data-theme="dark"`, nunca según el sistema.
- Tokens de color, tipografía, radios, sombras y anchos ya están en `src/app/globals.css`. La paleta por defecto de Tailwind está desactivada: se usan tokens (`bg-surface`, `text-muted`, `bg-primary`...).
- Voz: "tú", sin exclamaciones, botones con verbo en infinitivo, campos opcionales con "(opcional)".
- Logos en `src/assets/brand/` (PNG con transparencia; se importan con `next/image`): `logo-on-light.png`, `logo-on-dark.png`, `icon-on-light.png`, `icon-on-dark.png`. Favicon e íconos: `src/app/favicon.ico`, `icon.png`, `apple-icon.png`. Los logos son raster, no vectores. Wiki: https://wiki.neyzt.org/doc/logos-e-iconos-1nQyelGFas
- El logo de Member+ es de la plataforma; cada negocio tiene su propio logo y nombre.
- Componentes en `src/components/ui/`; el color por negocio entra como bloque de tokens acotado a la clase `tenant-theme` del contenedor de la pantalla (nunca en `:root`, ver BRAND 5.7) y el modo oscuro se cambia desde el menú de usuario.

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
- Hosting: Coolify en servidor propio con Cloudflare. **App en `memberplus.neyzt.org`** y **API en `api-memberplus.neyzt.org`** (guion y no punto, porque el certificado de Cloudflare cubre un solo nivel). El navegador llama `/api/*` y Next lo reescribe al API. **Localhost con Docker de respaldo obligatorio** para la demo.
- **El host `memberplus.neyzt.org` es compartido** (desde el 21 nov 2026): la landing (Astro, repo `Member-Plus-Landing`) atiende `/`, `/privacidad`, `/terminos` y `/en*`; las rutas de la app siguen siendo de este frontend. La app va **noindex** (`X-Robots-Tag: noindex, nofollow` en todas sus rutas): no es contenido público y las reglas de `robots.txt` de la landing ya lo dicen.
- **Producción:** el frontend corre en dos instancias (`web-a` y `web-b`) detrás de Traefik y el API en una sola. Un merge a `main` publica la imagen y pide a Coolify que la jale y reinicie (`docs/DEPLOY.md`).
- **Contrato de la API:** documentado en https://wiki.neyzt.org/doc/contrato-de-api-implementado-xbPbNhd4JU; el esquema de BD vive en las migraciones de Alembic de `Member-Web`. Antes de integrar algo nuevo, confirma ruta, payload y errores contra el contrato y el código del backend.

## 7. Multi-tenant (regla más importante de la UI)

- Un solo despliegue, muchos negocios. `negocio_id` en cada tabla, tomado **del token, nunca de lo que mande el cliente**. Nunca lo pidas ni lo envíes desde el frontend.
- **El negocio NUNCA se elige en pantalla**: sale del usuario autenticado. Sin selector de negocio ni subdominios.
- **Encargado:** entra en `/clientes` y su navegación suma `/movimientos` y `/caja`; en caja tiene el acceso de regreso a clientes. El buscador global no le ofrece usuarios ni niveles. Los permisos se resuelven por rol en `src/lib/roles.ts`, no por la lista `permissions` de `/auth/me`.
- **Asistente de IA (solo admin):** botón flotante en el panel que abre un chat a pantalla completa (`src/features/assistant/`, `src/lib/assistant.ts`). Envía hasta 20 mensajes a `POST /api/v1/chat/send` con el `session_id`; muestra la respuesta de forma progresiva y avisa si el plan no incluye IA o si la ruta no está disponible. La conversación vive solo en la pestaña. El icono sale de `assistant-mark.tsx`, pendiente de cambiar por la mascota. El API lo trae apagado (`AI_ENABLED`).
- Nombre y logo del negocio aparecen en todas sus pantallas. El admin cambia nombre, logo y color en `/configuracion`.

### Roles (4)
1. **Dueño de plataforma** (nosotros): ve negocios, estado, uso y métricas. **No ve datos de clientes** (decisión marcada ✅).
2. **Administrador del negocio**
3. **Encargado** (`manager`, 25 nov 2026): caja, clientes y movimientos; sin panel, niveles, usuarios, plan ni configuración.
4. **Empleado de caja**

El cliente final **no tiene cuenta**.

## 8. Pantallas (18)

Fuente: https://wiki.neyzt.org/doc/pantallas-PRVZeE3xY6 (se retiró la antigua "Verificación" y se renumeró la caja). Todas funcionan en computadora y celular.

**Acceso:** 1 Inicio de sesión · 2 Registro de negocio.
**Plataforma:** 3 Negocios · 4 Detalle del negocio · 5 Planes.
**Admin del negocio:** 6 Panel · 7 Clientes · 8 Ficha del cliente · 9 Membresías (con QR imprimible; dentro de Clientes) · 10 Niveles y beneficios · 11 Usuarios · 12 Dispositivos · 13 Configuración · 14 Plan y uso · 15 Movimientos.
**Caja:** 16 Caja · 17 Registrar compra · 18 Comprobante.

El orden de entrega que manda es el del **MVP** (sección 2), no la lista de prioridad de *Pantallas*.

### Notas de interfaz
- **Sin verificación de identidad.** La caja muestra **nombre y nivel en grande** para que el empleado reconozca al cliente. Es disuasión, no verificación.
- El **código de la tarjeta es corto y tecleable** (no un UUID): `MP-XXXXX`, 5 caracteres aleatorios de un alfabeto sin `0/O/1/I/L`, único por negocio. El QR codifica solo ese código.
- Estados vacíos, de error y de carga se resuelven por pantalla con las reglas de `BRAND.md`.

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
- Tarjeta = membresía: una sola entidad (cliente, nivel, estado, vigencia, código). **Una tarjeta por cliente.** Id global interno; lo que se imprime es el código corto aleatorio (sección 8).
- Vigencia en meses configurable por negocio y precio por nivel; renovación manual. Pagos de membresía: monto, fecha, método y quién los registró, sin pasarela.
- Renovar extiende la vigencia; cancelar da de baja; ambos quedan en historial y movimientos.
- Los beneficios se aplican si la tarjeta está **activa y vigente**.
- Si el lector falla, el empleado teclea el código y la operación continúa igual.
- **Ejemplo de referencia** (nivel Oro de la demo): compra de $1,000 → descuento $150.00, total $850.00, 85 puntos y $25.50 de cashback. Lo cubren las pruebas del backend y el E2E de caja.

## 10. Autenticación, seguridad y hardware

- JWT en **cookie httpOnly** emitido por FastAPI; Argon2id; **sin NextAuth**.
- El lector (ESP32) usa un **token propio de dispositivo**, revocable y atado al negocio; el login del empleado no sirve para eso.
- HTTPS en todo; el ESP32 con CA fijada si alcanza la RAM, si no HTTP solo en red local.
- Panel de plataforma detrás de Cloudflare Access o con login propio.
- Los datos son del negocio; Member+ solo los procesa. Hacen falta dos avisos de privacidad (el nuestro y el del negocio a sus clientes).
- Respaldos: backup nativo de Coolify de la base a Backblaze B2 cada día y copia de las imágenes de R2 a B2 con `rclone copy`.
- **ESP32-S3** (N16R8 con cámara, modelo exacto por confirmar): solo lee el QR y hace `POST` del código. **Corte el 25 nov:** si no hay prueba de concepto, la caja usa la **webcam del navegador** y el ESP32 queda como demo aparte.
- **En el frontend:** la caja **lee el QR con la webcam desde el navegador** (`jsqr`) y permite teclear el código.

## 11. Decisiones y conflictos

### Decididas (✅ en el wiki)
- Sin reconocimiento facial en ningún punto. **RF-11 retirado** (su ID no se reutiliza); RNF-02 ya no menciona imágenes. **16 nov 2026:** se permite una foto del cliente solo para mostrarla (se borra al cancelar la membresía; el negocio pide el consentimiento). El logo del negocio y la foto de perfil de cada usuario también se guardan, en un bucket privado (Cloudflare R2 en producción, RustFS en local).
- Dueño de plataforma no ve datos de clientes.
- Compra = monto y concepto; cashback como saldo; orden de cálculo; niveles por negocio.
- Puntos como historial de movimientos, no campo del cliente (12 nov 2026).
- SQLAlchemy sync, no async (12 nov 2026).
- Identificación en caja por QR o tecleo del código.
- Auth: JWT en cookie httpOnly + Argon2id.
- Repositorios separados; hosting en Coolify; datos de demo con dos negocios.
- **Alta de negocio** (24 nov 2026): registro directo, sin aprobación manual. Se implementa después de la defensa; la demo sigue con `scripts/seed.py`. El 25 nov 2026 el frontend cambió el «sin auto-login»: tras el alta inicia sesión solo, por el mismo endpoint de login. Detalle: https://wiki.neyzt.org/doc/registro-de-negocios-decision-Z5dzocmJW2
- **Planes y cobro** (25 nov 2026): planes con límites y cobro manual, sin pasarela. El 26 nov 2026 el equipo aprobó que el administrador cambie su plan desde Plan y uso y que el registro y ese cambio muestren un pago simulado (falta registrarlo en el wiki). Detalle: https://wiki.neyzt.org/doc/decisiones-por-validar-vIwlwjifkU
- **Agente de IA para admins** (23 nov 2026): Opencode Go, solo lectura. Después de la defensa. Detalle: https://wiki.neyzt.org/doc/agente-de-ia-para-admins-decision-aGmbmY8PiA

### Abiertas (no están aprobadas)
- **Verificación de correo en el registro:** la decisión actual no la incluye.
- **Next como cliente puro** sin rutas API.
- **Placa ESP32-S3 exacta**; Wi-Fi, energía y montaje sin responsable.
Si alguna se decide distinto, se corrige el MVP, no la casilla.

### Documentos desactualizados
1. **ERS: no usar.** Vigente: *Requisitos de referencia* + *MVP* + *Pantallas* + *Decisiones por validar*.
2. **Calendarios de Etapa 2 y de la Guía son de relleno.** Los hitos del MVP y el Kanban son el plan.
3. *Pantallas* todavía pone la pantalla 2 en la primera entrega (el MVP la corta, desvío consciente, y sube la 15), describe un alta con aprobación (reemplazada el 24 nov 2026) y lista la pantalla 9 aparte.
4. "Un solo negocio" (Etapa 1, ERS) y las menciones de "artículos" están obsoletas.
5. "MVC / monolito en capas" es descriptivo: son dos apps (Next + FastAPI); el backend es router → servicio → repositorio.
6. RNF-02 en *Requisitos de referencia* todavía prohíbe guardar fotografías; manda la decisión del 16 nov 2026.

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

RNF: seguridad (contraseñas protegidas, permisos por rol), privacidad (sin datos biométricos; la foto del cliente solo se muestra), usabilidad (pocos pasos), compatibilidad (PC y celular), rendimiento (lectura y registro en pocos segundos), disponibilidad (operable a mano si falla el lector; funciona en localhost sin internet), escalabilidad, mantenibilidad. Los criterios de aceptación detallados por historia se definen en cada tarjeta del Kanban.

## 13. Equipo

| Integrante | Rol |
|---|---|
| Herrera Luévano Jesús Arturo | Líder de proyecto, Backend |
| **Barrios Uriarte Gaddiel Isaac** | **Frontend + UI/UX** (dueño de este repo) |
| Suastegui Leyva Yerlan Axel | Backend |
| Toledo Herrera Neyzer Joel | DevOps |

QA/pruebas e IoT los cubre todo el equipo, por tarjeta del Kanban. Profesor: Yakko Miguel Olivo Najera.

## 14. Enlaces y fuentes

Wiki en Outline (colección "MemberPlus", `wiki.neyzt.org`), **fuente de verdad**:
- Inicio: https://wiki.neyzt.org/doc/member-inicio-5Lnt5lkgYs
- **MVP (referencia de alcance):** https://wiki.neyzt.org/doc/mvp-7JeVbQCyWI
- Pantallas: https://wiki.neyzt.org/doc/pantallas-PRVZeE3xY6
- Decisiones por validar: https://wiki.neyzt.org/doc/decisiones-por-validar-vIwlwjifkU
- Guía de desarrollo: https://wiki.neyzt.org/doc/guia-de-desarrollo-member-7h0enDuFFd
- Contrato de API: https://wiki.neyzt.org/doc/contrato-de-api-implementado-xbPbNhd4JU · Implementaciones futuras: https://wiki.neyzt.org/doc/implementaciones-futuras-RTBypKqa1g
- Requisitos de referencia: https://wiki.neyzt.org/doc/requisitos-de-referencia-lRY5UluSDr
- Identidad de marca: https://wiki.neyzt.org/doc/identidad-de-marca-Fpod2zyJ4j · Logos e íconos: https://wiki.neyzt.org/doc/logos-e-iconos-1nQyelGFas
- Etapa 1: https://wiki.neyzt.org/doc/etapa-1-analisis-del-proyecto-GuaqWBVcJf · Etapa 2: https://wiki.neyzt.org/doc/etapa-2-planificacion-y-diseno-xslQLtUDXR
- ERS (no usar): https://wiki.neyzt.org/doc/ers-especificacion-de-requisitos-nrBt0hTGjG

Figma "Member+ — Diseño" (solo base, ya no se actualiza): https://www.figma.com/design/OWje3kJvpbLxZlCOEq1WnF (plan estudiante de Gaddiel). Fundamentos: variables (Primitives, Color claro/oscuro, Tier, Radius, Spacing, Sizing, Typography móvil/escritorio) y estilos de texto, efecto y degradado, alineados con `BRAND.md`. Página "Componentes": Logo, Iconos (Lucide), Button (5 variantes × 6 estados, alto 44), Icon button, Field (5 estados), Amount field (64 px, para caja), Membership card (Bronce, Plata, Oro y Onyx), Badge (tonos y los cuatro niveles), Switch, Alert, App bar (escritorio y móvil), Stat, Summary row, Scanner (visor de cámara: escaneando, detectada y bloqueada), Avatar, Nav item, Sidebar (Business y Platform), Bottom item y Bottom nav (móvil del negocio), Search field, Tab, Metric card, Usage meter, List item, Empty state, Dialog (normal y peligro) y Pagination. Página "1 · Login": pantalla 1 terminada en escritorio (nodo `15:10`) y móvil (`17:50`), con estados error, cargando y foco, y un marco de notas (contenido, responsive, movimiento y accesibilidad). Páginas "16 · Caja" (escritorio `36:51`, móvil `36:100`), "17 · Registrar compra" (escritorio `41:48`, móvil `43:126`) y "18 · Comprobante" (escritorio `48:48`, móvil `48:120`), cada una con sus estados y su marco de notas de diseño. Pantallas 2 a 15 también diseñadas (noviembre 2026), cada una en su página con escritorio 1440, móvil 390, estados clave y marco "Notas de diseño": 2 Registro de negocio, 3 Negocios, 4 Detalle del negocio, 5 Planes (plataforma, barra lateral Platform y barra inferior Negocios/Planes/Cuenta en móvil), 6 Panel, 7 Clientes, 8 Ficha del cliente, 9 Membresías (incluye hoja A4 de tarjetas), 10 Niveles y beneficios, 11 Usuarios, 12 Dispositivos, 13 Configuración, 14 Plan y uso, 15 Movimientos (negocio, barra lateral Business y barra inferior Panel/Clientes/Membresías/Movimientos/Más en móvil). Desviaciones del archivo: el código de vinculación (pantalla 12) usa Geist Mono a 40 px, fuera de la escala; en las pantallas 14 y 4 los medidores de uso están separados del componente porque el ancho de la barra no se puede ajustar en una instancia. Detalles: el botón grande de 52 px es un ajuste de altura sobre `control/lg` (aún no es variante de tamaño); el anillo de foco es un contorno real porque el estilo de efecto `Focus/Ring` no se dibuja en el render.

Otros: Kanban https://kan.neyzt.org/member-plus/final-9no · Backend https://github.com/AGA-Studio/Member-Web · Despliegue https://coolify.neyzt.org · Identidad del equipo https://id.neyzt.org

Hay un MCP de Outline disponible (`mcp__outline__*`) para leer el wiki directamente.

## 15. Reglas de trabajo para agentes

- Lee la guía de Next en `node_modules/next/dist/docs/` antes de tocar APIs de Next.
- Código en inglés; textos de UI siempre por i18n; diseño siempre con los tokens de `BRAND.md` (ver `AGENTS.md`). Mobile-first: probar en celular y escritorio.
- Nunca pidas ni envíes `negocio_id` desde el cliente; el backend lo deduce del token.
- No agregues dependencias, rutas API en Next, ni funciones fuera del MVP sin consultarlo.
- Respeta el alcance y el orden del MVP (sección 2).
- No guardes ni pidas datos biométricos ni compares fotos. La foto del cliente solo se guarda para mostrarse y se borra al cancelar la membresía (sección 1).
- Usa las skills instaladas en `.agents/skills/` al escribir UI: `ui-ux-pro-max`, `emil-design-eng`, `frontend-design` y `playwright-cli` (regla 8 de `AGENTS.md`). No se suben al repo; `skills-lock.json` las restaura con `npx skills experimental_install`. Si una skill choca con `BRAND.md` o las reglas, mandan estas.
- Movimiento: animaciones y transiciones cortas (menos de 300 ms), con las curvas de Emil Kowalski definidas en `globals.css`, siempre (regla 9). En caja solo pulsado y cambios de estado.
- Figma ya no se usa para diseñar (decisión de noviembre 2026): las pantallas nuevas se hacen en código con `BRAND.md` y las reglas del equipo. Después de codificar, revisa con capturas de Playwright en móvil y escritorio (regla 10).
- Si el wiki cambia, actualiza este archivo.
- Bugs y mejoras → **GitHub Issues** del repo donde cae el cambio (`Member-Plus-Frontend` si es UI, `Member-Web` si es del API). Busca duplicados con `gh issue list -R … --search`, crea con `gh issue create -R … --label bug|enhancement|documentation|deuda`, y cierra desde el PR con `Closes #N` o como *not planned* con motivo.
- Un hallazgo fuera del alcance de la tarea se registra como issue y se sigue. `docs/` describe lo implementado y la wiki decide requisitos: ninguno acumula listas de pendientes. Un ítem, un hogar.
