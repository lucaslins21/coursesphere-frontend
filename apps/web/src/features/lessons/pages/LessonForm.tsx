import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../../../lib/axios'
import { useAuth } from '../../../auth/AuthContext'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useToast } from '../../../components/feedback/Toast'
import { TextInput } from '../../../components/form/TextInput'
import { FormError } from '../../../components/form/FormError'
import { Button } from '../../../components/ui/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFloppyDisk, faRotateLeft, faCalendar, faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { FormShell } from '../../../components/layout/FormShell'

type Course = { id:number; instructors:number[]; creator_id:number }
type Lesson = { id:number; title:string; status:'draft'|'published'|'archived'; publish_date:string; video_url:string; course_id:number; creator_id:number }

const schema = z.object({
  title: z.string().min(3, 'Mínimo 3 caracteres'),
  status: z.enum(['draft','published','archived']),
  publish_date: z.string().refine(d => new Date(d) > new Date(), 'A data de publicação deve ser futura'),
  video_url: z.string().url('URL inválida')
})
type FormData = z.infer<typeof schema>

export const LessonForm: React.FC<{ mode: 'create' | 'edit' }> = ({ mode }) => {
  const { courseId, lessonId } = useParams()
  const { user } = useAuth()
  const nav = useNavigate()
  const { push } = useToast()
  const [guarding, setGuarding] = useState(true)

  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: 'Nova aula',
      status: 'draft',
      publish_date: new Date(Date.now()+86400000).toISOString().slice(0,10),
      video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    }
  })

  useEffect(() => {
    (async () => {
      try {
        if (mode === 'create') {
          const { data } = await api.get<Course>(`/courses/${courseId}`)
          if (!data.instructors.includes(user!.id)) { nav('/403', { replace: true }); return }
        } else {
          const [courseRes, lessonRes] = await Promise.all([
            api.get<Course>(`/courses/${courseId}`),
            api.get<Lesson>(`/lessons/${lessonId}`)
          ])
          const course = courseRes.data
          const lesson = lessonRes.data
          if (!(user && (lesson.creator_id === user.id || course.creator_id === user.id))) {
            nav('/403', { replace: true }); return
          }
          setValue('title', lesson.title)
          setValue('status', lesson.status)
          setValue('publish_date', lesson.publish_date.slice(0,10))
          setValue('video_url', lesson.video_url)
        }
      } finally {
        setGuarding(false)
      }
    })()
  }, [mode, courseId, lessonId, user, nav, setValue])

  const onSubmit = async (f: FormData) => {
    try {
      if (mode === 'create') {
        await api.post('/lessons', { ...f, course_id: Number(courseId), creator_id: user!.id })
        push('success', 'Aula criada!')
      } else {
        await api.patch(`/lessons/${lessonId}`, { ...f })
        push('success', 'Aula atualizada!')
      }
      nav(`/courses/${courseId}`)
    } catch (e:any) {
      push('error', e?.response?.data?.message || 'Erro ao salvar aula')
    }
  }

  if (guarding) return <p className="muted">Carregando...</p>

  return (
    <FormShell
      title={mode === 'create' ? 'Criar aula' : 'Editar aula'}
      subtitle={mode === 'create' ? 'Defina as informações da nova aula.' : 'Atualize os dados da aula.'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="form-grid">
        <TextInput
          label="Título"
          placeholder="Título da aula"
          {...register('title')}
          error={errors.title?.message}
        />
        <div className="field">
          <label>Status</label>
          <div className="input-wrap">
            <select {...register('status')}>
              <option value="draft">Rascunho</option>
              <option value="published">Publicada</option>
              <option value="archived">Arquivada</option>
            </select>
            <span className="icon-right" aria-hidden="true"><FontAwesomeIcon icon={faChevronDown} /></span>
          </div>
          <FormError message={errors.status?.message} />
        </div>
        <TextInput
          label="Data de publicação"
          type="date"
          {...register('publish_date')}
          error={errors.publish_date?.message}
          right={<FontAwesomeIcon icon={faCalendar} />}
        />
        <TextInput
          label="URL do vídeo"
          placeholder="https://"
          {...register('video_url')}
          error={errors.video_url?.message}
        />
        <div className="form-actions">
          <Button variant="gradient" disabled={isSubmitting}>
            <FontAwesomeIcon icon={faFloppyDisk} /> {isSubmitting ? 'Salvando...' : 'Salvar'}
          </Button>
          <Button type="button" variant="ghost" onClick={() => nav(-1)}>
            <FontAwesomeIcon icon={faRotateLeft} /> Cancelar
          </Button>
        </div>
      </form>
    </FormShell>
  )
}
