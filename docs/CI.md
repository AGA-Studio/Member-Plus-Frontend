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
| `build` | `npm run build` | Que Next compile, incluidas las fuentes y los tokens | 62 s |

Los cuatro son required checks: sin ellos en verde, el PR no se puede mergear.

**Los nombres no se cambian.** `lint`, `typecheck`, `messages` y `build` son exactamente lo que el ruleset espera; renombrar un job deja el PR bloqueado esperando un check que ya no existe.

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
| Tests de componentes | Cuando existan los de la fase A de `BRAND.md` (Vitest + Testing Library) |
| Cobertura | Con los primeros tests; no tiene sentido medir cero |
| Pruebas de extremo a extremo | Después de la demo, con Playwright |
| Despliegue automático | No: el deploy es deliberado por tag (ver [DEPLOY.md](DEPLOY.md)) |
| Revisión de accesibilidad | Manual por ahora; `BRAND.md` la exige |

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
- **Corre una vez por PR**: al abrir, reabrir o salir de borrador. Un push posterior no lo repite; si quieres otra pasada, se relanza desde Actions (`workflow_dispatch`) o se cierra y reabre.
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
