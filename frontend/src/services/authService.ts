import { supabase } from '@/lib/supabase'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'

class SupabaseAuthService {
  async getSession() {
    return await supabase.auth.getSession()
  }

  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }

  async signInWithPassword(email: string, password: string) {
    return await supabase.auth.signInWithPassword({ email, password })
  }

  async signInWithOAuth(provider: 'google', options?: { redirectTo?: string }) {
    return await supabase.auth.signInWithOAuth({
      provider,
      options,
    })
  }

  async signOut() {
    return await supabase.auth.signOut()
  }
}

export const authService = new SupabaseAuthService()
