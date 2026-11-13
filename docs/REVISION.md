# Criterios de revisión — frontend de Member+

Lo que un cambio no puede romper, en una página.

Este archivo lo lee `scripts/review_pr.py`, que comenta los PRs automáticamente. **No es la fuente de verdad**: manda el wiki (`wiki.neyzt.org`, colección `9no`) y, para diseño, `BRAND.md`. Si aquí dice una cosa y ellos otra, ganan ellos y esto se corrige.

> Última sincronización: **13 de noviembre de 2026**.
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
| Identidad | **Sin reconocimiento facial ni fotos** | El lector y la webcam solo leen el QR |
| Hostnames | App en `memberplus.neyzt.org`, API en `api-memberplus.neyzt.org` | `/api/*` reescrito en Next; **guion y no punto** (el SSL de Cloudflare cubre un nivel) |
| Despliegue | Imagen standalone en GHCR; **mergear a `main` despliega** (webhook al tag `latest`) | `output: "standalone"`; Coolify no construye |

## 2. Decisiones abiertas

Un PR no las resuelve: si el cambio las toca, se pide la decisión y no se asume. Lo que sigue entre paréntesis es lo que el MVP asume hoy.

| Abierta | Lo que asume el MVP |
|---------|---------------------|
| Next como cliente puro | Sí: sin rutas API propias en Next |
| Alta de negocio | Por script o seed; sin formulario público (pantalla 2 fuera) |
| Planes y cobro | Fuera del prototipo, sin pasarela |
| Puntos: campo o historial | Historial de movimientos; el saldo se calcula |
| Placa ESP32-S3 exacta | N16R8 con cámara, por confirmar |
| Wi-Fi, energía y montaje | Portal cautivo, fuente de 5 V 2 A, carcasa |

## 3. Fuera del alcance de lo que se construye ahora

Pantallas **2** (registro de negocio), **4** (detalle del negocio), **5** (planes), **11** (usuarios), **12** (dispositivos), **13** (configuración) y **14** (plan y uso) · catálogo, artículos o inventario · canje de puntos · portal del cliente · sucursales · app móvil · reportes · reconocimiento facial · fotos de clientes.

Las pantallas del MVP son: **1** login, **7** clientes, **8** ficha del cliente, **9** membresías con QR, **10** niveles, **15** movimientos, **16** caja, **17** registrar compra y **18** comprobante, más **3** (negocios) en solo lectura para la plataforma.

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
