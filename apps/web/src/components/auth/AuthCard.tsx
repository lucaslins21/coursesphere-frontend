import React from 'react'

export const AuthCard: React.FC<React.PropsWithChildren<{ logoUrl?: string }>> = ({ logoUrl, children }) => {
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
    <div className="login-card" onMouseMove={onMove} onMouseLeave={onLeave}>
      {logoUrl && <img src={logoUrl} className="login-logo" alt="logo" />}
      {children}
    </div>
  )
}

