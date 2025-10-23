import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'

export const FormError: React.FC<{ message?: string | null; className?: string }> = ({ message, className }) => {
  if (!message) return null
  return (
    <div className={`form-error ${className || ''}`} aria-live="polite">
      <FontAwesomeIcon icon={faTriangleExclamation} />
      <span>{message}</span>
    </div>
  )
}
