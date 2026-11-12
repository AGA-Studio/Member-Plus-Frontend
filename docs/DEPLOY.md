# Despliegue del frontend

La imagen que corre en producción es la misma que pasó el CI. Coolify no construye: hace `docker pull`.

## Índice

1. [Por qué así](#1-por-qué-así)
2. [Piezas](#2-piezas)
3. [Qué publica cada evento](#3-qué-publica-cada-evento)
4. [Configurar Coolify](#4-configurar-coolify)
5. [Variables de entorno](#5-variables-de-entorno)
6. [Datos y migraciones](#6-datos-y-migraciones)
7. [Rollback](#7-rollback)
8. [Probar la imagen en local](#8-probar-la-imagen-en-local)
9. [Problemas comunes](#9-problemas-comunes)
10. [Enlaces](#10-enlaces)

## 1. Por qué así

**GitHub construye, Coolify solo hace pull.** Tres consecuencias:

- El build no consume CPU del servidor de Coolify.
- La imagen desplegada es la que validaron `lint`, `typecheck`, `messages` y `build`, no una construida en otro sitio.
- **El despliegue es deliberado**: la app apunta a un tag de versión fijo (`0.1.0`, `sha-abc1234`). Mergear a `main` publica imagen pero **no** cambia producción; para publicar se cambia el tag y se redespliega.

## 2. Piezas

| Pieza | Qué hace |
|---|---|
| `Dockerfile` | Tres etapas: `deps` (`npm ci`), `builder` (`npm run build`) y `runner` (solo `.next/standalone`, `.next/static` y `public`) |
| `public/healthz.txt` | Healthcheck estático: responde sin renderizar ni leer cookies |
| `.github/workflows/image.yml` | Construye y publica en GHCR en `main` y en tags `v*` |
| `next.config.ts` | `output: "standalone"` y el `rewrite` de `/api/*` hacia el API |

La imagen final corre como usuario `nextjs` (uid 1001), escucha en `PORT` (3000 por defecto) con `HOSTNAME=0.0.0.0`, y arranca con `node server.js`. No lleva `.env`, ni tests, ni el código fuente completo.

Tamaño medido: **~321 MB**, de los cuales unos 250 MB son la base `node:22-alpine` y ~72 MB la aplicación (`node_modules` trazado por Next, con `@img/sharp` como pieza más pesada).

## 3. Qué publica cada evento

| Evento | Tags en GHCR |
|---|---|
| push a `main` | `sha-<7>`, `main`, `latest` |
| release `v0.1.0` | `sha-<7>`, `0.1.0`, `0.1` |
| `workflow_dispatch` | `sha-<7>` de la rama elegida |

**El tag de la imagen no lleva la `v`**: `v0.1.0` publica `0.1.0` y `0.1`. Es el comportamiento de `docker/metadata-action` con `pattern={{version}}`.

`latest` se mueve en cada push a `main`; **para producción se pinea el tag de versión, nunca `latest`**. `sha-<7>` es inmutable y sirve para rollback.

El paquete es **público**: `docker pull ghcr.io/aga-studio/member-plus-frontend:0.1.0` funciona sin credenciales.

## 4. Configurar Coolify

Una sola vez, en el proyecto `Member+`:

1. **Recurso → Docker Image** con `ghcr.io/aga-studio/member-plus-frontend:0.1.0`.
2. **Puerto**: `3000`.
3. **Healthcheck**: `GET /healthz.txt`, código 200.
4. **Dominio**: `memberplus.neyzt.org`, con TLS de Cloudflare.
5. **Variables**: las de la sección 5.
6. **Deploy**: manual. Cambiar el tag y redesplegar.

No hay webhook: con un tag fijo, avisar de una imagen nueva solo redespliega lo mismo.

El dominio de la app **todavía no está creado**; el del API (`api-memberplus.neyzt.org`) sí está en uso.

## 5. Variables de entorno

| Variable | Valor | Nota |
|---|---|---|
| `API_INTERNAL_URL` | `https://api-memberplus.neyzt.org` | **Se hornea en el build** |
| `PORT` | `3000` | Coincide con el puerto del healthcheck |
| `NODE_ENV` | `production` | Ya viene en la imagen |

**La trampa del rewrite.** Los `rewrites` de Next se resuelven al construir y quedan escritos en `.next/routes-manifest.json`. Comprobado:

- sin `API_INTERNAL_URL` → `afterFiles: []`
- con la variable → `afterFiles: [{source: '/api/:path*', destination: 'https://api-memberplus.neyzt.org/api/:path*'}]`

Por eso la URL entra como `--build-arg` en `image.yml`, y **cambiarla exige reconstruir la imagen**, no solo tocar la variable en Coolify. Si algún día hay que cambiarla sin rebuild, la salida sería un proxy en tiempo de ejecución, que hoy no existe.

## 6. Datos y migraciones

Aquí no hay base de datos ni migraciones: el estado vive en el API. El frontend solo sirve HTML, assets y el proxy de `/api/*`.

La cookie de sesión la emite FastAPI en `api-memberplus.neyzt.org` y el navegador la ve como propia de `memberplus.neyzt.org` **porque todo pasa por el rewrite**. No se guarda nada en `localStorage`.

## 7. Rollback

1. En Coolify, cambiar el tag de la app al `sha-<7>` o a la versión anterior.
2. Redesplegar.

No hace falta reconstruir ni volver a mergear: la imagen anterior sigue en GHCR.

## 8. Probar la imagen en local

```bash
docker run -d --name web -p 3011:3000 ghcr.io/aga-studio/member-plus-frontend:main
curl -s -o /dev/null -w '%{http_code}\n' localhost:3011/          # 200
curl -s localhost:3011/healthz.txt                                # ok
curl -s -i localhost:3011/api/v1/health | head -1                 # 404 con JSON de FastAPI
docker inspect --format '{{.Config.User}}' web                    # nextjs
```

El `404` de `/api/v1/health` es **buena señal**: significa que la petición salió por el rewrite y la contestó el API. Si devolviera el HTML de Next, el rewrite no está horneado.

Para construirla en este servidor hay una trampa conocida: `docker build` necesita `--network=host` porque el resolver de BuildKit no usa el `nameserver fe80::1%2` del host y `npm ci` muere. En GitHub Actions no hace falta.

## 9. Problemas comunes

| Síntoma | Causa |
|---|---|
| `/api/*` responde **401** aunque la sesión exista | Alguien llamó al API directo (`api-memberplus.neyzt.org`) en vez de la ruta relativa: la cookie es de otro host. En producción CORS no se ejerce, así que el síntoma es 401, no un error de CORS |
| El contenedor queda `unhealthy` | `PORT` no coincide con el del healthcheck |
| `/healthz.txt` da 404 | La etapa `runner` no copió `public/` |
| Faltan las fuentes y el build falló sin decirlo | `next/font/google` descarga en el build: sin red, falla. Se construye en CI |
| La app arranca y todo da error de conexión | `API_INTERNAL_URL` mal horneada: revisa el build-arg y reconstruye |
| Cambiaste `API_INTERNAL_URL` en Coolify y no pasa nada | Es de build, no de runtime |

## 10. Enlaces

- [CI.md](CI.md) — los jobs, los checks requeridos y el revisor automático.
- `docs/REVISION.md` — lo que el revisor automático vigila.
- `BRAND.md` — identidad visual, tokens y voz.
- Backend: `AGA-Studio/Member-Web` y su `docs/DEPLOY.md`.
