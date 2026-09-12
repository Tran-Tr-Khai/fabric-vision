const backendOrigin = import.meta.env.VITE_API_ORIGIN ?? 'http://127.0.0.1:8000'
const apiOrigin = `${backendOrigin}/api`

type ApiOptions = Omit<RequestInit, 'body'> & { body?: unknown }

function errorMessage(detail: unknown, status: number): string {
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (item && typeof item === 'object' && 'msg' in item) return String(item.msg)
        return String(item)
      })
      .join('; ')
  }
  return `Backend error (${status})`
}

export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const response = await fetch(`${apiOrigin}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })
  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    throw new Error(errorMessage(payload?.detail, response.status))
  }
  return response.status === 204 ? (undefined as T) : response.json() as Promise<T>
}

export function assetUrl(path: string): string {
  return path.startsWith('http') ? path : `${backendOrigin}${path}`
}
