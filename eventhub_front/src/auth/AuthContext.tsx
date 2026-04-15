import React, { useEffect, useState } from 'react'
import { login as apiLogin, register as apiRegister, getMe, logout as apiLogout } from '../api/client'
import { AuthError } from '../shared/errors/AuthError'
import { AuthContext } from './AuthContextStore'
import type { User } from '../types/User'

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    // Vérifier si l'utilisateur est authentifié via le cookie
    const checkAuth = async () => {
      try {
        const userData = await getMe()
        setUser(userData)
        setToken('authenticated') // Token symbolique, le vrai est dans le cookie
      } catch {
        // Non authentifié - c'est normal si l'utilisateur n'est pas connecté
        // Le 403 dans la console est normal, le navigateur affiche automatiquement les erreurs HTTP
        setUser(null)
        setToken(null)
      }
    }
    void checkAuth()
  }, [])

  const handleLogin = async (email: string, password: string) => {
    const result = await apiLogin(email, password)

    // Si OTP est requis, on ne met pas à jour l'état d'authentification
    // Le composant LoginForm gérera l'affichage du formulaire OTP
    if (result.requiresOtp) {
      // Retourner un objet avec requiresOtp pour que le composant puisse gérer
      throw new AuthError('OTP_REQUIRED', 'OTP requis pour cette connexion')
    }

    // Le token est dans le cookie, récupérer l'utilisateur
    const userData = await getMe()
    setUser(userData)
    setToken('authenticated') // Token symbolique
  }

  const handleRegister = async (email: string, name: string, password: string) => {
    await apiRegister(email, name, password)

    // Le token est dans le cookie, récupérer l'utilisateur
    const userData = await getMe()
    setUser(userData)
    setToken('authenticated') // Token symbolique
  }

  const handleLogout = async () => {
    try {
      await apiLogout()
    } catch {
      // Ignorer les erreurs de déconnexion, on nettoie quand même l'état local
    } finally {
      setToken(null)
      setUser(null)
    }
  }

  const refreshUser = async () => {
    try {
      const userData = await getMe()
      setUser(userData)
      setToken('authenticated')
    } catch {
      setUser(null)
      setToken(null)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user),
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}




