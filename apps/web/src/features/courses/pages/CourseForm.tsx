import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../../../lib/axios'
import { useAuth } from '../../../auth/AuthContext'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useToast } from '../../../components/feedback/Toast'

type Mode = 'create' | 'edit'
type Course = { id:number; name:string; description?:string; start_date:string; end_date:string; creator_id:number; instructors:number[] }

const schema = z.object({
  name: z.string().min(3, 'Nome precisa de pelo menos 3 caracteres'),
  description: z.string().max(500, 'Máximo 500 caracteres').optional().or(z.literal('')),
  start_date: z.string().min(1, 'Data inicial obrigatória'),
  end_date: z.string().min(1, 'Data final obrigatória')
}).refine(d => new Date(d.end_date) > new Date(d.start_date), {
  path: ['end_date'],
  message: 'Data final deve ser maior que a inicial'
})

type FormData = z.infer<typeof schema>

export const CourseForm: React.FC<{ mode: Mode }> = ({ mode }) => {
  const { id } = useParams()
  const { user } = useAuth()
  const nav = useNavigate()
  const { push } = useToast()

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      start_date: new Date().toISOString().slice(0,10),
      end_date: new Date(Date.now()+7*86400000).toISOString().slice(0,10)
    }
  })

  useEffect(() => {
    if (mode === 'edit' && id) {
      (async () => {
        const { data } = await api.get<Course>(`/courses/${id}`)
        // Permissão: somente o criador do curso pode editar
        if (data.creator_id !== user!.id) {
          nav('/403', { replace: true })
          return
        }
        setValue('name', data.name)
        setValue('description', data.description || '')
        setValue('start_date', data.start_date.slice(0,10))
        setValue('end_date', data.end_date.slice(0,10))
      })()
    }
  }, [mode, id, setValue, user, nav])

  const onSubmit = async (f: FormData) => {
    try {
      if (mode === 'create') {
        const { data } = await api.post('/courses', {
          name: f.name, description: f.description, start_date: f.start_date, end_date: f.end_date,
          creator_id: user!.id, instructors: [user!.id]
        })
        push('success', 'Curso criado!')
        nav(`/courses/${data.id}`)
      } else {
        await api.patch(`/courses/${id}`, f)
        push('success', 'Curso atualizado!')
        nav(`/courses/${id}`)
      }
    } catch (e: any) {
      push('error', e?.response?.data?.message || 'Erro ao salvar curso')
    }
  }

  return (
    <div style={{maxWidth:640}}>
      <h1 className="title">{mode === 'create' ? 'Criar curso' : 'Editar curso'}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="card" style={{display:'grid', gap:10}}>
        <div>
          <label>Nome</label>
          <input {...register('name')} />
          {errors.name && <div className="badge" style={{borderColor:'#b5484a'}}>⚠️ {errors.name.message}</div>}
        </div>
        <div>
          <label>Descrição</label>
          <input {...register('description')} />
          {errors.description && <div className="badge" style={{borderColor:'#b5484a'}}>⚠️ {errors.description.message}</div>}
        </div>
        <div className="row">
          <div style={{flex:1}}>
            <label>Data inicial</label>
            <input type="date" {...register('start_date')} />
            {errors.start_date && <div className="badge" style={{borderColor:'#b5484a'}}>⚠️ {errors.start_date.message}</div>}
          </div>
          <div style={{flex:1}}>
            <label>Data final</label>
            <input type="date" {...register('end_date')} />
            {errors.end_date && <div className="badge" style={{borderColor:'#b5484a'}}>⚠️ {errors.end_date.message}</div>}
          </div>
        </div>
        <div className="row">
          <button className="btn" disabled={isSubmitting}><i className="fa-solid fa-floppy-disk"></i> {isSubmitting? 'Salvando...' : 'Salvar'}</button>
          <button type="button" className="btn ghost" onClick={()=>nav(-1)}><i className="fa-solid fa-rotate-left"></i> Cancelar</button>
        </div>
      </form>
    </div>
  )
}
