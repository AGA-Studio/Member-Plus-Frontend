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

## 1. Por qué

Antes de esto, un PR se mergeaba con lo que el autor recordara correr. El CI pone cuatro verificaciones **deterministas** — mismo commit, mismo resultado, sin depender de nada externo — y las marca como obligatorias en el ruleset `protect-main`.

Aparte va el revisor automático, que opina pero no bloquea.

## 2. Los jobs

| Job | Qué corre | Qué atrapa | Tiempo medido |
|---|---|---|---|
| `lint` | `npm run lint` y `npm run check:tokens` | Reglas de ESLint y convenciones de diseño | 34 s |
| `typecheck` | `npm run typecheck` | Errores de tipos en todo el proyecto | 50 s |
| `messages` | `npm run messages:check` | Claves de traducción que faltan en algún idioma | 43 s |
| `test` | `npm run test:coverage` | Que `src/lib/pricing.ts` y `format.ts` sigan calculando como el backend, y que no queden líneas sin cubrir | 37 s |
| `build` | `npm run build` | Que Next compile, incluidas las fuentes y los tokens | 62 s |
| `e2e` | `npm run test:e2e` contra un Postgres efímero y la imagen publicada del API | Que la caja, el aislamiento entre negocios y la tarjeta pública sigan funcionando de punta a punta | 94 s |

`e2e` corre en cada PR pero **no va al ruleset**: depende de que el Postgres y la imagen del API arranquen, así que un fallo de infraestructura no debe bloquear merges ajenos al cambio (sección 10).

Los cinco son required checks: sin ellos en verde, el PR no se puede mergear.

**Los nombres no se cambian.** `lint`, `typecheck`, `messages`, `test` y `build` son exactamente lo que el ruleset espera; renombrar un job deja el PR bloqueado esperando un check que ya no existe.

## 3. Cuándo corre

- `pull_request` contra `main` y `push` a `main`, más `workflow_dispatch` para lanzarlo a mano.
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
npm run test              # Vitest: pricing.ts y format.ts
npm run test:coverage     # lo mismo con cobertura y umbral
npm run build             # build de producción
```

`npm ci` borra `node_modules` y reinstala desde el lock. Si en el CI falla y en local pasa, casi siempre es `package-lock.json` desincronizado: corre `npm install` y commitea el lock.

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
| `docker/setup-buildx-action` | `@v4` | Solo en `image.yml` |
| `docker/build-push-action` | `@v7` | Solo en `image.yml` |
| `docker/login-action` | `@v4` | Solo en `image.yml` |
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

| Falta | Cuándo |
|---|---|
| ~~Pruebas unitarias de la lógica pura~~ | **Hechas** (`src/lib/pricing.test.ts`, `src/lib/format.test.ts`, job `test`). Repiten los casos de `tests/unit/test_pricing_service.py` del backend y comparan `calculatePurchase` con aritmética entera exacta; si la fórmula cambia en el backend, hay que cambiarla en `pricing.ts` y en estas pruebas |
| Tests de componentes | Después de la demo, con Testing Library: son server components con `cookies()` y `redirect()`, hay que montarles medio Next |
| ~~Cobertura~~ | **Hecha** (`npm run test:coverage`): 100 % en `src/lib/pricing.ts` y `format.ts`, con umbral en `vitest.config.mts`. Si se agrega lógica pura nueva, se amplía `coverage.include` |
| Pruebas de extremo a extremo | Existen las de inicio de sesión, caja, aislamiento y tarjeta pública (sección 12), y corren en el CI como job `e2e`. Falta el alta de membresía: **está bloqueada por un bug** del formulario, no por falta de pruebas |
| Revisión de accesibilidad | Manual por ahora; `BRAND.md` la exige |

El job `test` (Vitest) ya va junto a los cinco actuales y es required; el de Playwright (`e2e`) también corre en cada PR, pero se queda fuera del ruleset porque depende de que el Postgres y la API arranquen (ver secciones 2 y 10).

El despliegue ya no está en esta lista: `image.yml` publica en GHCR y llama al webhook de Coolify en cada push a `main`; los detalles están en [DEPLOY.md](DEPLOY.md).

## 9. Problemas comunes

| Síntoma | Causa |
|---|---|
| `Cannot find name 'LayoutProps'` | Falta `next typegen` antes de `tsc`; el tipo vive en `.next/types` y `next-env.d.ts` está en `.gitignore` |
| `npm ci` falla y en local funciona | `package-lock.json` desincronizado |
| `en.json: faltan N` | Se agregó una clave a `es.json` y no al inglés |
| `hex suelto (…)` | Falta usar un token de `globals.css` |
| `paleta por defecto (bg-blue-500)` | Tailwind 4 tiene la paleta desactivada; usa `bg-primary`, `bg-surface`… |
| El job quedó **verde** y no hizo nada | Revisa el log: un `continue-on-error` o un `if` que se saltó el paso |

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
```

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

Cuidado con el bloqueo de login: el API bloquea un correo 15 minutos tras 5 intentos fallidos. La prueba de
credenciales inválidas usa un correo desechable por ejecución (`e2e-<timestamp>@…`) para no tocar nunca a los
usuarios de demo.

La prueba que más vale es la de aislamiento: el administrador de Gimnasio Titán no debe ver nada de Café
Aurora. Si esa falla, el multi-negocio está roto.

Archivos y qué cubre cada uno:

| Archivo | Qué prueba |
|---|---|
| `login.spec.ts` | Entrada por rol, contraseña incorrecta y aislamiento en el panel |
| `cashier-checkout.spec.ts` | Compra completa de $1,000 en Oro: resumen (−$150.00, $850.00, +85 puntos, +$25.50 de cashback), comprobante y el formulario deshabilitado sin tarjeta |
| `cashier-isolation.spec.ts` | El cajero de Café Aurora no encuentra `MP-3GYM4` (Gimnasio Titán) ni por el diálogo ni entrando directo con `?code=` |
| `public-card.spec.ts` | El enlace de la tarjeta, copiado del diálogo «Entregar tarjeta», abre en un contexto **sin sesión**; un enlace inválido muestra «Este enlace no funciona» |
| `new-membership.spec.ts` | **En `fixme`**: el alta está rota (ver abajo) |

Las pruebas **escriben datos**: cada corrida registra compras y crea membresías, así que los correos son
únicos por ejecución y las comprobaciones miran lo que acaba de crear esa corrida, nunca totales del negocio.

### El alta de membresía está rota

El diálogo abre y los campos llegan al cuerpo del envío (`_1_fullName` con el nombre escrito), pero la
acción de servidor los recibe vacíos y responde «Escribe el nombre del cliente.». Pasa en `/clientes` y en
`/membresias`, con `npm run dev` y con `next start` sobre el build de producción.

`_1_` es el prefijo que React pone en los formularios con `useActionState`; el servidor lo quita cuando el
cuerpo lleva su `$ACTION_KEY`. En estas pantallas conviven varios formularios de esos montados a la vez
—cada fila de la lista trae los diálogos de editar, renovar y cancelar— y el envío sale con el prefijo pero
sin la clave que le corresponde. Los casos están escritos con la expectativa correcta en
`tests/e2e/new-membership.spec.ts`: fallan en cuanto se quite el `fixme` después del arreglo.

### En el CI

El job `e2e` levanta un Postgres efímero, arranca el API con la imagen publicada
(`ghcr.io/aga-studio/member-web:latest`, que migra al arrancar), siembra los datos de demo con
`python -m scripts.seed` dentro de la misma imagen y corre Playwright con `chromium` instalado. No es
required check (sección 2).

