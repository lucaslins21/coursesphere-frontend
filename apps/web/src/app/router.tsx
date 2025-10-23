import React, { useEffect, useState } from 'react'
import { createBrowserRouter, Navigate, Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHouse, faEnvelope, faRightFromBracket } from '@fortawesome/free-solid-svg-icons'

import { Login } from '../pages/Login'
import { Register } from '../pages/Register'
import { Dashboard } from '../features/courses/pages/Dashboard'
import { CourseDetails } from '../features/courses/pages/CourseDetails'
import { LessonForm } from '../features/lessons/pages/LessonForm'
import { CourseForm } from '../features/courses/pages/CourseForm'
import { useAuth } from '../auth/AuthContext'
import { NotAllowed } from '../pages/NotAllowed'
import { Invitations } from '../pages/Invitations'
import { api } from '../lib/axios'

const Guard: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

const AppLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { user, logout } = useAuth()
  const [invCount, setInvCount] = useState(0)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        if (!user) { setInvCount(0); return }
        const { data } = await api.get('/invitations', { params: { email: user.email, status: 'pending' } })
        if (mounted) setInvCount(Array.isArray(data) ? data.length : 0)
      } catch { if (mounted) setInvCount(0) }
    })()
    return () => { mounted = false }
  }, [user])

  return (
    <div>
      <nav>
        <strong>CourseSphere</strong>
        <div>
          {user ? (
            <>
              <Link to="/" className="btn ghost" style={{ marginRight: 8 }}>
                <FontAwesomeIcon icon={faHouse} /> Dashboard
              </Link>
              <Link to="/invitations" className="btn ghost" style={{ marginRight: 8 }}>
                <FontAwesomeIcon icon={faEnvelope} /> Convites{invCount > 0 && (
                  <span className="badge" style={{ marginLeft: 6 }}>{invCount}</span>
                )}
              </Link>
              <span style={{ marginRight: 12 }}>Olá, {user.name}</span>
              <button className="btn ghost" onClick={logout}>
                <FontAwesomeIcon icon={faRightFromBracket} /> Sair
              </button>
            </>
          ) : null}
        </div>
      </nav>
      <div className="container">{children}</div>
    </div>
  )
}

export const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/invitations', element: <Guard><AppLayout><Invitations /></AppLayout></Guard> },
  { path: '/', element: <Guard><AppLayout><Dashboard /></AppLayout></Guard> },
  { path: '/403', element: <NotAllowed /> },
  { path: '/courses/new', element: <Guard><AppLayout><CourseForm mode="create" /></AppLayout></Guard> },
  { path: '/courses/:id', element: <Guard><AppLayout><CourseDetails /></AppLayout></Guard> },
  { path: '/courses/:id/edit', element: <Guard><AppLayout><CourseForm mode="edit" /></AppLayout></Guard> },
  { path: '/courses/:courseId/lessons/new', element: <Guard><AppLayout><LessonForm mode="create" /></AppLayout></Guard> },
  { path: '/courses/:courseId/lessons/:lessonId/edit', element: <Guard><AppLayout><LessonForm mode="edit" /></AppLayout></Guard> }
])

