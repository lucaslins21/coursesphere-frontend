import React, { useState } from 'react'
import { FormError } from './FormError'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string | null
}

export const PasswordInput = React.forwardRef<HTMLInputElement, Props>(({ label, error, ...inputProps }, ref) => {
  const [show, setShow] = useState(false)
  return (
    <div className="field">
      {label && <label>{label}</label>}
      <div className="input-wrap">
        <input ref={ref} type={show ? 'text' : 'password'} aria-invalid={!!error} {...inputProps} />
        <button type="button" className="icon-right" onClick={()=>setShow(s=>!s)} aria-label="Mostrar/ocultar senha">
          <FontAwesomeIcon icon={show? faEyeSlash : faEye} />
        </button>
      </div>
      <FormError message={error} />
    </div>
  )
})

PasswordInput.displayName = 'PasswordInput'
