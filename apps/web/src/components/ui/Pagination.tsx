import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'

export const Pagination: React.FC<{ page:number; total:number; perPage?:number; onPage:(p:number)=>void }> = ({ page, total, perPage=8, onPage }) => {
  const maxPage = Math.max(1, Math.ceil(total / perPage))
  const prev = () => onPage(Math.max(1, page - 1))
  const next = () => onPage(Math.min(maxPage, page + 1))
  return (
    <div className="pager">
      <span className="muted">Página {page} de {maxPage}</span>
      <button className="btn ghost sm" onClick={prev} disabled={page<=1}><FontAwesomeIcon icon={faChevronLeft} /> Anterior</button>
      <button className="btn sm" onClick={next} disabled={page>=maxPage}>Próxima <FontAwesomeIcon icon={faChevronRight} /></button>
    </div>
  )
}
