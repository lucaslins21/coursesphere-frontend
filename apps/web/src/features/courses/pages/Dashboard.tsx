import React, { useEffect, useMemo, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faEnvelope, faEye, faPenToSquare, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
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
      <div className="dash-header">
        <div className="dash-title">
          <h1 className="title">Meus cursos</h1>
          <p className="subtitle">Cursos que você criou ou nos quais é instrutor.</p>
        </div>
        <div className="dash-actions">
          <div className="search">
            <div className="input-wrap">
              <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Buscar cursos" />
              <span className="icon-right"><FontAwesomeIcon icon={faMagnifyingGlass} /></span>
            </div>
          </div>
          <Link className="btn gradient" to="/courses/new"><FontAwesomeIcon icon={faPlus} /> Criar curso</Link>
        </div>
      </div>

      <div className="dash-toolbar">
        <Link className="chip" to="/invitations">
          <FontAwesomeIcon icon={faEnvelope} />
          <span>Convites</span>
          {invCount>0 && <span className="chip-badge">{invCount}</span>}
        </Link>
        <span className="muted">{filtered.length} curso(s)</span>
      </div>

      <div className="course-grid">
        {filtered.map(c => (
          <div className="course-card" key={c.id}>
            <div className="thumb" aria-hidden="true"><span>{(c.name || 'C').slice(0,1).toUpperCase()}</span></div>
            <div className="content">
              <h3 className="title" style={{fontSize:18, margin:'0 0 6px'}}>{c.name}</h3>
              <p className="muted" style={{margin:'0 0 10px'}}>{c.description || 'Sem descrição'}</p>
              <div className="row" style={{marginBottom:10}}>
                <span className="badge">Início: {new Date(c.start_date).toLocaleDateString()}</span>
                <span className="badge">Fim: {new Date(c.end_date).toLocaleDateString()}</span>
              </div>
              <div className="row">
                <Link className="btn gradient" to={`/courses/${c.id}`}><FontAwesomeIcon icon={faEye} /> Ver detalhes</Link>
                {c.creator_id === user!.id && <Link className="btn ghost" to={`/courses/${c.id}/edit`}><FontAwesomeIcon icon={faPenToSquare} /> Editar</Link>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
