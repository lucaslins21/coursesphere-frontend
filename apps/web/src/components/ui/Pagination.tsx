import React from 'react'
export const Pagination: React.FC<{ page:number; total:number; perPage?:number; onPage:(p:number)=>void }> = ({ page, total, perPage=8, onPage }) => {
  const maxPage = Math.max(1, Math.ceil(total / perPage))
  const prev = () => onPage(Math.max(1, page - 1))
  const next = () => onPage(Math.min(maxPage, page + 1))
  return (
    <div style={{display:'flex', gap:8, alignItems:'center', justifyContent:'flex-end', marginTop:12}}>
      <span className="muted">Página {page} de {maxPage}</span>
      <button className="btn ghost" onClick={prev} disabled={page<=1}>Anterior</button>
      <button className="btn" onClick={next} disabled={page>=maxPage}>Próxima</button>
    </div>
  )
}
