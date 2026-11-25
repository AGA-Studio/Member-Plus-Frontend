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
- **Mergear a `main` despliega**: el stack apunta al tag móvil `latest` y el workflow pide a Coolify que jale la imagen y reinicie. Los releases (`0.1.0`) marcan el hito; ya no son la vía de despliegue.

## 2. Piezas

| Pieza | Qué hace |
|---|---|
| `Dockerfile` | Tres etapas: `deps` (`npm ci`), `builder` (`npm run build`) y `runner` (solo `.next/standalone`, `.next/static` y `public`) |
| `public/healthz.txt` | Healthcheck estático: responde sin renderizar ni leer cookies |
| `.github/workflows/image.yml` | Construye y publica en GHCR en `main` y en tags `v*` |
| `next.config.ts` | `output: "standalone"` |
| `src/proxy.ts` | Reenvía `/api/*` hacia el API |

La imagen final corre como usuario `nextjs` (uid 1001), escucha en `PORT` (3000 por defecto) con `HOSTNAME=0.0.0.0`, y arranca con `node server.js`. No lleva `.env`, ni tests, ni el código fuente completo.

Tamaño medido: **~321 MB**, de los cuales unos 250 MB son la base `node:22-alpine` y ~72 MB la aplicación (`node_modules` trazado por Next, con `@img/sharp` como pieza más pesada).

## 3. Qué publica cada evento

| Evento | Tags en GHCR | ¿Despliega? |
|---|---|---|
| push a `main` | `sha-<7>`, `main`, `latest` | **Sí**: el paso *Pedir deploy a Coolify* reinicia el stack jalando la imagen |
| release `v0.1.0` | `sha-<7>`, `0.1.0`, `0.1` | No: marca el hito, no toca producción |
| `workflow_dispatch` | `sha-<7>` de la rama elegida | Solo si se lanzó desde `main` |

**El tag de la imagen no lleva la `v`**: `v0.1.0` publica `0.1.0` y `0.1`. Es el comportamiento de `docker/metadata-action` con `pattern={{version}}`.

`latest` (y su gemelo `main`) se mueven en cada push a `main` — **nunca** con un tag `v*` — y es el tag que sirve Coolify: móvil a propósito, es el mecanismo del despliegue automático. `sha-<7>` es inmutable y sirve para rollback.

El paquete es **público**: `docker pull ghcr.io/aga-studio/member-plus-frontend:0.1.0` funciona sin credenciales.

## 4. Configurar Coolify

Una sola vez, en el proyecto `Member+`:

Desde el 23 nov 2026 el frontend corre en el proyecto `Member+` como un stack balanceado:

1. **Stack de Compose** *Frontend Balanced*: dos servicios (`web-a` y `web-b`) con la imagen `ghcr.io/aga-studio/member-plus-frontend:latest`, sin dominios propios.
2. **Puerto**: `3000`.
3. **Balanceador**: dynamic config del proxy `memberplus-lb.yaml`, con la regla `Host(memberplus.neyzt.org) && PathPrefix(/)`, prioridad 60 y health check sobre `/healthz.txt` cada 10 s.
4. **Dominio**: `memberplus.neyzt.org`, con TLS de Cloudflare. **Host compartido desde el 21 nov 2026** con la landing (repo `Member-Plus-Landing`, prioridad 100), que se queda con `/`, `/privacidad`, `/terminos` y `/en*`; este frontend sirve el resto de las rutas y va **noindex**.
5. **Variables**: las de la sección 5.
6. **Token de despliegue (obligatorio para el despliegue automático).** En Coolify → *Keys & Tokens* → *API Tokens*, un token con permiso **`deploy`**. Después, en este repo:

   ```bash
   gh secret set COOLIFY_TOKEN --body '<token-con-permiso-deploy>'
   ```

   Sin `COOLIFY_TOKEN` el paso solo imprime un aviso y el deploy sigue siendo manual.

El workflow llama a `POST /api/v1/services/{uuid}/restart?latest=true` (el UUID del stack está en `image.yml`) y no al deploy webhook: el webhook de un stack recrea los contenedores sin jalar la imagen ([coollabsio/coolify#5318](https://github.com/coollabsio/coolify/issues/5318)).

El dominio de la app está en uso desde el 13 nov 2026; el del API (`api-memberplus.neyzt.org`) desde el 12.

## 5. Variables de entorno

| Variable | Valor | Nota |
|---|---|---|
| `API_INTERNAL_URL` | `https://api-memberplus.neyzt.org` | **Se lee en runtime** |
| `PORT` | `3000` | Coincide con el puerto del healthcheck |
| `NODE_ENV` | `production` | Ya viene en la imagen |

**El proxy se resuelve en runtime.** El navegador pide `/api/*` a este mismo origen —así la cookie httpOnly sigue siendo de primera parte— y `src/proxy.ts` reenvía la petición a `${API_INTERNAL_URL}`. El destino se calcula al atender la petición, no en `next build`: comprobado, `.next/routes-manifest.json` sale con `afterFiles: []` y el valor vive en el entorno del contenedor, no en la imagen. Cambiar la URL es cambiar la variable en Coolify y **redesplegar** (el contenedor tiene que recrearse para tomar el entorno nuevo), nunca reconstruir la imagen.

**El default es la trampa.** Si `API_INTERNAL_URL` falta, el proxy cae en `http://127.0.0.1:8000` y toda llamada del navegador muere: el panel carga y no funciona nada. Es el único síntoma que hay que revisar primero cuando "la interfaz abre pero no entra".

## 6. Datos y migraciones

Aquí no hay base de datos ni migraciones: el estado vive en el API. El frontend solo sirve HTML, assets y el proxy de `/api/*`.

La cookie de sesión la emite FastAPI en `api-memberplus.neyzt.org` y el navegador la ve como propia de `memberplus.neyzt.org` **porque todo pasa por el proxy**. No se guarda nada en `localStorage`.

Para desarrollo, el API y su base se levantan desde el repo del backend con el perfil `stack` de su compose (imagen publicada, migraciones y seed incluidos): ver **Backend sin tocarlo** en el [README](../README.md) y `docs/DEPLOY.md`, sección 9, de `Member-Web`.

## 7. Rollback

1. En el compose de *Frontend Balanced*, fijar el `sha-<7>` anterior en la imagen de **los dos** servicios y desplegar.
2. Cuando el fix esté en `main`, volver el tag a `latest` y redesplegar.

No hace falta reconstruir ni volver a mergear: la imagen anterior sigue en GHCR. Mientras el stack esté fijado en un `sha-<7>`, los pushes a `main` siguen publicando imágenes pero el despliegue automático vuelve a levantar la fijada.

Si lo que falla es el balanceador, la app *Frontend* original está detenida como respaldo: arrancarla y quitar `memberplus-lb.yaml` del proxy devuelve el dominio a una sola instancia.

## 8. Probar la imagen en local

```bash
docker run -d --name web -p 3011:3000 \
  -e API_INTERNAL_URL=https://api-memberplus.neyzt.org \
  ghcr.io/aga-studio/member-plus-frontend:main
curl -s -o /dev/null -w '%{http_code}\n' localhost:3011/          # 200
curl -s localhost:3011/healthz.txt                                # ok
curl -s -i localhost:3011/api/v1/health | head -1                 # 404 con JSON de FastAPI
docker inspect --format '{{.Config.User}}' web                    # nextjs
```

El `404` de `/api/v1/health` es **buena señal**: significa que la petición salió por el proxy y la contestó el API. Si devolviera el HTML de Next, la petición no llegó al backend. Sin `-e API_INTERNAL_URL` el proxy cae en `127.0.0.1:8000` y la llamada muere dentro del contenedor.

Para construirla en este servidor hay una trampa conocida: `docker build` necesita `--network=host` porque el resolver de BuildKit no usa el `nameserver fe80::1%2` del host y `npm ci` muere. En GitHub Actions no hace falta.

## 9. Problemas comunes

| Síntoma | Causa |
|---|---|
| `/api/*` responde **401** aunque la sesión exista | Alguien llamó al API directo (`api-memberplus.neyzt.org`) en vez de la ruta relativa: la cookie es de otro host. En producción CORS no se ejerce, así que el síntoma es 401, no un error de CORS |
| El contenedor queda `unhealthy` | `PORT` no coincide con el del healthcheck |
| `/healthz.txt` da 404 | La etapa `runner` no copió `public/` |
| Faltan las fuentes y el build falló sin decirlo | `next/font/google` descarga en el build: sin red, falla. Se construye en CI |
| La app arranca y todo da error de conexión | `API_INTERNAL_URL` vacía o mal: el proxy cae en `127.0.0.1:8000`. Ponla en Coolify y **redespliega** para que el contenedor tome el entorno |
| Cambiaste `API_INTERNAL_URL` en Coolify y no pasa nada | Falta redesplegar: la variable se lee en runtime, pero el contenedor necesita recrearse |

## 10. Enlaces

- [CI.md](CI.md) — los jobs, los checks requeridos y el revisor automático.
- `docs/REVISION.md` — lo que el revisor automático vigila.
- `BRAND.md` — identidad visual, tokens y voz.
- Backend: `AGA-Studio/Member-Web` y su `docs/DEPLOY.md`.
