"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { authApi, tokenManager, isAuthenticated } from '@/lib/api'
import type { LoginRequest, SignupRequest } from '@/lib/api'

interface AuthUser {
  // Add user properties as needed when backend provides user info
  isAuthenticated: boolean
}

interface AuthContextType {
  user: AuthUser | null
  login: (credentials: LoginRequest) => Promise<void>
  signup: (userData: SignupRequest) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Initialize auth state
  useEffect(() => {
    const checkAuth = () => {
      if (isAuthenticated()) {
        setUser({ isAuthenticated: true })
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  const login = useCallback(async (credentials: LoginRequest) => {
    // eslint-disable-next-line no-useless-catch
    try {
      const response = await authApi.login(credentials)
      tokenManager.set(response.token)
      setUser({ isAuthenticated: true })
    } catch (error) {
      throw error
    }
  }, [])

  const signup = useCallback(async (userData: SignupRequest) => {
    // eslint-disable-next-line no-useless-catch
    try {
      await authApi.signup(userData)
      // Auto-login after successful signup
      await login({ email: userData.email, password: userData.password })
    } catch (error) {
      throw error
    }
  }, [login])

  const logout = useCallback(() => {
    authApi.logout()
    setUser(null)
    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  }, [])

  const value = {
    user,
    login,
    signup,
    logout,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Higher-order component for protected routes
export function withAuth<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return function AuthenticatedComponent(props: P) {
    const { user, loading } = useAuth()

    useEffect(() => {
      if (!loading && !user) {
        window.location.href = '/login'
      }
    }, [user, loading])

    if (loading) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      )
    }

    if (!user) {
      return null // Will redirect via useEffect
    }

    return <Component {...props} />
  }
}
