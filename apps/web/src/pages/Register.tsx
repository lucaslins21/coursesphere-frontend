import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { api } from '../lib/axios'
import { useAuth } from '../auth/AuthContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faEnvelope, faEye, faEyeSlash, faTriangleExclamation, faUserPlus } from '@fortawesome/free-solid-svg-icons'
import logoUrl from '../components/media/logo.png?url'

const schema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'mínimo 6 caracteres')
})
type FormData = z.infer<typeof schema>

export const Register: React.FC = () => {
  const nav = useNavigate()
  const { login } = useAuth()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema)
  })
  const [showPass, setShowPass] = useState(false)

  const onSubmit = async (f: FormData) => {
    try {
      await api.post('/register', f)
      await login(f.email, f.password)
      nav('/', { replace: true })
    } catch (e:any) {
      alert(e?.response?.data?.message || 'Falha no cadastro')
    }
  }

  return (
    <div className="login-page">
      <div className="login-card" onMouseMove={(e)=>{
        const el = e.currentTarget as HTMLDivElement
        const b = el.getBoundingClientRect()
        const cx = b.left + b.width/2
        const cy = b.top + b.height/2
        const dx = (e.clientX - cx)/b.width
        const dy = (e.clientY - cy)/b.height
        el.style.transform = `rotateX(${-(dy*6)}deg) rotateY(${dx*6}deg)`
      }} onMouseLeave={(e)=>{ (e.currentTarget as HTMLDivElement).style.transform = 'rotateX(0) rotateY(0)' }}>
        <img src={logoUrl} className="login-logo" alt="CourseSphere" />
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="login-actions">
            <div className="field">
              <label>Nome</label>
              <div className="input-wrap">
                <input {...register('name')} placeholder="Seu nome" />
                <span className="icon-right"><FontAwesomeIcon icon={faUser} /></span>
              </div>
              {errors.name && <div className="badge" style={{borderColor:'#b5484a'}}><FontAwesomeIcon icon={faTriangleExclamation}/> {errors.name?.message}</div>}
            </div>
            <div className="field">
              <label>E-mail</label>
              <div className="input-wrap">
                <input {...register('email')} placeholder="voce@exemplo.com" />
                <span className="icon-right"><FontAwesomeIcon icon={faEnvelope} /></span>
              </div>
              {errors.email && <div className="badge" style={{borderColor:'#b5484a'}}><FontAwesomeIcon icon={faTriangleExclamation}/> {errors.email?.message}</div>}
            </div>
            <div className="field">
              <label>Senha</label>
              <div className="input-wrap">
                <input type={showPass? 'text':'password'} {...register('password')} placeholder="mínimo 6 caracteres" />
                <button type="button" className="icon-right" onClick={()=>setShowPass(s=>!s)} aria-label="Mostrar/ocultar senha">
                  <FontAwesomeIcon icon={showPass? faEyeSlash : faEye} />
                </button>
              </div>
              {errors.password && <div className="badge" style={{borderColor:'#b5484a'}}><FontAwesomeIcon icon={faTriangleExclamation}/> {errors.password?.message}</div>}
            </div>
            <div className="login-cta">
              <button className="btn gradient" disabled={isSubmitting}><FontAwesomeIcon icon={faUserPlus}/> {isSubmitting ? 'Criando...' : 'Criar conta'}</button>
            </div>
          </div>
        </form>
        <p className="muted login-foot">Já tem conta? <Link to="/login">Entrar</Link></p>
      </div>
    </div>
  )
}

