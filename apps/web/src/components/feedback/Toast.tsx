import React, { createContext, useContext, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck, faTriangleExclamation, faCircleInfo } from '@fortawesome/free-solid-svg-icons'

type Toast = { id: number; kind: 'success'|'error'|'info'; msg: string }
type Ctx = { push: (kind: Toast['kind'], msg: string) => void }

const ToastCtx = createContext<Ctx | null>(null)

export const ToastProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [items, setItems] = useState<Toast[]>([])
  const push = (kind: Toast['kind'], msg: string) => {
    const id = Date.now() + Math.random()
    setItems(curr => [...curr, { id, kind, msg }])
    const DURATION = 3500
    setTimeout(() => setItems(curr => curr.filter(t => t.id !== id)), DURATION)
  }
  const value = useMemo(() => ({ push }), [])
  return (
    <ToastCtx.Provider value={value}>
      {children}
      {createPortal(
        <div className="toast-stack">
          {items.map(t => (
            <div key={t.id} className={`toast ${t.kind}`}>
              <div className="icon">
                <FontAwesomeIcon icon={t.kind==='success' ? faCircleCheck : t.kind==='error' ? faTriangleExclamation : faCircleInfo} />
              </div>
              <div className="content">
                <div className="title">{t.kind === 'success' ? 'Sucesso' : t.kind === 'error' ? 'Erro' : 'Info'}</div>
                <div className="msg">{t.msg}</div>
              </div>
              <div className="toast-progress" style={{ ['--dur' as any]: '3500ms' }} />
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
