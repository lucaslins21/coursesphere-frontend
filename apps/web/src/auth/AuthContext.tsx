import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../lib/axios'

export type User = { id: number; name: string; email: string; role: 'instructor'|'admin' }
type AuthCtx = { user: User | null; login: (email:string,password:string)=>Promise<void>; logout: ()=>void }
const Ctx = createContext<AuthCtx | null>(null)

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  useEffect(() => { const saved = localStorage.getItem('user'); if (saved) setUser(JSON.parse(saved)) }, [])
  const login = async (email:string, password:string) => {
    const { data } = await api.post('/login', { email, password })
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    setUser(data.user)
  }
  const logout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); setUser(null) }
  const value = useMemo(() => ({ user, login, logout }), [user])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
export const useAuth = () => { const ctx = useContext(Ctx); if (!ctx) throw new Error('useAuth must be used within AuthProvider'); return ctx }
