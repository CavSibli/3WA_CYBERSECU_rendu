import { useContext } from 'react'
import { AuthContext } from './AuthContextStore'
import type { AuthContextValue } from './AuthContextStore'

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}