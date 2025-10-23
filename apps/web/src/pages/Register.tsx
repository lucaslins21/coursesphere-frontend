import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { api } from '../lib/axios'
import { useAuth } from '../auth/AuthContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faEnvelope, faUserPlus } from '@fortawesome/free-solid-svg-icons'
import logoUrl from '../components/media/logo.png?url'
import { TextInput } from '../components/form/TextInput'
import { PasswordInput } from '../components/form/PasswordInput'
import { Button } from '../components/ui/Button'
import { AuthCard } from '../components/auth/AuthCard'
import { AuthForm } from '../components/auth/AuthForm'

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
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      password: ''
    }
  })

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
      <AuthCard logoUrl={logoUrl}>
        <AuthForm onSubmit={handleSubmit(onSubmit)}>
          <TextInput
            label="Nome"
            placeholder="Seu nome"
            {...register('name')}
            error={errors.name?.message}
            right={<FontAwesomeIcon icon={faUser} />}
          />
          <TextInput
            label="E-mail"
            placeholder="voce@exemplo.com"
            {...register('email')}
            error={errors.email?.message}
            right={<FontAwesomeIcon icon={faEnvelope} />}
          />
          <PasswordInput
            label="Senha"
            placeholder="mínimo 6 caracteres"
            {...register('password')}
            error={errors.password?.message}
          />
          <div className="login-cta">
            <Button variant="gradient" disabled={isSubmitting} full>
              <FontAwesomeIcon icon={faUserPlus} /> {isSubmitting ? 'Criando...' : 'Criar conta'}
            </Button>
          </div>
        </AuthForm>
        <p className="muted login-foot">Já tem conta? <Link to="/login">Entrar</Link></p>
      </AuthCard>
    </div>
  )
}

