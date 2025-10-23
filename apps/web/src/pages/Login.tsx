import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRightToBracket, faTriangleExclamation, faEnvelope } from '@fortawesome/free-solid-svg-icons'
import { TextInput } from '../components/form/TextInput'
import { PasswordInput } from '../components/form/PasswordInput'
import { Button } from '../components/ui/Button'
import logoUrl from '../components/media/logo.png?url'
import { useAuth } from '../auth/AuthContext'

export const Login: React.FC = () => {
  const { login } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState('ana@curso.com')
  const [password, setPassword] = useState('123456')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    try { setLoading(true); setError(null); await login(email, password); nav('/', { replace: true }) }
    catch (err:any) { setError(err?.response?.data?.message || 'Falha no login') }
    finally { setLoading(false) }
  }

  return (
    <div className="login-page">
      <div
        className="login-card"
        onMouseMove={(e)=>{
          const el = e.currentTarget as HTMLDivElement
          const b = el.getBoundingClientRect()
          const cx = b.left + b.width/2
          const cy = b.top + b.height/2
          const dx = (e.clientX - cx)/b.width
          const dy = (e.clientY - cy)/b.height
          el.style.transform = `rotateX(${-(dy*6)}deg) rotateY(${dx*6}deg)`
        }}
        onMouseLeave={(e)=>{ (e.currentTarget as HTMLDivElement).style.transform = 'rotateX(0) rotateY(0)' }}
      >
        <img src={logoUrl} className="login-logo" alt="CourseSphere" />
        <form onSubmit={submit}>
          <div className="login-actions">
            <TextInput label="Email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="email" right={<FontAwesomeIcon icon={faEnvelope} />} />
            <PasswordInput label="Senha" value={password} onChange={e=>setPassword(e.target.value)} placeholder="senha" />
            {error && (
              <div className="badge" style={{borderColor:'#b5484a'}}>
                <FontAwesomeIcon icon={faTriangleExclamation} /> {error}
              </div>
            )}
            <div className="login-cta">
              <Button variant="gradient" disabled={loading} full>
                <FontAwesomeIcon icon={faRightToBracket} /> {loading? 'Entrando...' : 'Entrar'}
              </Button>
            </div>
          </div>
        </form>
        <p className="muted login-foot">Ainda não tem conta? <Link to="/register">Criar conta</Link></p>
      </div>
    </div>
  )
}
