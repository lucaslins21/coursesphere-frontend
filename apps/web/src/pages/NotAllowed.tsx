import React from 'react'
import { Link } from 'react-router-dom'

export const NotAllowed: React.FC = () => (
  <div className="container" style={{maxWidth:520}}>
    <div className="card">
      <h1 className="title">403 — Acesso negado</h1>
      <p className="muted">Você não tem permissão para realizar essa ação.</p>
      <div className="space"></div>
      <Link className="btn" to="/">Voltar ao dashboard</Link>
    </div>
  </div>
)
