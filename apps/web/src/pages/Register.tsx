import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { api } from '../lib/axios'
import { useAuth } from '../auth/AuthContext'

const schema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres')
})
type FormData = z.infer<typeof schema>

export const Register: React.FC = () => {
  const nav = useNavigate()
  const { login } = useAuth()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema)
  })

  const onSubmit = async (f: FormData) => {
    try {
      await api.post('/register', f)
      // Após cadastro, realiza login para popular contexto/token
      await login(f.email, f.password)
      nav('/', { replace: true })
    } catch (e:any) {
      alert(e?.response?.data?.message || 'Falha no cadastro')
    }
  }

  return (
    <div className="container" style={{maxWidth: 480}}>
      <div className="card">
        <h1 className="title">Criar conta</h1>
        <p className="subtitle">Cadastre-se para acessar o CourseSphere.</p>
        <div className="space" />
        <form onSubmit={handleSubmit(onSubmit)} style={{display:'grid', gap:10}}>
          <div>
            <label>Nome</label>
            <input {...register('name')} placeholder="Seu nome" />
            {errors.name && <div className="badge" style={{borderColor:'#b5484a'}}>⚠️ {errors.name.message}</div>}
          </div>
          <div>
            <label>E-mail</label>
            <input {...register('email')} placeholder="voce@exemplo.com" />
            {errors.email && <div className="badge" style={{borderColor:'#b5484a'}}>⚠️ {errors.email.message}</div>}
          </div>
          <div>
            <label>Senha</label>
            <input type="password" {...register('password')} placeholder="mínimo 6 caracteres" />
            {errors.password && <div className="badge" style={{borderColor:'#b5484a'}}>⚠️ {errors.password.message}</div>}
          </div>
          <button className="btn" disabled={isSubmitting}>{isSubmitting ? 'Criando...' : 'Criar conta'}</button>
        </form>
        <div className="space" />
        <p className="muted">Já tem conta? <Link to="/login">Entrar</Link></p>
      </div>
    </div>
  )
}

