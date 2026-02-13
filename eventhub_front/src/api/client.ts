import type { Event } from '../types/Event'
import type { User } from '../types/User'

interface JsonApiResponse<T> {
  success: boolean
  data: T
  error?: {
    message: string
    code?: string | number
  }
}

// Fonction pour récupérer le token CSRF
let csrfToken: string | null = null

async function getCsrfToken(): Promise<string> {
  if (csrfToken) return csrfToken

  const res = await fetch('/api/csrf-token', {
    credentials: 'include',
  })

  if (!res.ok) {
    throw new Error('Impossible de récupérer le token CSRF')
  }

  const json = (await res.json()) as JsonApiResponse<{ token: string }>
  if (!json.success || !json.data.token) {
    throw new Error('Token CSRF invalide')
  }

  csrfToken = json.data.token
  return csrfToken
}

// Fonction helper pour les requêtes avec CSRF
async function fetchWithCsrf(url: string, options: RequestInit = {}): Promise<Response> {
  const token = await getCsrfToken()
  const headers = {
    ...options.headers,
    'x-csrf-token': token,
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  })
}

export async function fetchPublicEvents(): Promise<Event[]> {
  const res = await fetch('/api/events/public', {
    credentials: 'include',
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`HTTP ${res.status}: ${text}`)
  }

  const json = (await res.json()) as JsonApiResponse<Event[]>

  if (!json.success) {
    throw new Error(json.error?.message ?? 'Erreur API inconnue')
  }

  return json.data
}

export async function fetchAllEvents(): Promise<Event[]> {
  const res = await fetch('/api/events', {
    credentials: 'include',
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`HTTP ${res.status}: ${text}`)
  }

  const json = (await res.json()) as JsonApiResponse<Event[]>

  if (!json.success) {
    throw new Error(json.error?.message ?? 'Erreur API inconnue')
  }

  return json.data
}

interface LoginResponse {
  token: string
  user: User
  requiresOtp?: boolean
  tempToken?: string
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await fetchWithCsrf('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`HTTP ${res.status}: ${text}`)
  }

  const json = (await res.json()) as JsonApiResponse<LoginResponse>

  if (!json.success) {
    throw new Error(json.error?.message ?? 'Identifiants invalides')
  }

  return json.data
}

export async function verifyOtpLogin(
  email: string,
  password: string,
  code: string
): Promise<LoginResponse> {
  const res = await fetchWithCsrf('/api/auth/verify-otp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, code }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`HTTP ${res.status}: ${text}`)
  }

  const json = (await res.json()) as JsonApiResponse<LoginResponse>

  if (!json.success) {
    throw new Error(json.error?.message ?? 'Code OTP invalide')
  }

  return json.data
}

export async function register(
  email: string,
  name: string,
  password: string
): Promise<LoginResponse> {
  const res = await fetchWithCsrf('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, name, password }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`HTTP ${res.status}: ${text}`)
  }

  const json = (await res.json()) as JsonApiResponse<LoginResponse>

  if (!json.success) {
    throw new Error(json.error?.message ?? "Erreur lors de l'inscription")
  }

  return json.data
}

// OTP Functions

interface QrCodeResponse {
  qrCode: {
    image: string
    username: string
    secret: string
  }
}

export async function getQrCode(): Promise<QrCodeResponse['qrCode']> {
  const res = await fetch('/api/a2f/qrcode', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`HTTP ${res.status}: ${text}`)
  }

  const json = (await res.json()) as JsonApiResponse<QrCodeResponse>

  if (!json.success) {
    throw new Error(json.error?.message ?? 'Erreur lors de la récupération du QR code')
  }

  return json.data.qrCode
}

interface EnableOtpResponse {
  backupCodes: string[]
}

export async function enableOtp(
  secret: string,
  code: string
): Promise<EnableOtpResponse['backupCodes']> {
  const res = await fetchWithCsrf('/api/a2f/enable', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ secret, code }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`HTTP ${res.status}: ${text}`)
  }

  const json = (await res.json()) as JsonApiResponse<EnableOtpResponse>

  if (!json.success) {
    throw new Error(json.error?.message ?? 'Erreur lors de l\'activation de l\'OTP')
  }

  return json.data.backupCodes
}

interface VerifyOtpResponse {
  isValid: boolean
  isBackupCode: boolean
}

export async function verifyOtp(code: string): Promise<VerifyOtpResponse> {
  const res = await fetchWithCsrf('/api/a2f/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`HTTP ${res.status}: ${text}`)
  }

  const json = (await res.json()) as JsonApiResponse<VerifyOtpResponse>

  if (!json.success) {
    throw new Error(json.error?.message ?? 'Erreur lors de la vérification du code')
  }

  return json.data
}

export async function disableOtp(): Promise<void> {
  const res = await fetchWithCsrf('/api/a2f/disable', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`HTTP ${res.status}: ${text}`)
  }

  const json = (await res.json()) as JsonApiResponse<{ message: string }>

  if (!json.success) {
    throw new Error(json.error?.message ?? 'Erreur lors de la désactivation de l\'OTP')
  }
}

interface RegenerateBackupCodesResponse {
  backupCodes: string[]
}

export async function regenerateBackupCodes(): Promise<RegenerateBackupCodesResponse['backupCodes']> {
  const res = await fetchWithCsrf('/api/a2f/regenerate-backup-codes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`HTTP ${res.status}: ${text}`)
  }

  const json = (await res.json()) as JsonApiResponse<RegenerateBackupCodesResponse>

  if (!json.success) {
    throw new Error(json.error?.message ?? 'Erreur lors de la régénération des codes de secours')
  }

  return json.data.backupCodes
}

export async function getMe(): Promise<User> {
  const res = await fetch('/api/auth/me', {
    method: 'GET',
    credentials: 'include',
  })

  if (!res.ok) {
    // Pour les 403 (non authentifié), c'est normal, on lance une erreur silencieuse
    if (res.status === 403) {
      const error = new Error('Not authenticated')
      error.name = 'NotAuthenticatedError'
      throw error
    }
    
    const text = await res.text()
    throw new Error(`HTTP ${res.status}: ${text}`)
  }

  const json = (await res.json()) as JsonApiResponse<User>

  if (!json.success) {
    throw new Error(json.error?.message ?? 'Erreur lors de la récupération de l\'utilisateur')
  }

  return json.data
}

export async function logout(): Promise<void> {
  const res = await fetchWithCsrf('/api/auth/logout', {
    method: 'POST',
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`HTTP ${res.status}: ${text}`)
  }

  const json = (await res.json()) as JsonApiResponse<{ message: string }>

  if (!json.success) {
    throw new Error(json.error?.message ?? 'Erreur lors de la déconnexion')
  }
}

