export interface UserProfile {
  _id: string
  username: string
  email: string
  avatar?: string
  createdAt?: string
  updatedAt?: string
}

export interface ApiResponseData<T = unknown> {
  statusCode: number
  data: T
  message: string
  success: boolean
}

export class ApiErrorResponse extends Error {
  statusCode: number
  errors: string[]

  constructor(statusCode: number, message: string, errors: string[] = []) {
    super(message)
    this.name = 'ApiErrorResponse'
    this.statusCode = statusCode
    this.errors = errors
  }
}

export async function apiRequest<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponseData<T>> {
  const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  })

  let json: ApiResponseData<T> & { errors?: string[] }
  try {
    json = await response.json()
  } catch {
    if (!response.ok) {
      throw new ApiErrorResponse(response.status, `Server error (${response.status})`)
    }
    throw new ApiErrorResponse(500, 'Invalid JSON response from server')
  }

  if (!response.ok || !json.success) {
    throw new ApiErrorResponse(
      json.statusCode || response.status,
      json.message || 'An error occurred',
      json.errors || []
    )
  }

  return json
}
