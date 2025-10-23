import React from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBan, faArrowLeft } from '@fortawesome/free-solid-svg-icons'

export const NotAllowed: React.FC = () => (
  <div className="container" style={{maxWidth:520}}>
    <div className="card">
      <h1 className="title"><FontAwesomeIcon icon={faBan} /> 403 - Acesso negado</h1>
      <p className="muted">Você não tem permissão para realizar essa ação.</p>
      <div className="space"></div>
      <Link className="btn" to="/"><FontAwesomeIcon icon={faArrowLeft} /> Voltar ao dashboard</Link>
    </div>
  </div>
)

