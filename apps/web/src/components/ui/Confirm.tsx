import React, { createContext, useCallback, useContext, useMemo, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTriangleExclamation, faCircleQuestion, faXmark, faTrash } from '@fortawesome/free-solid-svg-icons'

type Options = {
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  tone?: 'danger' | 'default'
}

type Ctx = { confirm: (opts: Options) => Promise<boolean> }

const ConfirmCtx = createContext<Ctx | null>(null)

export const ConfirmProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [opts, setOpts] = useState<(Options & { id: number; resolve: (v:boolean)=>void }) | null>(null)

  const confirm = useCallback((o: Options) => {
    return new Promise<boolean>((resolve) => {
      setOpts({ id: Date.now(), resolve, ...o })
    })
  }, [])

  const close = (v:boolean) => { opts?.resolve(v); setOpts(null) }

  // ESC to close
  useEffect(() => {
    if (!opts) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [opts])

  const value = useMemo(() => ({ confirm }), [confirm])

  return (
    <ConfirmCtx.Provider value={value}>
      {children}
      {opts && createPortal(
        <div className="modal-overlay" onClick={() => close(false)}>
          <div className={`modal ${opts.tone==='danger' ? 'danger' : ''}`} role="dialog" aria-modal="true" onClick={e=>e.stopPropagation()}>
            <div className="modal-icon">
              <FontAwesomeIcon icon={opts.tone==='danger' ? faTriangleExclamation : faCircleQuestion} />
            </div>
            <div className="modal-body">
              {opts.title && <h3 className="title" style={{margin:'0 0 4px'}}>{opts.title}</h3>}
              {opts.message && <p className="muted" style={{margin:0}}>{opts.message}</p>}
            </div>
            <div className="modal-actions">
              <button className="btn ghost sm equal" onClick={() => close(false)}>
                <FontAwesomeIcon icon={faXmark} /> {opts.cancelText || 'Cancelar'}
              </button>
              <button className={`btn sm equal ${opts.tone==='danger' ? '' : 'gradient'}`} onClick={() => close(true)}>
                {opts.tone==='danger' ? <FontAwesomeIcon icon={faTrash} /> : null} {opts.confirmText || 'Confirmar'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </ConfirmCtx.Provider>
  )
}

export const useConfirm = () => {
  const ctx = useContext(ConfirmCtx)
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider')
  return ctx
}
