import { login as apiLogin, register as apiRegister, getMe } from '../api/client'
import type { User } from '../types/User'

interface LoginResponse {
  user: User
  requiresOtp?: boolean
  tempToken?: string
}

interface AuthSuccessResult {
  user: User
  requiresOtp: boolean
  tempToken?: string
}

export function useAuth() {
  const handleAuthSuccess = (result: LoginResponse): AuthSuccessResult => {
    return {
      user: result.user,
      requiresOtp: result.requiresOtp || false,
      tempToken: result.tempToken,
    }
  }

  const login = async (email: string, password: string): Promise<AuthSuccessResult> => {
    const result = await apiLogin(email, password)
    return handleAuthSuccess(result)
  }

  const register = async (email: string, name: string, password: string): Promise<AuthSuccessResult> => {
    const result = await apiRegister(email, name, password)
    return handleAuthSuccess(result)
  }

  const getCurrentUser = async (): Promise<User> => {
    return getMe()
  }

  return {
    login,
    register,
    getCurrentUser,
  }
}

