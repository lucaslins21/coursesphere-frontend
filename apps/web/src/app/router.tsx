import React from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { Login } from '../pages/Login'
import { Register } from '../pages/Register'
import { Dashboard } from '../features/courses/pages/Dashboard'
import { CourseDetails } from '../features/courses/pages/CourseDetails'
import { LessonForm } from '../features/lessons/pages/LessonForm'
import { CourseForm } from '../features/courses/pages/CourseForm'
import { useAuth } from '../auth/AuthContext'
import { NotAllowed } from '../pages/NotAllowed'

const Guard: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

const AppLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { user, logout } = useAuth()
  return (
    <div>
      <nav>
        <strong>CourseSphere</strong>
        <div>{user ? (<><span style={{marginRight:12}}>Olá, {user.name}</span><button className="btn ghost" onClick={logout}>Sair</button></>) : null}</div>
      </nav>
      <div className="container">{children}</div>
    </div>
  )
}

export const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/', element: <Guard><AppLayout><Dashboard /></AppLayout></Guard> },
  { path: '/403', element: <NotAllowed /> },
  { path: '/courses/new', element: <Guard><AppLayout><CourseForm mode="create" /></AppLayout></Guard> },
  { path: '/courses/:id', element: <Guard><AppLayout><CourseDetails /></AppLayout></Guard> },
  { path: '/courses/:id/edit', element: <Guard><AppLayout><CourseForm mode="edit" /></AppLayout></Guard> },
  { path: '/courses/:courseId/lessons/new', element: <Guard><AppLayout><LessonForm mode="create" /></AppLayout></Guard> },
  { path: '/courses/:courseId/lessons/:lessonId/edit', element: <Guard><AppLayout><LessonForm mode="edit" /></AppLayout></Guard> }
])
