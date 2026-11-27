# Criterios de revisión — frontend de Member+

Lo que un cambio no puede romper, en una página.

Este archivo lo lee `scripts/review_pr.py`, que comenta los PRs automáticamente. **No es la fuente de verdad**: manda el wiki (`wiki.neyzt.org`, colección `9no`) y, para diseño, `BRAND.md`. Si aquí dice una cosa y ellos otra, ganan ellos y esto se corrige.

> Última sincronización: **26 de noviembre de 2026**.
> El 26 nov 2026: se registraron los cuatro roles y el regreso del despliegue a la app única, las pantallas 2, 5 y 14 pasaron a construidas y el pago simulado y el cambio de plan quedaron como decisiones abiertas.
> El 24 nov 2026: las pantallas 4, 11 y 13 ya construidas salieron de «fuera del alcance», el alta de negocio pasó a decisión cerrada y el despliegue dejó de usar webhook.
> El 25 nov 2026, solo en estos dos puntos: planes y cobro pasó a decisión cerrada y el alta de negocio inicia sesión automáticamente.
> Cambios anteriores: la foto del cliente dejó de ser una violación —16 nov 2026, solo para mostrarse y se borra al cancelar—, el job `test` entró al ruleset y el E2E corre en el CI como job `e2e` (no required). El 18 nov 2026 el umbral del 100 % pasó de dos a **cuatro** módulos de `src/lib/` (`tenant-theme.ts` y `customer-errors.ts` ya tenían pruebas y no estaban en `coverage.include`) y el E2E pasó a **dos workers** en CI; el orden de la sección 7 no cambia.
> Fuentes: *Decisiones por validar*, *MVP*, *Pantallas*, `BRAND.md` y `AGENTS.md` de este repositorio.

## 1. Decisiones cerradas

Un PR no las contradice. Si de verdad hay que cambiarlas, se cambia primero la casilla en el wiki.

| Tema | Decisión | Cómo se ve en el código |
|------|----------|-------------------------|
| Idioma del producto | Español de México por defecto, inglés como segundo | `messages/es.json` y `en.json`; claves en inglés |
| Texto visible | Nunca escrito en el componente | `t("caja.escanearTarjeta")`, nunca `<p>Escanea la tarjeta</p>` |
| Diseño | Solo tokens de `src/app/globals.css` | `bg-surface`, `text-muted`; prohibido `#0062f2` y `bg-blue-500` |
| Íconos | Solo Lucide | `lucide-react`; nada de `react-icons`, `@heroicons` ni similares |
| Tema | Claro por defecto; oscuro solo si el usuario lo activa | `data-theme="dark"` manual; **nunca** `prefers-color-scheme` |
| Acción principal | Un solo botón primario por pantalla | Un `bg-primary` relleno; el resto secundario, contorno o fantasma |
| Movimiento | Transiciones de menos de 300 ms | `ease-out`, `ease-in-out`, `ease-drawer`; nunca `ease-in` |
| Caja (pantallas 16-18) | Sin animación de entrada | Solo respuesta al pulsar y cambios de estado |
| Voz | Tú, sobrio, botones en infinitivo | "Registrar compra"; sin exclamaciones, sin emojis, sin "¡Oops!" |
| Formatos | México | `$1,250.00 MXN`, fechas "10 nov 2026" |
| Auth | JWT en cookie httpOnly que emite FastAPI | Sin NextAuth, sin tokens en `localStorage` |
| Negocio | Sale del usuario autenticado | Sin selector de negocio ni subdominios; el cliente nunca manda `business_id` |
| Identidad | **Sin reconocimiento facial.** La foto del cliente se guarda solo para mostrarse (16 nov 2026) y se borra al cancelar la membresía | El lector y la webcam solo leen el QR; la foto nunca se compara ni se analiza (`PhotoField` en el alta y en «Editar datos») |
| Hostnames | App en `memberplus.neyzt.org`, API en `api-memberplus.neyzt.org` | `/api/*` reescrito en Next; **guion y no punto** (el SSL de Cloudflare cubre un nivel). Desde el 21 nov 2026 el host lo comparte la landing (Astro) en `/` y `/en*`; la app va **noindex** |
| Despliegue | Imagen standalone en GHCR; **mergear a `main` despliega** (Coolify jala `latest` y redespliega la app por webhook; el balanceo se retiró el 25 nov 2026) | `output: "standalone"`; Coolify no construye |
| Alta de negocio | Registro directo sin aprobación (24 nov 2026). Tras el alta se inicia sesión automáticamente (25 nov 2026, [Registro de negocios: decisión](https://wiki.neyzt.org/doc/registro-de-negocios-decision-Z5dzocmJW2), paso 4 del flujo). La demo del 3 de diciembre sigue con `seed.py` y el registro público va apagado (`REGISTRATION_ENABLED`) | La pantalla 2 está en `main` desde el 26 nov 2026, con aviso corto de privacidad sobre la casilla. El inicio automático usa `/api/v1/auth/login` con un token nuevo de Turnstile; si falla, manda a `/login?correo=` |
| Planes y cobro | Planes con límites y cobro manual, sin pasarela; la plataforma asigna el plan; al registrarse, prueba de 30 días del plan Negocio. Casilla marcada el 25 nov 2026 en [Decisiones por validar](https://wiki.neyzt.org/doc/decisiones-por-validar-vIwlwjifkU) | Los planes y límites se leen de la API, nunca fijos en el código; el front no cobra. Los nombres se traducen por su clave, con el del API como respaldo |
| Roles | Cuatro: plataforma, administrador, encargado (`manager`) y empleado. El encargado tiene caja, clientes e historial, sin configuración (25 nov 2026, [Decisiones por validar](https://wiki.neyzt.org/doc/decisiones-por-validar-vIwlwjifkU)) | El front resuelve por rol en `src/lib/roles.ts`, no por la lista `permissions` de `/auth/me`; las páginas y las acciones lo validan en el servidor |
| Servicios de terceros | Cloudflare Turnstile en el login (encendido en producción), Cloudflare R2 para imágenes, Backblaze B2 para respaldos | Widget en `features/auth/turnstile-widget.tsx`; las llaves viven solo en Coolify, nunca en el repo |

### Violaciones conocidas

Excepciones deliberadas que siguen en el código; no se «arreglan» sin cambiar la decisión:

| Qué | Dónde | Por qué se acepta |
|-----|-------|-------------------|
| Animación de entrada y salida al iniciar sesión (~2 s al entrar, ~1.4 s al salir) | `src/features/auth/entry-transition.tsx` | Animación de marca de una sola vez, no una transición de interfaz; el resto de la app cumple < 300 ms |
| Sidebar tipo píldora que anima el ancho al expandirse (300 ms) | `src/features/business/sidebar.tsx` | No hay otra forma de expandir el panel; el resto de las transiciones usa solo transform y opacity |

La foto del cliente ya no es una violación: la decisión del 16 nov 2026 la permite solo para mostrarse y se borra al cancelar la membresía. Fuera de estas dos excepciones, ninguna al 17 de noviembre de 2026.

## 2. Decisiones abiertas

Un PR no las resuelve: si el cambio las toca, se pide la decisión y no se asume. Lo que sigue entre paréntesis es lo que el MVP asume hoy.

| Abierta | Lo que asume el MVP |
|---------|---------------------|
| Next como cliente puro | Sí: sin rutas API propias en Next |
| Verificación de correo en el registro | Sin verificación |
| Cambio de plan por el administrador ([especificación](https://wiki.neyzt.org/doc/cambio-de-plan-desde-el-panel-especificacion-para-el-backend-Y2hq28pCoX)) | Ruta apagada (`PLAN_SELF_SERVICE_ENABLED=false`) y botón oculto; en producción no se enciende hasta que el equipo decida |
| Pago simulado en pantalla | El registro y el cambio de plan muestran un pago que dice ser simulado; no hay cobro. Falta el visto bueno del equipo |
| Placa ESP32-S3 exacta | N16R8 con cámara, por confirmar |
| Wi-Fi, energía y montaje | Portal cautivo, fuente de 5 V 2 A, carcasa |

## 3. Fuera del alcance de lo que se construye ahora

Pantalla **12** (dispositivos) · chat del agente de IA (después de la defensa) · catálogo, artículos o inventario · canje de puntos · portal del cliente · sucursales · app móvil · reportes · reconocimiento facial y cualquier otro uso biométrico.

Las pantallas construidas son: **1** login, **6** panel, **7** clientes, **8** ficha del cliente (la alta de membresía y la hoja de tarjetas con QR viven en clientes; la pantalla **9** de membresías se eliminó), **10** niveles, **11** usuarios, **13** configuración, **15** movimientos, **16** caja, **17** registrar compra y **18** comprobante, más **3** (negocios) y **4** (detalle, con suspender y reactivar) para la plataforma. También están **2** (registro de negocio), **5** (planes) y **14** (plan y uso); la demo del 3 de diciembre no depende de ellas.

## 4. Reglas con número

| Regla | Número |
|-------|--------|
| Login → panel | ≤ 2 s |
| Buscar tarjeta por código | ≤ 1 s |
| Registrar compra → comprobante | ≤ 2 s |
| Filas de otro negocio visibles | **0** |
| `docker compose up` desde cero | ≤ 3 min, sin internet |
| Zona táctil mínima | 44 px |
| Contraste de texto | AA |
| Duración de una animación | < 300 ms |
| Texto en campos de formulario | ≥ 16 px (el iPhone no debe ampliar) |
| Botón primario por pantalla | **1** (dos `bg-primary` rellenos es un hallazgo) |
| Ancho de referencia | desde 360 px, mobile-first |

## 5. Lo que ya bloquea el CI — no lo reportes

Estas reglas se verifican solas en cada PR; repetirlas en un comentario es ruido:

- Texto escrito a mano en el JSX (`react/jsx-no-literals`).
- Comentarios en el código: `TODO`, `FIXME`, `HACK`, `XXX` y comentarios al final de la línea.
- Íconos fuera de Lucide y uso de `axios`.
- Hex sueltos y clases de la paleta por defecto de Tailwind (`check:tokens`).
- Claves de traducción que faltan en algún locale (`messages:check`).
- Errores de tipos (`next typegen && tsc --noEmit`) y fallos de build.

`check:tokens` solo mira `src/`: un hex en Markdown, en un badge de shields.io o en `globals.css` no es hallazgo.

Tampoco son tema de este revisor: estilo, formato, nombres de variables, rendimiento, ni gusto personal.

## 6. Archivos compartidos

Tocarlos exige decirlo en el cuerpo del PR, porque otra rama en vuelo puede estar en lo mismo:

`next.config.ts` · `package.json` · `package-lock.json` · `.env.example` · `Dockerfile` · `.github/workflows/` · `src/app/globals.css` · `messages/es.json` · `messages/en.json` · `AGENTS.md` · `BRAND.md`

## 7. Pruebas

El frontend ya tiene runner de interfaz: `@playwright/test`, con las pruebas en `tests/e2e/` (ver `CI.md`, sección 12). Eso **cambia el orden de esta lista a propósito**: el E2E entró primero porque la Etapa 4 de la materia lo pide con fecha y necesita evidencia en navegador, no porque se hayan descartado las demás pruebas. El gate del PR es `lint` + `typecheck` + `test` + `messages` + `check:tokens` + `build`; el E2E corre aparte.

La lógica pura que **duplica el backend** —`src/lib/pricing.ts` y `format.ts`— ya tiene pruebas unitarias con Vitest (`npm run test`, job `test` del CI): `calculatePurchase` repite la fórmula de `services/pricing_service.py` y una divergencia se cobra mal en caja. Ese job corre con cobertura (`npm run test:coverage`) y umbral al 100 % sobre los cuatro módulos de `src/lib/` que tienen pruebas (`pricing`, `format`, `customer-errors` y `tenant-theme`), así que una rama nueva sin pruebas se ve en el PR. Después: componentes.

El E2E cubre inicio de sesión, compra completa en caja, aislamiento entre negocios, tarjeta pública y el alta de membresía, y corre en el CI como job `e2e` (no required: depende de que el Postgres y el API arranquen).
