import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../../lib/axios'
import { useAuth } from '../../../auth/AuthContext'

type Course = { id:number; name:string; description?:string; start_date:string; end_date:string; creator_id:number; instructors:number[] }

export const Dashboard: React.FC = () => {
  const { user } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [q, setQ] = useState('')
  const [invCount, setInvCount] = useState(0)

  useEffect(() => { (async () => { const { data } = await api.get<Course[]>('/courses'); setCourses(data) })() }, [])
  useEffect(() => { (async () => {
    try {
      const { data } = await api.get('/invitations', { params: { email: user!.email, status: 'pending' } })
      setInvCount(Array.isArray(data) ? data.length : 0)
    } catch { setInvCount(0) }
  })() }, [user])

  const mine = useMemo(() => courses.filter(c => c.creator_id === user!.id || c.instructors.includes(user!.id)), [courses, user])
  const filtered = useMemo(() => mine.filter(c => (c.name + ' ' + (c.description||'')).toLowerCase().includes(q.toLowerCase())), [mine, q])

  return (
    <div>
      <h1 className="title">Meus cursos</h1>
      <p className="subtitle">Cursos que você criou ou nos quais é instrutor.</p>
      <div className="space"></div>
      <div className="toolbar">
        <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Buscar por nome ou descrição"/>
        <div className="row">
          <Link className="btn" to="/courses/new">Criar curso</Link>
          <Link className="btn ghost" to="/invitations">Convites{invCount>0 && <span className="badge" style={{marginLeft:6}}>{invCount}</span>}</Link>
          <span className="muted">{filtered.length} curso(s)</span>
        </div>
      </div>
      <div className="grid">
        {filtered.map(c => (
          <div className="card" key={c.id}>
            <h3 className="title" style={{fontSize:18}}>{c.name}</h3>
            <p className="muted">{c.description || 'Sem descrição'}</p>
            <div className="space"></div>
            <div className="row">
              <span className="badge">Início: {new Date(c.start_date).toLocaleDateString()}</span>
              <span className="badge">Fim: {new Date(c.end_date).toLocaleDateString()}</span>
            </div>
            <div className="space"></div>
            <div className="row">
              <Link className="btn" to={`/courses/${c.id}`}>Ver detalhes</Link>
              {c.creator_id === user!.id && <Link className="btn ghost" to={`/courses/${c.id}/edit`}>Editar</Link>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
