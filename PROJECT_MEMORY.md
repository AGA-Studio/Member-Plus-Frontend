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

- Es el scaffold de `create-next-app` con la configuración base ya hecha. **Todavía no hay features ni componentes de producto.**
- Hecho: i18n con `next-intl`, tokens de diseño en `src/app/globals.css`, fuentes, logos e íconos, favicon, `lucide-react`.
- `src/app/page.tsx` es solo un placeholder con traducciones. Quedan en `public/` los SVG de ejemplo de la plantilla.
- Remote: `https://github.com/AGA-Studio/Member-Plus-Frontend.git` (rama `main`).
- Flujo de git del equipo: ramas `main` / `develop` / `feature/*`, **todo por PR**, sin commits directos a `main` ni `develop`. (Los agentes no hacen commit ni push sin que el usuario lo pida: `AGENTS.md` regla 4.)

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
| Scripts | `npm run dev` · `build` · `start` · `lint` (no hay tests aún) |

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

- Backend: FastAPI (Python 3.13), router → servicio → repositorio; SQLAlchemy sync. Rama `develop`.
- **Next es cliente puro**: toda la lógica va en FastAPI. **No crear rutas API ni lógica de negocio en Next.**
- Sin Supabase: JWT propio y Postgres 18 en Compose.
- Docker Compose levanta API y BD; el frontend corre aparte en desarrollo.
- Hosting: Coolify en servidor propio (`memberplus.neyzt.org`, subdominio aún no creado) con Cloudflare para HTTPS. **Localhost con Docker de respaldo obligatorio** para la demo.
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

Figma "Member+ — Diseño": https://www.figma.com/design/OWje3kJvpbLxZlCOEq1WnF (plan estudiante de Gaddiel). Ya tiene los fundamentos: variables (Primitives, Color claro/oscuro, Tier, Radius, Spacing, Sizing, Typography móvil/escritorio) y estilos de texto, efecto y degradado, alineados con `BRAND.md`. Componentes y pantallas aún sin diseñar.

Otros: Kanban https://kan.neyzt.org/member-plus/final-9no · Backend https://github.com/AGA-Studio/Member-Web · Despliegue https://coolify.neyzt.org · Identidad del equipo https://id.neyzt.org

Hay un MCP de Outline disponible (`mcp__outline__*`) para leer el wiki directamente.

## 15. Reglas de trabajo para agentes

- Lee la guía de Next en `node_modules/next/dist/docs/` antes de tocar APIs de Next.
- Código en inglés; textos de UI siempre por i18n; diseño siempre con los tokens de `BRAND.md` (ver `AGENTS.md`). Mobile-first: probar en celular y escritorio.
- Nunca pidas ni envíes `negocio_id` desde el cliente; el backend lo deduce del token.
- No agregues dependencias, rutas API en Next, ni funciones fuera del MVP sin consultarlo.
- Respeta el alcance y el orden del MVP (sección 2).
- No guardes ni pidas fotos de clientes ni datos biométricos.
- Si el wiki cambia, actualiza este archivo.
