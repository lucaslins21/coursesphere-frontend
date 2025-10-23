import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRightToBracket, faTriangleExclamation, faEnvelope, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
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
            <div className="field">
              <label>Email</label>
              <div className="input-wrap">
                <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="email" />
                <span className="icon-right"><FontAwesomeIcon icon={faEnvelope} /></span>
              </div>
            </div>
            <div className="field">
              <label>Senha</label>
              <div className="input-wrap">
                <input type={showPass? 'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="senha" />
                <button type="button" className="icon-right" onClick={()=>setShowPass(s => !s)} aria-label="Mostrar/ocultar senha">
                  <FontAwesomeIcon icon={showPass? faEyeSlash : faEye} />
                </button>
              </div>
            </div>
            {error && (
              <div className="badge" style={{borderColor:'#b5484a'}}>
                <FontAwesomeIcon icon={faTriangleExclamation} /> {error}
              </div>
            )}
            <div className="login-cta">
              <button className="btn gradient" disabled={loading}>
                <FontAwesomeIcon icon={faRightToBracket} /> {loading? 'Entrando...' : 'Entrar'}
              </button>
            </div>
          </div>
        </form>
        <p className="muted login-foot">Ainda não tem conta? <Link to="/register">Criar conta</Link></p>
      </div>
    </div>
  )
}
