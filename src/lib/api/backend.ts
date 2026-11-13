const defaultBackendUrl = "http://127.0.0.1:8000";

export function backendUrl(path: string): string {
  const base = process.env.API_INTERNAL_URL ?? defaultBackendUrl;

  return `${base}${path}`;
}
