# Member+ — Identidad del sistema

> Fuente única de diseño del frontend. Todo lo de aquí está aprobado por el equipo. Si algo no está cubierto, pregunta antes de inventarlo.
> Los tokens viven en `src/app/globals.css`. Las reglas para agentes están en `AGENTS.md` (regla 7).

## 1. Esencia

**"Cada cliente reconocido, cada cobro rápido."**

Es la brújula para decidir diseño y textos:
- *Reconocido*: el cliente se siente visto. Su nombre, su nivel y su tarjeta se ven claros y con presencia.
- *Rápido*: pocos pasos, botones grandes en caja, textos directos.

Ante una duda entre dos opciones, gana la que mejor cumple esta frase.

## 2. Personalidad

| Somos | No somos |
|---|---|
| **Confiables**: calmados, claros, dicen qué pasó y qué sigue | Fríos ni corporativos |
| **Claros**: una idea por frase, sin jerga | Técnicos |
| **Ágiles**: directos a la acción | Recargados ni lentos |
| **Cercanos**: hablamos de tú | Infantiles ni bromistas |
| **Premium**: sobrios, con detalle cuidado | Ostentosos ni brillantes |

Usuario de referencia: Juan López, gerente de 35 a 45 años, poca experiencia con computadoras, usa sobre todo el celular. **Premium nunca significa más complicado.**

## 3. Dirección estética: "Claridad premium"

Tema **claro por defecto, siempre**. El modo oscuro existe, pero solo lo activa el usuario a mano; el sistema **no** sigue la configuración del dispositivo.

Seis ingredientes:
1. **Mucho aire.** Espacio generoso, poca información por pantalla.
2. **Neutros con tinte azul marino**, nunca grises planos.
3. **Un solo color fuerte:** el azul primario, solo en acciones principales.
4. **Profundidad suave:** bordes finos y sombras largas y tenues en capas. Sin sombras duras ni bordes gruesos.
5. **Tipografía con carácter:** titulares Montserrat, texto Geist, cifras grandes como protagonistas.
6. **El degradado de marca, casi nunca:** solo en login, comprobante y la tarjeta del cliente.

Lo premium vive en la **tarjeta de membresía**, con acabados metálicos (sección 5.4). El resto de la interfaz es sobria.

## 4. Logo

Archivos en `src/assets/brand/` (PNG con transparencia, se importan con `next/image`):

| Archivo | Uso |
|---|---|
| `logo-on-light.png` | Logo completo sobre fondos claros (texto azul marino) |
| `logo-on-dark.png` | Logo completo sobre fondos oscuros (texto blanco) |
| `icon-on-light.png` / `icon-on-dark.png` | Solo el ícono (tarjeta "M+") |

Favicon e íconos de app: `src/app/favicon.ico`, `icon.png`, `apple-icon.png`.

Reglas:
- El logo es de **Member+ (la plataforma)**. Cada negocio tiene el suyo; en pantallas del negocio se muestra el logo y nombre del negocio.
- Respeta un margen libre alrededor igual a la altura del ícono ÷ 4.
- Altura mínima: 24 px el logo completo, 20 px el ícono.
- No estirar, rotar, recolorear ni poner sobre fondos con poco contraste. Usa la versión para el fondo que corresponde.
- El logo y sus archivos son raster: no ampliar por encima de su tamaño original.

## 5. Color

Nunca uses hex sueltos ni la paleta por defecto de Tailwind (está desactivada). Usa los **tokens**.

### 5.1 Tokens semánticos (úsalos primero)

| Token (clase) | Claro | Oscuro | Uso |
|---|---|---|---|
| `background` | `#f6f8fc` | `#0a1020` | Fondo de página |
| `surface` | `#ffffff` | `#111a2e` | Tarjetas, paneles, campos |
| `surface-muted` | `#eef2f8` | `#1a2540` | Fondos tenues, hover de filas |
| `border` | `#dfe5ef` | `#25324d` | Bordes finos (es el color por defecto de `border`) |
| `border-strong` | `#c8d1e0` | `#364258` | Bordes de campos |
| `foreground` | `#111a2e` | `#eef2f8` | Texto principal |
| `muted` | `#5a6881` | `#9aa7bd` | Texto secundario |
| `primary` | `#0062f2` | igual | Acciones principales (relleno) |
| `primary-hover` / `primary-active` | derivados | derivados | Hover y pulsado |
| `primary-soft` | 12% de primary | 22% de primary | Botón secundario, selección |
| `primary-text` | `#0062f2` | `#6db2ff` | Texto y enlaces azules |
| `primary-foreground` | `#ffffff` | `#ffffff` | Texto sobre `primary` |
| `ring` | primary | primary | Anillo de foco |
| `success` · `success-soft` · `success-text` · `success-foreground` | `#15803d` · `#e8f6ee` · `#166534` · `#fff` | soft y text se aclaran | Éxito |
| `warning` · `-soft` · `-text` · `-foreground` | `#f59e0b` · `#fef3dc` · `#92400e` · `#111a2e` | idem | Aviso |
| `danger` · `-soft` · `-text` · `-foreground` | `#d92d20` · `#fdecea` · `#b42318` · `#fff` | idem | Error y acciones destructivas |

Info usa el azul primario.

### 5.2 Escalas crudas (solo cuando no hay token semántico)

- `brand-50` … `brand-950`: azul Member+ (`brand-600` = primario, `brand-950` = azul marino del wordmark).
- `ink-50` … `ink-950`: neutros con tinte azul marino.
- `accent-400` / `accent-500`: cian de marca. **Solo** para degradados y brillos; nunca en botones ni texto.

### 5.3 Reglas de uso
- El azul primario aparece en **una** acción principal por pantalla.
- Éxito, aviso y error siempre llevan **ícono o texto**, no solo color.
- Contraste mínimo AA (4.5:1 texto, 3:1 componentes). El primario `#0062f2` con texto blanco da 5.2:1.
- Se eligió `brand-600` y no el azul exacto del logo (`brand-500`) porque con texto blanco este último solo da 4.0:1.

### 5.4 Acabados metálicos para niveles de membresía

Solo en tarjetas e insignias de nivel. Cada negocio elige el acabado de cada uno de sus niveles.

| Acabado | Fondo | Texto | Notas |
|---|---|---|---|
| Bronce | `bg-tier-bronze` | `text-tier-bronze-foreground` | `#f3d9c3 → #cd8a52 → #8c5427` |
| Plata | `bg-tier-silver` | `text-tier-silver-foreground` | `#f1f4f9 → #c9d1de → #9aa6b8` |
| Oro | `bg-tier-gold` | `text-tier-gold-foreground` | `#f8e7a8 → #e0ae3a → #a97a10` |
| Onyx | `bg-tier-onyx` | `text-tier-onyx-foreground` | `#2a3550 → #0a1020`, borde fino `tier-onyx-edge` (cian) |

### 5.5 Degradado de marca
`bg-brand`: `#01befe → #0062f2 → #012874` a 135°. Uso muy escaso (login, comprobante, tarjeta del cliente). **Nunca en botones.**

### 5.6 Modo oscuro (manual)
- Se activa con el atributo `data-theme="dark"` en `<html>`. Por defecto no existe y el sistema es claro.
- Las variantes `dark:` de Tailwind siguen ese atributo (no la preferencia del sistema).
- El fondo es azul marino (`#0a1020`), no negro. El botón primario no cambia.
- El **interruptor de tema** (y guardar la preferencia en una cookie) está **pendiente de construir**.

### 5.7 Color por negocio
Cada negocio tendrá su color de marca. El token `primary` lee la variable `--tenant-primary` y usa `#0062f2` si no existe, y sus derivados (hover, pulsado, soft) se recalculan solos. **Pendiente:** validar el contraste del color elegido por el negocio contra el texto blanco.

## 6. Tipografía

| Familia | Uso | Clase |
|---|---|---|
| **Montserrat** | Titulares, cifras protagonistas (se parece al wordmark del logo) | `font-display` |
| **Geist** | Texto, etiquetas, botones, tablas | `font-sans` (por defecto) |
| **Geist Mono** | Códigos de tarjeta, IDs | `font-mono` |

Las tres se cargan con `next/font` (alojadas en el servidor). Los `h1`–`h4` ya usan `font-display` por defecto.

### Escala
Los títulos usan `clamp()`: se ajustan solos de celular a escritorio, sin saltos de breakpoint.

| Clase | Tamaño (celular → escritorio) | Peso | Uso |
|---|---|---|---|
| `text-display` | 36 → 48 px, interlineado 1.1 | Montserrat 700 | Login, bienvenida, cifra protagonista |
| `text-title` | 26 → 30 px, 1.2 | Montserrat 700 | Título de página (`h1`) |
| `text-heading` | 22 → 24 px, 1.25 | Montserrat 600 | Sección (`h2`) |
| `text-subheading` | 18 → 20 px, 1.4 | Montserrat 600 | Subsección (`h3`) |
| `text-lg` | 18/28 | Geist 400 | Texto grande |
| `text-base` | 16/24 | Geist 400 | **Texto base** |
| `text-sm` | 14/20 | Geist 400 | Texto pequeño |
| `text-xs` | 12/16 | Geist 400 | Notas (poco uso) |

Solo existen estos tamaños. Etiquetas y botones usan `text-sm` o `text-base` con `font-medium` / `font-semibold`.

### Reglas
1. **Mínimo 16 px (`text-base`) en campos de formulario**, para que iPhone no amplíe la pantalla.
2. **`tabular-nums`** en montos, puntos y tablas.
3. **Mayúscula solo al inicio de la frase.** Nada en TODO MAYÚSCULAS, salvo etiquetas diminutas.
4. Titulares con `tracking-display` (-0.02em): ya viene en `h1`–`h4`.
5. Líneas de 60 a 70 caracteres como máximo en textos largos.
6. Dos pesos por pantalla como regla general.

## 7. Voz y tono

Habla de **tú**, en español de México. Sobrio: **sin signos de exclamación, sin "¡Oops!", sin emojis.**

### Tono por contexto
| Dónde | Tono | Ejemplo |
|---|---|---|
| Caja | Ultra breve, solo lo esencial | "Escanea la tarjeta" · "Compra registrada" |
| Panel del negocio | Claro, con contexto | "Estos clientes vencen en 7 días" |
| Plataforma | Más sobrio y técnico | "Negocio suspendido" |
| Error | Qué pasó y cómo seguir, sin culpar | "No encontramos esa tarjeta. Revisa el código o búscala por nombre." |
| Éxito | Breve, con el dato concreto | "Compra registrada. +120 puntos" |
| Estado vacío | Invita a la siguiente acción | "Aún no hay clientes. Agrega el primero." |

### Reglas de redacción
1. **Botones con verbo en infinitivo:** "Guardar cambios", "Registrar compra", "Renovar membresía". Nunca "Aceptar" ni "OK" sueltos.
2. Mayúscula solo al inicio de la frase ("Registrar compra", no "Registrar Compra").
3. **No culpar al usuario.** Nunca "Dato inválido". Mejor: "Revisa el correo: parece incompleto".
4. **Campos opcionales** se marcan con "(opcional)" en la etiqueta. No se usan asteriscos.
5. Formatos de México: `$1,250.00 MXN`, fechas "10 nov 2026". Formatea siempre con los formateadores de `next-intl`.
6. El inglés mantiene la misma voz: simple, breve, sin jerga.

### Vocabulario
| Usamos | Evitamos |
|---|---|
| negocio | empresa, tenant, cuenta |
| cliente | usuario final, miembro |
| tarjeta, membresía | licencia, suscripción |
| puntos | créditos |
| **cashback** | bonificación, reembolso |
| caja | terminal, POS |
| lector | dispositivo IoT, hardware |
| registrar compra | procesar transacción |
| vence, vigencia | expira |

Todo texto visible se escribe en los archivos de `messages/` (ver `AGENTS.md` regla 2), nunca dentro de los componentes.

## 8. Espaciado y layout

Base de **4 px**. Solo múltiplos de 4 (`1`, `2`, `3`, `4`, `5`, `6`, `8`, `10`, `12`, `16` de Tailwind). Sin valores sueltos como `13px`.

| Dónde | Celular → escritorio |
|---|---|
| Márgenes laterales de página | 16 → 24 → 32 px (`px-4 sm:px-6 lg:px-8`) |
| Relleno de tarjetas | 20 → 24 px (`p-5 sm:p-6`) |
| Espacio entre tarjetas | 16 → 24 px (`gap-4 sm:gap-6`) |
| Entre secciones | 32 → 48 px |
| Entre campos de un formulario | 20 px (`gap-5`) |
| Etiqueta → campo | 6 px (`gap-1.5`) |

Anchos máximos:

| Clase | Ancho | Uso |
|---|---|---|
| `max-w-page` | 1200 px | Panel del negocio |
| `max-w-form` | 640 px | Formularios |
| `max-w-auth` | 440 px | Login y registro |
| `max-w-cashier` | 720 px | Caja, centrada |

Mobile-first. Breakpoints de Tailwind por defecto (`sm` 640, `md` 768, `lg` 1024, `xl` 1280). Todas las pantallas funcionan en celular y computadora.

## 9. Radios, bordes y sombras

| Clase | Valor | Uso |
|---|---|---|
| `rounded-xs` | 6 px | Casillas, chips pequeños |
| `rounded-sm` | 8 px | Etiquetas, elementos pequeños |
| **`rounded-md`** | **12 px** | **Botones y campos** |
| **`rounded-lg`** | **16 px** | **Tarjetas** |
| `rounded-card` | 20 px | Tarjeta de membresía (proporción 1.586:1) |
| `rounded-xl` | 24 px | Ventanas modales, bloques destacados |
| `rounded-full` | círculo | Insignias, avatares |

Sombras (con tinte azul marino): `shadow-xs`, `shadow-sm` (tarjetas en reposo), `shadow-md` (menús y elementos elevados), `shadow-lg` (modales).

- **Bordes de 1 px** (`border`), casi invisibles. Nunca gruesos.
- **Foco de teclado:** anillo de 2 px en el color primario con 2 px de separación. Ya está aplicado globalmente con `:focus-visible`; no lo quites.

## 10. Movimiento

- **150 ms** en hover y pulsado (`duration-150 ease-standard`), con escala 0.98 al presionar (`active:scale-[0.98]`).
- **200 a 250 ms** en ventanas y paneles que aparecen.
- Sin rebotes ni animaciones llamativas.
- Con "reducir movimiento" activado en el dispositivo, las animaciones se desactivan solas (ya está en `globals.css`).

## 11. Íconos

Solo **`lucide-react`**. Tamaños 16, 20 y 24 px (`size-4`, `size-5`, `size-6`), con `strokeWidth={1.75}` (más finos que el 2 por defecto). Color por Tailwind. Decorativos con `aria-hidden`; un ícono que sirve de botón lleva `aria-label` traducido.

## 12. Componentes (diseño aprobado, aún sin construir)

### Botones
| Variante | Se ve | Cuándo |
|---|---|---|
| **Primario** | `bg-primary` + `text-primary-foreground`; hover `primary-hover`; pulsado `primary-active` | **Uno por pantalla:** la acción principal |
| **Secundario** | `bg-primary-soft` + `text-primary-text` | Acción importante, no la principal |
| **Contorno** | `bg-surface` + `border-border-strong` | Acciones neutras ("Cancelar", "Volver") |
| **Fantasma** | Sin fondo ni borde | Acciones discretas en tablas y menús |
| **Peligro** | `bg-danger` + `text-danger-foreground` | Borrar o cancelar. **Siempre con confirmación.** |

No hay botón con degradado.

Alturas: `sm` 36 px · **`md` 44 px (por defecto, zona táctil mínima)** · `lg` 52 px · **`xl` 64 px (caja)**. Radio `rounded-md`, peso `font-semibold`.

Estados: hover y pulsado (cambia el tono y se encoge a 0.98) · foco (anillo azul) · deshabilitado (50% de opacidad, sin respuesta) · **cargando** (spinner, conserva su ancho, se bloquea; "Registrando compra…").

Reglas: ícono a la izquierda del texto; botón solo con ícono lleva `aria-label`; en celular, los botones de formulario ocupan todo el ancho; la voz sigue la sección 7.

### Campos de formulario
- Etiqueta **arriba y siempre visible** (el placeholder no la reemplaza). Alto 44 px, `rounded-md`, borde `border-strong`, `text-base`.
- Foco: borde azul más anillo. Error: borde `danger`, ícono y mensaje claro debajo. Deshabilitado: fondo `surface-muted`.
- Opcionales con "(opcional)"; ayuda en texto pequeño `muted` debajo, solo si hace falta.

### Tarjetas
`bg-surface`, `border`, `rounded-lg`, `shadow-sm`. Variantes: **normal**, **interactiva** (se eleva a `shadow-md` en hover) y **destacada** (`bg-brand`, solo en momentos de marca).

### Insignias
`rounded-full`, `text-xs font-semibold`. Tonos: neutral, azul, éxito, aviso, error (fondo `*-soft`, texto `*-text`). Más las insignias de nivel con acabados metálicos.

### Orden de construcción previsto
- **Fase A (base):** Botón, Campo, Tarjeta, Insignia, Logo.
- **Fase B (antes de las pantallas):** Selector, Casilla/Interruptor, Tabla, Ventana modal, Aviso (toast), Estado vacío, Cargando.
- **Fase C (propios de Member+):** Tarjeta de membresía con acabados metálicos, Cifra protagonista (puntos y monto), estructura de navegación, interruptor de tema.

## 13. Accesibilidad

- Contraste AA mínimo; nunca solo color para comunicar estado.
- Zonas táctiles de al menos 44 px.
- Foco de teclado siempre visible.
- Campos con etiqueta; errores asociados al campo; íconos útiles con `aria-label`.
- Respetar "reducir movimiento".
- `lang` del documento sigue al idioma activo.

## 14. Estado de implementación

| Pieza | Estado |
|---|---|
| Esencia, dirección, voz, reglas | ✅ Documentado aquí |
| Tokens de color, tipografía, radios, sombras, anchos (`globals.css`) | ✅ Listos y verificados con build |
| Fuentes Montserrat, Geist y Geist Mono | ✅ Cargadas en el layout raíz |
| Logo, favicon e íconos de app | ✅ En `src/assets/brand/` y `src/app/` |
| Íconos de interfaz (`lucide-react`) | ✅ Instalada |
| Componentes (fases A, B, C) | ⏳ Sin construir |
| Interruptor de modo oscuro y cookie | ⏳ Sin construir |
| Color por negocio y validación de contraste | ⏳ Pendiente |
| Imagen Open Graph | ⏳ Pendiente (requiere dominio) |
