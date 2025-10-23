import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/axios'
import { useAuth } from '../auth/AuthContext'
import { useToast } from '../components/feedback/Toast'

type Invitation = { id:number; course_id:number; email:string; status:'pending'|'accepted'|'declined' }
type Course = { id:number; name:string }

export const Invitations: React.FC = () => {
  const { user } = useAuth()
  const { push } = useToast()
  const [items, setItems] = useState<Invitation[]>([])
  const [courses, setCourses] = useState<Record<number, Course>>({})
  const load = async () => {
    const { data } = await api.get<Invitation[]>(`/invitations`, { params: { email: user!.email, status: 'pending' }})
    setItems(data)
    if (data.length) {
      const ids = Array.from(new Set(data.map(i=>i.course_id)))
      const fetched = await Promise.all(ids.map(id => api.get<Course>(`/courses/${id}`)))
      const map: Record<number, Course> = {}
      fetched.forEach(r => { map[r.data.id] = r.data })
      setCourses(map)
    } else {
      setCourses({})
    }
  }
  useEffect(() => { load() }, [])

  const accept = async (id:number) => {
    try { await api.post(`/invitations/${id}/accept`, { email: user!.email }); push('success','Convite aceito'); await load() }
    catch { push('error','Falha ao aceitar convite') }
  }
  const decline = async (id:number) => {
    try { await api.post(`/invitations/${id}/decline`, {}); push('info','Convite recusado'); await load() }
    catch { push('error','Falha ao recusar convite') }
  }

  return (
    <div>
      <div className="row" style={{alignItems:'center', justifyContent:'space-between'}}>
        <h1 className="title" style={{margin:0}}>Convites</h1>
        <Link to="/" className="btn ghost">Voltar ao dashboard</Link>
      </div>
      {!items.length && <p className="muted">Nenhum convite pendente.</p>}
      <div className="grid">
        {items.map(inv => (
          <div className="card" key={inv.id}>
            <strong>{courses[inv.course_id]?.name || `Curso ${inv.course_id}`}</strong>
            <p className="muted">Você foi convidado para ser instrutor.</p>
            <div className="row">
              <button className="btn" onClick={()=>accept(inv.id)}>Aceitar</button>
              <button className="btn ghost" onClick={()=>decline(inv.id)}>Recusar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
