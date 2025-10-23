import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRightToBracket, faEnvelope } from '@fortawesome/free-solid-svg-icons'
import { TextInput } from '../components/form/TextInput'
import { PasswordInput } from '../components/form/PasswordInput'
import { Button } from '../components/ui/Button'
import { FormError } from '../components/form/FormError'
import { AuthCard } from '../components/auth/AuthCard'
import { AuthForm } from '../components/auth/AuthForm'
import logoUrl from '../components/media/logo.png?url'
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
    try {
      setLoading(true)
      setError(null)
      await login(email, password)
      nav('/', { replace: true })
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Falha no login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <AuthCard logoUrl={logoUrl}>
        <AuthForm onSubmit={submit}>
          <TextInput
            label="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="email"
            right={<FontAwesomeIcon icon={faEnvelope} />}
          />
          <PasswordInput
            label="Senha"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="senha"
          />
          <FormError message={error} />
          <div className="login-cta">
            <Button variant="gradient" disabled={loading} full>
              <FontAwesomeIcon icon={faRightToBracket} /> {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </div>
        </AuthForm>
        <p className="muted login-foot">Ainda não tem conta? <Link to="/register">Criar conta</Link></p>
      </AuthCard>
    </div>
  )
}