import React from 'react'

export const AuthForm: React.FC<React.PropsWithChildren<{ onSubmit: (e: React.FormEvent) => void }>> = ({ onSubmit, children }) => (
  <form onSubmit={onSubmit}>
    <div className="login-actions">{children}</div>
  </form>
)

