import React from 'react'

export const FormShell: React.FC<React.PropsWithChildren<{ title: string; subtitle?: string }>> = ({ title, subtitle, children }) => {
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    const b = el.getBoundingClientRect()
    const cx = b.left + b.width / 2
    const cy = b.top + b.height / 2
    const dx = (e.clientX - cx) / b.width
    const dy = (e.clientY - cy) / b.height
    el.style.transform = `rotateX(${-(dy * 6)}deg) rotateY(${dx * 6}deg)`
  }
  const onLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    el.style.transform = 'rotateX(0) rotateY(0)'
  }

  return (
    <div className="form-page">
      <div className="form-card" onMouseMove={onMove} onMouseLeave={onLeave}>
        <div className="form-heading">
          <h1 className="title" style={{ marginBottom: subtitle ? 4 : 0 }}>{title}</h1>
          {subtitle && <p className="muted" style={{ margin: 0 }}>{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  )
}

