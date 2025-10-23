import React, { useEffect, useMemo, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faPenToSquare, faPlus, faUserMinus, faPaperPlane, faWandMagicSparkles, faTrash, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../../../lib/axios'
import { useAuth } from '../../../auth/AuthContext'
import { Pagination } from '../../../components/ui/Pagination'
import { VideoThumb } from '../../../components/media/VideoThumb'
import { useToast } from '../../../components/feedback/Toast'

type Course = { id:number; name:string; description?:string; start_date:string; end_date:string; creator_id:number; instructors:number[] }
type Lesson = { id:number; title:string; status:'draft'|'published'|'archived'; publish_date:string; video_url:string; course_id:number; creator_id:number }
type User = { id:number; name:string; email:string; role:'admin'|'instructor' }

export const CourseDetails: React.FC = () => {
  const { id } = useParams()
  const nav = useNavigate()
  const [course, setCourse] = useState<Course | null>(null)
  const [users, setUsers] = useState<User[]>([])

  const [q, setQ] = useState('')
  const [status, setStatus] = useState<string>('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(9)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  const { user } = useAuth()
  const { push } = useToast()
  const [inviteEmail, setInviteEmail] = useState('')
  const [sendingInvite, setSendingInvite] = useState(false)

  useEffect(() => {
    (async () => {
      const [c, u] = await Promise.all([
        api.get<Course>(`/courses/${id}`),
        api.get<User[]>(`/users`)
      ])
      setCourse(c.data); setUsers(u.data)
    })()
  }, [id])

  useEffect(() => {
    const calcPerPage = () => {
      const w = window.innerWidth
      // Ajusta para caber 3x3 em telas largas
      if (w >= 1400) return 9
      if (w >= 1000) return 6
      return 4
    }
    setPerPage(calcPerPage())
    const onResize = () => setPerPage(calcPerPage())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        const params: any = { course_id: id, _page: page, _limit: perPage, _sort: 'publish_date', _order: 'desc' }
        if (q) params.title_like = q
        if (status) params.status = status
        const { data, headers } = await api.get<Lesson[]>(`/lessons`, { params })
        setLessons(data)
        setTotal(Number(headers['x-total-count'] || data.length))
      } finally { setLoading(false) }
    })()
  }, [id, q, status, page, perPage])

  const canManage = useMemo(() => course && course.creator_id === user!.id, [course, user])
  const isInstructor = useMemo(() => course && course.instructors.includes(user!.id), [course, user])
  const nameOf = (uid:number) => users.find(u=>u.id===uid)?.name || `User ${uid}`
  const isCreator = (uid:number) => course?.creator_id === uid

  const removeInstructor = async (uid:number) => {
    if (!course) return
    if (!confirm('Remover este instrutor do curso?')) return
    try {
      const next = course.instructors.filter(i => i !== uid)
      const { data } = await api.patch<Course>(`/courses/${course.id}`, { instructors: next })
      setCourse(data)
      push('success', 'Instrutor removido')
    } catch {
      push('error', 'Falha ao remover instrutor')
    }
  }

  const addSuggestedInstructor = async () => {
    try {
      // Busca um usuário aleatório
      const r = await fetch('https://randomuser.me/api/')
      const j = await r.json()
      const p = j.results[0]
      const name = `${p.name.first} ${p.name.last}`
      const email = p.email

      // Verifica se já existe usuário com este e-mail (unicidade)
      const existingRes = await api.get<User[]>('/users', { params: { email } })
      const existing = existingRes.data[0]

      // Reutiliza usuário existente ou cria um novo
      const userToUse = existing
        ? existing
        : (await api.post<User>('/users', { name, email, password: '123456', role: 'instructor' })).data

      // Adiciona aos instrutores do curso (sem duplicar)
      const nextInstr = Array.from(new Set([...(course!.instructors || []), userToUse.id]))
      const { data } = await api.patch<Course>(`/courses/${course!.id}`, { instructors: nextInstr })

      // Mantém lista local de usuários consistente
      setUsers(prev => (prev.some(u => u.id === userToUse.id) ? prev : [...prev, userToUse]))
      setCourse(data)
      push('success', existing ? 'Instrutor já existente vinculado ao curso' : 'Instrutor sugerido adicionado')
    } catch (e:any) {
      // Trata erro genérico
      push('error', 'Falha ao adicionar instrutor sugerido')
    }
  }

  const deleteCourse = async () => {
    if (!course) return
    if (!confirm('Tem certeza que deseja excluir este curso?')) return
    try {
      await api.delete(`/courses/${course.id}`)
      push('success', 'Curso excluído')
      nav('/')
    } catch {
      push('error', 'Falha ao excluir curso')
    }
  }

  const sendInvite = async () => {
    if (!course) return
    const email = inviteEmail.trim()
    if (!email) { push('error','Informe um e-mail'); return }
    setSendingInvite(true)
    try {
      const check = await api.get<User[]>('/users', { params: { email } })
      const exists = check.data[0]
      if (!exists) { push('error','E-mail não registrado'); return }
      await api.post('/invitations', { course_id: course.id, email, inviter_id: user!.id })
      setInviteEmail('')
      push('success','Convite enviado')
    } catch (e:any) {
      push('error', e?.response?.data?.message || 'Falha ao enviar convite')
    } finally { setSendingInvite(false) }
  }

  if (!course) return <div className="muted">Carregando...</div>

  return (
    <div>
      <div className="dash-header">
        <div className="dash-title">
          <div className="row" style={{alignItems:'center', gap:8}}>
            <h1 className="title" style={{margin:0}}>{course.name}</h1>
            {canManage && <Link className="btn ghost" to={`/courses/${course.id}/edit`}><FontAwesomeIcon icon={faPenToSquare} /> Editar curso</Link>}
          </div>
          <p className="subtitle">Criador: <strong>{nameOf(course.creator_id)}</strong></p>
        </div>
        <div className="dash-actions">
          {isInstructor && <Link className="btn gradient" to={`/courses/${course.id}/lessons/new`}><FontAwesomeIcon icon={faPlus} /> Nova aula</Link>}
          <Link className="btn ghost" to="/"><FontAwesomeIcon icon={faArrowLeft} /> Voltar</Link>
        </div>
      </div>

      {course.description && <p className="muted" style={{marginTop: 0}}>{course.description}</p>}
      <div className="row" style={{marginTop:8}}>
        <span className="badge">Início: {new Date(course.start_date).toLocaleDateString()}</span>
        <span className="badge">Fim: {new Date(course.end_date).toLocaleDateString()}</span>
      </div>

      <div className="dash-toolbar">
        <div style={{display:'flex', alignItems:'center', gap:12}}>
          <select value={status} onChange={e=>{ setPage(1); setStatus(e.target.value) }}>
            <option value="">Todas</option>
            <option value="draft">Rascunho</option>
            <option value="published">Publicada</option>
            <option value="archived">Arquivada</option>
          </select>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:12}}>
          <span className="muted">{total} aula(s)</span>
          <div className="search" style={{width:320}}>
            <div className="input-wrap">
              <input placeholder="Buscar aulas" value={q} onChange={e=>{ setPage(1); setQ(e.target.value) }} />
              <span className="icon-right"><FontAwesomeIcon icon={faMagnifyingGlass} /></span>
            </div>
          </div>
        </div>
      </div>

      {loading && <p className="muted">Carregando aulas...</p>}

      <div className="course-grid">
        {lessons.map(l => (
          <div className="course-card" key={l.id}>
            <div className="thumb"><VideoThumb url={l.video_url} height={140} /></div>
            <div className="content">
              <div className="row" style={{justifyContent:'space-between', marginBottom: 6}}>
                <strong>{l.title}</strong>
                <span className="badge">{l.status}</span>
              </div>
              <p className="muted" style={{margin:'0 0 8px'}}>Publicação: {new Date(l.publish_date).toLocaleDateString()}</p>
              <a className="muted" href={l.video_url} target="_blank">Ver vídeo ↗</a>
              <p className="muted" style={{margin:'8px 0'}}>Autor: {nameOf(l.creator_id)}</p>
              {(user!.id === l.creator_id || user!.id === course.creator_id) && (
                <div className="row">
                  <Link className="btn gradient sm" to={`/courses/${course.id}/lessons/${l.id}/edit`}><FontAwesomeIcon icon={faPenToSquare} /> Editar</Link>
                  <button
                    className="btn ghost sm"
                    onClick={async () => {
                      if (!confirm('Confirma excluir a aula?')) return
                      try {
                        await api.delete(`/lessons/${l.id}`)
                        setLessons(prev => prev.filter(x => x.id !== l.id))
                        push('success', 'Aula excluída')
                      } catch {
                        push('error', 'Falha ao excluir aula')
                      }
                    }}
                  >
                    <FontAwesomeIcon icon={faTrash} /> Excluir
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {!loading && !lessons.length && <p className="muted">Nenhuma aula encontrada com os filtros atuais.</p>}

      <Pagination page={page} total={total} perPage={perPage} onPage={setPage} />

      {canManage && (
        <div className="card" style={{marginTop:16}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <strong>Gerenciamento do curso</strong>
            <button className="btn ghost sm" onClick={deleteCourse}><FontAwesomeIcon icon={faTrash} /> Excluir curso</button>
          </div>
          <div className="space" />
          <div className="user-chips">
            {course.instructors.map(uid => (
              <span key={uid} className="chip user">
                {nameOf(uid)}
                {!isCreator(uid) && (
                  <button type="button" className="chip-remove" title="Remover instrutor" onClick={()=>removeInstructor(uid)}><FontAwesomeIcon icon={faUserMinus} /></button>
                )}
              </span>
            ))}
          </div>
          <div className="space" />
          <div className="dash-actions" style={{justifyContent:'flex-start'}}>
            <div className="search" style={{width:320}}>
              <input placeholder="Convidar por e-mail" value={inviteEmail} onChange={e=>setInviteEmail(e.target.value)} />
            </div>
            <button className="btn gradient sm" onClick={sendInvite} disabled={sendingInvite}><FontAwesomeIcon icon={faPaperPlane} /> {sendingInvite? 'Enviando...' : 'Convidar'}</button>
            <button className="btn ghost sm" onClick={addSuggestedInstructor}><FontAwesomeIcon icon={faWandMagicSparkles} /> Sugerir instrutor</button>
          </div>
        </div>
      )}
    </div>
  )
}
