# CI del frontend

Qué corre en cada PR, por qué y cómo reproducirlo. Guía del despliegue en [DEPLOY.md](DEPLOY.md).

## Índice

1. [Por qué](#1-por-qué)
2. [Los jobs](#2-los-jobs)
3. [Cuándo corre](#3-cuándo-corre)
4. [Cómo correr lo mismo en local](#4-cómo-correr-lo-mismo-en-local)
5. [Qué vigila cada chequeo de convenciones](#5-qué-vigila-cada-chequeo-de-convenciones)
6. [Versiones fijadas](#6-versiones-fijadas)
7. [Cómo cambiar un workflow](#7-cómo-cambiar-un-workflow)
8. [Qué no cubre todavía](#8-qué-no-cubre-todavía)
9. [Problemas comunes](#9-problemas-comunes)
10. [Reglas](#10-reglas)
11. [Revisor automático de PRs](#11-revisor-automático-de-prs)
12. [Pruebas de interfaz (Playwright)](#12-pruebas-de-interfaz-playwright)
13. [Previews por PR](#13-previews-por-pr)

## 1. Por qué

Antes de esto, un PR se mergeaba con lo que el autor recordara correr. El CI pone cinco verificaciones **deterministas** — mismo commit, mismo resultado, sin depender de nada externo — y las marca como obligatorias en el ruleset `protect-main`.

Aparte va el revisor automático, que opina pero no bloquea.

## 2. Los jobs

| Job | Qué corre | Qué atrapa | Tiempo de referencia |
|---|---|---|---|
| `lint` | `npm run lint` y `npm run check:tokens` | Reglas de ESLint y convenciones de diseño | 34 s |
| `typecheck` | `npm run typecheck` | Errores de tipos en todo el proyecto | 50 s |
| `messages` | `npm run messages:check` | Claves de traducción que faltan en algún idioma | 43 s |
| `test` | `npm run test:coverage` | Que `src/lib/pricing.ts` y `format.ts` sigan calculando como el backend, y que el tema del negocio y el mapeo de errores no queden sin cubrir | 37 s |
| `build` | `npm run build` | Que Next compile, incluidas las fuentes y los tokens | 62 s |
| `e2e` | `npm run test:e2e` contra un Postgres efímero y la imagen publicada del API | Que la caja, el aislamiento entre negocios y la tarjeta pública sigan funcionando de punta a punta | 91 s |

`e2e` corre en cada PR pero **no va al ruleset**: depende de que el Postgres y la imagen del API arranquen, así que un fallo de infraestructura no debe bloquear merges ajenos al cambio (sección 10).

Los cinco primeros son required checks: sin ellos en verde, el PR no se puede mergear.

**Los nombres no se cambian.** `lint`, `typecheck`, `messages`, `test` y `build` son exactamente lo que el ruleset espera; renombrar un job deja el PR bloqueado esperando un check que ya no existe.

## 3. Cuándo corre

- `pull_request` contra `main` y `push` a `main`, más `workflow_dispatch` para lanzarlo a mano.
- `preview.yml` corre en `pull_request` (abierto, actualizado, reabierto y cerrado): publica la imagen `pr-<n>` y despliega la preview de Coolify; al cerrar borra la preview (sección 13).
- `concurrency` con `cancel-in-progress`: un push nuevo cancela el run anterior de la misma rama.
- `permissions: contents: read`: el CI no escribe nada en el repo.
- No usa secretos, así que también corre en PRs desde forks.

## 4. Cómo correr lo mismo en local

```bash
npm ci                    # instala exactamente lo del package-lock
npm run lint              # ESLint
npm run check:tokens      # hex sueltos y paleta por defecto de Tailwind
npm run typecheck         # next typegen && tsc --noEmit
npm run messages:check    # es.json contra en.json
npm run test              # Vitest: todos los src/**/*.test.ts
npm run test:coverage     # lo mismo con cobertura y umbral
npm run build             # build de producción
```

`npm ci` borra `node_modules` y reinstala desde el lock. Si en el CI falla y en local pasa, casi siempre es `package-lock.json` desincronizado: corre `npm install` y commitea el lock.

En el CI ese paso casi no se paga: los seis jobs restauran `node_modules` de `actions/cache` con el hash del
lock como llave, así que solo instalan cuando las dependencias cambian. `node_modules` está en `.gitignore`,
pero el caché se guarda aparte y nunca entra al repo.

## 5. Qué vigila cada chequeo de convenciones

Todo esto sale de `AGENTS.md` y `BRAND.md`, y está implementado en `eslint.config.mjs` y `scripts/check-tokens.mjs`:

| Regla | Qué bloquea |
|---|---|
| `react/jsx-no-literals` | Texto visible escrito a mano en el JSX: va por `t()` |
| `no-warning-comments` | `TODO`, `FIXME`, `HACK`, `XXX` |
| `no-inline-comments` | Comentarios al final de una línea de código |
| `no-restricted-imports` | Íconos fuera de Lucide y `axios` |
| `check:tokens` | Hex sueltos fuera de `globals.css` y clases como `bg-blue-500` |
| `messages:check` | Una clave presente en `es.json` y ausente en `en.json` |

`jsx-no-literals` corre con `ignoreProps: true`: los atributos no se vigilan.

## 6. Versiones fijadas

| Pieza | Versión | Nota |
|---|---|---|
| Node | 22 | Sale de `.nvmrc`; `engines` lo repite en `package.json` |
| `vitest` y `@vitest/coverage-v8` | `^5.1.0` | Van a la par; la cobertura es v8 |
| `actions/checkout` | `@v7` | Tag mayor flotante |
| `actions/setup-node` | `@v7` | Tag mayor flotante, con caché de npm |
| `actions/cache` | `@v6` | Tag mayor flotante; cachea `node_modules` y `~/.cache/ms-playwright` |
| `docker/setup-buildx-action` | `@v4` | `image.yml` y `preview.yml` |
| `docker/build-push-action` | `@v7` | `image.yml` y `preview.yml` |
| `docker/login-action` | `@v4` | `image.yml` y `preview.yml` |
| `docker/metadata-action` | `@v6` | Solo en `image.yml` |

Para ver la última versión de una action:

```bash
gh api repos/actions/setup-node/releases/latest --jq .tag_name
```

## 7. Cómo cambiar un workflow

`.github/workflows/` es archivo compartido: los cambios van en su propio PR y se avisan en el cuerpo, porque otra rama puede estar tocando lo mismo.

Antes de subir, valida el YAML:

```bash
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml'))"
```

Y si agregas un job, decide a propósito si va al ruleset: solo los deterministas (ver sección 10).

## 8. Qué no cubre todavía

| Sin cubrir | Nota |
|---|---|
| Pruebas de componentes | Son server components con `cookies()` y `redirect()`: probarlos pide montar buena parte de Next |
| Revisión de accesibilidad | Manual; `BRAND.md` la exige |

Lo que sí está cubierto: las pruebas unitarias de `src/**/*.test.ts` (job `test`) y las de extremo a extremo (job `e2e`, sección 12). `pricing.test.ts` repite los casos de `tests/unit/test_pricing_service.py` del backend y compara `calculatePurchase` con aritmética entera exacta: si la fórmula cambia en el backend, hay que cambiarla en `pricing.ts` y en estas pruebas. La cobertura (`npm run test:coverage`) exige 100 % en cuatro módulos de `src/lib/` (`pricing.ts`, `format.ts`, `customer-errors.ts`, `tenant-theme.ts`), con umbral en `vitest.config.mts`; para exigirla en lógica nueva se amplía `coverage.include`.

El despliegue lo hace `image.yml` en cada push a `main`; los detalles están en [DEPLOY.md](DEPLOY.md).

## 9. Problemas comunes

| Síntoma | Causa |
|---|---|
| `Cannot find name 'LayoutProps'` | Falta `next typegen` antes de `tsc`; el tipo vive en `.next/types` y `next-env.d.ts` está en `.gitignore` |
| `npm ci` falla y en local funciona | `package-lock.json` desincronizado |
| `en.json: faltan N` | Se agregó una clave a `es.json` y no al inglés |
| `hex suelto (…)` | Falta usar un token de `globals.css` |
| `paleta por defecto (bg-blue-500)` | Tailwind 4 tiene la paleta desactivada; usa `bg-primary`, `bg-surface`… |
| El job quedó **verde** y no hizo nada | Revisa el log: un `continue-on-error` o un `if` que se saltó el paso |
| Playwright se queda en `/login` en el proyecto `setup` | El API no está arriba (o la base está atrás): sin él la acción de login falla y no hay sesión que guardar |
| Playwright falla al navegar después de tener sesión | El archivo de `tests/e2e/.auth/` es viejo (la cookie dura 8 h): borra la carpeta y vuelve a correr |

## 10. Reglas

1. **El CI no se salta.** Si un check rompe, se arregla en el mismo PR; no se agrega `--no-verify` ni se desactiva la regla.
2. **Al ruleset solo van checks deterministas.** Mismo commit, mismo resultado, sin depender de servicios externos. Por eso `review` no es obligatorio: falla cuando el modelo no tiene cupo y no es reproducible.
3. **Un cambio de regla es un cambio de PR.** Ajustar `eslint.config.mjs` o `check-tokens.mjs` se revisa como cualquier código, no se hace de paso.

## 11. Revisor automático de PRs

`review.yml` corre `scripts/review_pr.py`: lee `docs/REVISION.md` y `AGENTS.md`, mira el diff y publica **un** comentario con lo que contradice la documentación o el diseño.

- **No bloquea**: no está en el ruleset. Es un aviso para quien revisa.
- **Corre una vez por PR**: al abrir, reabrir o salir de borrador. Un push posterior no lo repite; si quieres otra pasada, se relanza desde Actions (`workflow_dispatch`, pasando el número de PR en el input `pr`) o se cierra y reabre. El re-run **edita el mismo comentario** (`<!-- revisor-frontend -->`), no deja uno nuevo: si no ves otro, mira el `updated_at`.
- **Solo si el workflow está en la rama base**: un PR que agrega `review.yml` no se auto-revisa.
- Modelo `deepseek-v4.1-flash`. Presupuesto de 16 k y 24 k tokens con `MODEL_TIMEOUT=300`; el diff se recorta a 20 k caracteres.
- Necesita el secreto `OPENCODE_API_KEY`. Sin él (PRs desde forks) no hace nada y sale con 0.

**Qué reporta**: decisiones cerradas contradichas, decisiones abiertas resueltas sin decirlo, pantallas fuera del alcance del MVP, archivos compartidos no mencionados, y reglas de diseño o de número.

**Qué no reporta**: lo de la sección 5 de este documento, ni estilo, nombres o rendimiento. Eso ya lo bloquea el CI.

Probar en local, sin llamar a GitHub:

```bash
OPENCODE_API_KEY=... python3 -m scripts.review_pr --diff-file mi.diff --dry-run
```

Si un hallazgo está mal, gana tu criterio; si el error es de la rúbrica, se corrige en `docs/REVISION.md`.

## 12. Pruebas de interfaz (Playwright)

`@playwright/test` está en `devDependencies`, la configuración en `playwright.config.ts` y las pruebas en
`tests/e2e/`. Cada prueba corre en dos proyectos: **escritorio** (1280×800) y **móvil** (Pixel 7 emulado).

```bash
npm run test:e2e                                    # todo
npm run test:e2e:ui                                 # modo interactivo
npx playwright test tests/e2e/login.spec.ts --project=escritorio
PW_VIDEO=1 npx playwright test tests/e2e/cashier-checkout.spec.ts   # con vídeo
```

Con `PW_VIDEO=1` se graba **un vídeo por prueba** en `test-results/<prueba>/video.webm`; sin la variable, el
vídeo solo se guarda cuando la prueba falla (`retain-on-failure`). Para compartirlo hay que pasarlo a mp4
(`ffmpeg -i video.webm -c:v libx264 salida.mp4`): `test-results/` está en `.gitignore` y no se commitea.

Lo que hace falta en local:

1. El API en `http://127.0.0.1:8000` con los usuarios de demo (`uv run python -m scripts.seed` en Member-Web).
2. `.env.local` con `API_INTERNAL_URL=http://127.0.0.1:8000`. El login del navegador llama a `/api/v1/...`
   y ese rewrite solo existe cuando la variable está definida; sin ella todas las pruebas fallan en el login.
3. Navegadores instalados una vez: `npx playwright install chromium`.

El `webServer` del config levanta `npm run dev` y reutiliza el servidor si ya está corriendo; en CI arranca
uno propio. Sin `TURNSTILE_SITEKEY` no hay captcha, así que en local no se pelea con Turnstile.

Las pruebas simulan `prefers-reduced-motion: reduce` (`use.reducedMotion`). La app respeta esa preferencia
en `entry-transition.tsx` (`begin()` devuelve `false`), así que se salta el intro del login y los snapshots
del trace muestran la pantalla final en lugar de la cortina con el logo. Para probar el intro hace falta la
excepción explícita, `test.use({ reducedMotion: "no-preference" })` en la prueba que lo cubra.

Al cargar una ruta interna **con sesión** el layout también dispara el intro (`playOnLoad`), y la cortina se
pintaba aunque hubiera «reducir movimiento»: 350 ms de azul antes de retirarse. Dos cosas lo resuelven, y
ninguna es opcional:

- La cortina lleva `motion-reduce:hidden`, así que con la preferencia activa no se pinta.
- Las pruebas navegan con `gotoApp()` en vez de `page.goto()`: navega y espera a que `[data-entry-overlay]`
  desaparezca. Sin esa espera, un `toBeDisabled()` se cumple con el contenido tapado y el trace enseña el
  splash: la prueba pasa sin haber comprobado la pantalla. Sin la preferencia, la cortina tarda ~2.5 s en
  irse (cortina, vuelo del logo y revelado).

Cuidado con el bloqueo de login: el API bloquea un correo 15 minutos tras 5 intentos fallidos. La prueba de
credenciales inválidas usa un correo desechable por ejecución (`e2e-<timestamp>@…`) para no tocar nunca a los
usuarios de demo.

La prueba que más vale es la de aislamiento: el administrador de Gimnasio Titán no debe ver nada de Café
Aurora. Si esa falla, el multi-negocio está roto.

Archivos y qué cubre cada uno:

| Archivo | Qué prueba |
|---|---|
| `login.spec.ts` | Entrada por rol, contraseña incorrecta y aislamiento en el panel |
| `auth.setup.ts` | Proyecto `setup`: guarda las tres sesiones en `.auth/` (no es una prueba) |
| `cashier-checkout.spec.ts` | Compra completa de $1,000 en Oro: resumen (−$150.00, $850.00, +85 puntos, +$25.50 de cashback), comprobante y el formulario deshabilitado sin tarjeta |
| `cashier-isolation.spec.ts` | El cajero de Café Aurora no encuentra `MP-3GYM4` (Gimnasio Titán) ni por el diálogo ni entrando directo con `?code=` |
| `public-card.spec.ts` | El enlace de la tarjeta, copiado del diálogo «Entregar tarjeta», abre en un contexto **sin sesión**; un enlace inválido muestra «Este enlace no funciona» |
| `new-membership.spec.ts` | Alta completa (nombre válido, cae en la ficha) y el aviso cuando el nombre no cumple la regla |

Las pruebas **escriben datos**: cada corrida registra compras y crea membresías, así que los correos son
únicos por ejecución y las comprobaciones miran lo que acaba de crear esa corrida, nunca totales del negocio.

### Sesiones por rol

Cada prueba arranca ya dentro de la app: el proyecto `setup` (`tests/e2e/auth.setup.ts`) guarda una sesión
por rol en `tests/e2e/.auth/` y los proyectos `escritorio` y `movil` dependen de él.

| Archivo | Usuario | Lo usan |
|---|---|---|
| `admin-aurora.json` | `admin@cafe-aurora.mx` | tarjeta pública y alta de membresía |
| `caja-aurora.json` | `caja@cafe-aurora.mx` | compra completa y aislamiento en caja |
| `admin-titan.json` | `admin@gimnasio-titan.mx` | reservado para las pruebas de aislamiento desde el otro negocio |

- **Los archivos no se commitean**: llevan la cookie de sesión y `/tests/e2e/.auth/` está en `.gitignore`.
- **Se regeneran en cada corrida**, no se reutiliza uno viejo: la cookie dura 8 h
  (`ACCESS_TOKEN_EXPIRE_MINUTES`) y un archivo vencido se manifiesta como «no redirige», el mismo síntoma
  mudo que cuando falta `API_INTERNAL_URL`.
- **`login.spec.ts` no usa estas sesiones a propósito**: es la prueba que verifica el formulario de entrada.
- Un solo archivo compartido rompería el aislamiento: el rol que abre la sesión es lo que hace que la
  prueba de Café Aurora contra Gimnasio Titán signifique algo.

### Nombres en el alta

`PersonName` (`schemas/validators.py` del backend) solo acepta letras, espacios, guiones y apóstrofos, con al
menos dos letras; si no se cumple, responde 422 con `loc: ["body", "full_name"]`. Por eso las pruebas generan
nombres **solo de letras**, y un caso comprueba que un nombre con números muestre el aviso de caracteres no
permitidos.

### En el CI

En CI las pruebas corren con **dos workers** (`workers: 2` en la config): el runner tiene 4 vCPU y con uno
solo las pruebas van en fila. Cada prueba escribe datos únicos por corrida, y la de la tarjeta pública
usa un cliente distinto en cada proyecto porque generar un enlace revoca el anterior del mismo cliente.

El job `e2e` levanta un Postgres efímero, arranca el API con la imagen publicada
(`ghcr.io/aga-studio/member-web:latest`, que migra al arrancar), siembra los datos de demo con
`python -m scripts.seed` dentro de la misma imagen y corre Playwright con `chromium` instalado. No es
required check (sección 2).

El contenedor del API arranca **antes** de instalar nada y sin esperar: baja la imagen y corre las
migraciones mientras el job restaura `node_modules` y Chromium, y la espera de `/health` (con su
`docker exec … scripts.seed`) queda justo antes de lanzar Playwright. El binario de Chromium se cachea con
el hash del lock, así que solo se descarga cuando cambia `@playwright/test`.

## 13. Previews por PR

`preview.yml` publica una imagen por PR y pide a Coolify una preview en `<n>-memberplus.neyzt.org`.
Producción no se toca: `latest` solo lo mueve `image.yml` en `main`.

| Paso | Qué hace |
|---|---|
| Construir | `docker build` con la etiqueta `pr-<n>` (mutable: se reemplaza en cada push) |
| Abrir | `POST /api/v1/applications/<app>/previews` con `docker_tag: pr-<n>` e `instant_deploy` |
| Cerrar | `DELETE /api/v1/applications/<app>/previews/<n>` cuando el PR se cierra |

Requisitos en Coolify (los configura quien administra el panel, no el repo):

1. *Preview Deployments* encendido en la app «Frontend».
2. *Preview URL template* en `{{pr_id}}-memberplus.neyzt.org` — **un nivel**; la plantilla por defecto (`{{pr_id}}.{{domain}}`) da dos niveles y el SSL Universal de Cloudflare no los cubre.
3. `COOLIFY_TOKEN` con permisos `deploy`, `write` (abrir la preview o cambiar su etiqueta) y `delete` (borrarla al cerrar).
4. En el API, `TURNSTILE_ALLOWED_HOSTS=*-memberplus.neyzt.org`: `siteverify` devuelve el hostname de la preview y sin eso el login responde `turnstile_failed`.

Límites por diseño:

- **Un contenedor por PR abierto.** Se apaga al cerrar; si el run de cierre falla, la preview queda y se borra desde el panel.
- **La preview usa el API y la base reales** (las variables de *preview* se clonan de producción). Es para revisar la interfaz; no es un entorno de pruebas con datos aparte.
- **PRs desde forks no tienen preview**: no reciben `COOLIFY_TOKEN`.
- La preview queda fuera de `latest` y del despliegue: un PR no puede romper producción por esta vía.

