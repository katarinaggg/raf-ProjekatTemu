const BASE_URL = 'https://temufromtemu-86jb.onrender.com'

export type ErrorCode =
  | 'DUPLICATE_USERNAME'
  | 'BAD_IMAGE_DATA'
  | 'LOGGED_IN'
  | 'INCORRECT_CREDENTIALS'
  | 'INVALID_DATA'
  | 'NO_SUCH_ENTITY'
  | 'NOT_YOURS'
  | 'NOT_AUTHENTICATED'
  | 'OUT_OF_STOCK'
  | 'INTERNAL_ERROR'

export type ApiError = {
  failed: true
  code: ErrorCode
}

export type ApiSuccess<T> = T & {
  failed?: false
}

function makeUrl(path: string): string {
  return `${BASE_URL}${path}`
}

function isApiError(data: unknown): data is ApiError {
  return (
    typeof data === 'object' &&
    data !== null &&
    'failed' in data &&
    (data as { failed?: unknown }).failed === true
  )
}

export type RequestOptions = RequestInit & {
  query?: Record<string, string | number | undefined | null>
}

export async function request<TResponse>(
  path: string,
  options: RequestOptions = {},
  token?: string,
): Promise<TResponse> {
  let url = makeUrl(path)

  // build query string (page, pageSize, filters...)
  if (options.query) {
    const params = new URLSearchParams()

    for (const key in options.query) {
      const value = options.query[key]
      if (value !== undefined && value !== null) {
        params.append(key, String(value))
      }
    }

    if (params.size > 0) url += `?${params.toString()}`
  }

  // merge headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  }

  // auth support
  if (token) headers.Authorization = `Bearer ${token}`

  //console.log(' Final request URL:', url.toString())
  //console.log(' Method:', options.method)
  //console.log(' Auth header:', token ? 'Present' : 'None')

  // execute request
  const response = await fetch(url, {
    ...options,
    headers,
  })

  let data: unknown

  try {
    data = await response.json()
  } catch {
    throw new Error('Server returned invalid JSON response.')
  }

  // detect API logical error
  if (isApiError(data)) {
    throw { failed: true, code: data.code || 'INTERNAL_ERROR' } as ApiError
  }

  return data as TResponse
}

export function apiGet<TResponse>(
  path: string,
  opts?: {
    query?: Record<string, string | number | undefined | null>
    token?: string
  },
) {
  //console.log(' apiGet called:', { path, opts })
  return request<TResponse>(path, { method: 'GET', query: opts?.query }, opts?.token)
}

export function apiPost<TBody, TResponse>(path: string, body: TBody, token?: string) {
  return request<TResponse>(path, { method: 'POST', body: JSON.stringify(body) }, token)
}

export function apiPatch<TBody, TResponse>(path: string, body: TBody, token?: string) {
  return request<TResponse>(path, { method: 'PATCH', body: JSON.stringify(body) }, token)
}

export function apiDelete<TResponse>(path: string, token?: string) {
  return request<TResponse>(path, { method: 'DELETE' }, token)
}
