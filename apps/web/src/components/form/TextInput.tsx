import React from 'react'

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  right?: React.ReactNode
}

export const TextInput = React.forwardRef<HTMLInputElement, Props>(({ label, right, className, ...inputProps }, ref) => (
  <div className="field">
    {label && <label>{label}</label>}
    <div className="input-wrap">
      <input ref={ref} className={className} {...inputProps} />
      {right ? <span className="icon-right">{right}</span> : null}
    </div>
  </div>
))

TextInput.displayName = 'TextInput'

