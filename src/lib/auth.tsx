/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from './supabase'
import type { Session, User } from '@supabase/supabase-js'

export interface Profile {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'cfo' | 'operations' | 'production_manager' | 'account_manager' | 'accounting'
  notification_prefs: { email: boolean; in_app: boolean }
  phone: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

interface AuthContextValue {
  session: Session | null
  user: User | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  /** Display name: profile full_name, or email, or 'Unknown User' */
  displayName: string
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchProfile(userId: string) {
    if (!supabase) return
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (!error && data) {
      setProfile(data as Profile)
    }
    setLoading(false)
  }

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      if (s?.user) fetchProfile(s.user.id)
      else setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      if (s?.user) {
        fetchProfile(s.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect */

  async function signIn(email: string, password: string) {
    if (!supabase) return { error: 'Supabase is not configured' }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    return { error: null }
  }

  async function signOut() {
    if (!supabase) return
    await supabase.auth.signOut()
    setSession(null)
    setProfile(null)
  }

  const user = session?.user ?? null
  const displayName = profile?.full_name || user?.email || 'Unknown User'

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, signIn, signOut, displayName }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function useUser() {
  const { user, profile, displayName } = useAuth()
  return { user, profile, displayName }
}
