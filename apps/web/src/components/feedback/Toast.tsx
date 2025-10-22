import React, { createContext, useContext, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'

type Toast = { id: number; kind: 'success'|'error'|'info'; msg: string }
type Ctx = { push: (kind: Toast['kind'], msg: string) => void }

const ToastCtx = createContext<Ctx | null>(null)

export const ToastProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [items, setItems] = useState<Toast[]>([])
  const push = (kind: Toast['kind'], msg: string) => {
    const id = Date.now() + Math.random()
    setItems(curr => [...curr, { id, kind, msg }])
    setTimeout(() => setItems(curr => curr.filter(t => t.id !== id)), 3000)
  }
  const value = useMemo(() => ({ push }), [])
  return (
    <ToastCtx.Provider value={value}>
      {children}
      {createPortal(
        <div style={{position:'fixed', right:16, bottom:16, display:'grid', gap:8, zIndex:50}}>
          {items.map(t => (
            <div key={t.id} className="card" style={{
              borderLeft:'4px solid',
              borderLeftColor: t.kind==='success' ? '#28a745' : t.kind==='error' ? '#dc3545' : '#5e74ff',
              minWidth:260
            }}>
              <strong style={{textTransform:'capitalize'}}>{t.kind}</strong>
              <div className="muted">{t.msg}</div>
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastCtx.Provider>
  )
}

export const useToast = () => {
  const ctx = useContext(ToastCtx)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
