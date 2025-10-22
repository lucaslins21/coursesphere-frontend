import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export const Login: React.FC = () => {
  const { login } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState('ana@curso.com')
  const [password, setPassword] = useState('123456')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    try { setLoading(true); setError(null); await login(email, password); nav('/', { replace: true }) }
    catch (err:any) { setError(err?.response?.data?.message || 'Falha no login') }
    finally { setLoading(false) }
  }

  return (
    <div className="container" style={{maxWidth: 420}}>
      <div className="card">
        <h1 className="title">Entrar</h1>
        <p className="subtitle">Use uma conta do seed (ana, bruno ou admin).</p>
        <div className="space"></div>
        <form onSubmit={submit}>
          <div style={{display:'grid', gap:10}}>
            <div><label>Email</label><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="email" /></div>
            <div><label>Senha</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="senha" /></div>
            {error && <div className="badge" style={{borderColor:'#b5484a'}}>⚠️ {error}</div>}
            <button className="btn" disabled={loading}>{loading? 'Entrando...' : 'Entrar'}</button>
          </div>
        </form>
        <div className="space"></div>
        <p className="muted">Ainda não tem conta? <Link to="/register">Criar conta</Link></p>
      </div>
    </div>
  )
}
