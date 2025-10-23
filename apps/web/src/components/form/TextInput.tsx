import React from 'react'
import { FormError } from './FormError'

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  right?: React.ReactNode
  error?: string | null
}

export const TextInput = React.forwardRef<HTMLInputElement, Props>(({ label, right, className, error, ...inputProps }, ref) => {
  const innerRef = React.useRef<HTMLInputElement | null>(null)
  const setRefs = React.useCallback((el: HTMLInputElement | null) => {
    innerRef.current = el
    if (typeof ref === 'function') ref(el)
    else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = el
  }, [ref])

  const isDate = inputProps.type === 'date'

  const onRightClick = () => {
    if (!isDate) return
    const el = innerRef.current
    if (!el) return
    try {
      // open native date picker when supported
      ;(el as any).showPicker ? (el as any).showPicker() : (el as any).focus()
    } catch {
      el.focus()
    }
  }

  return (
    <div className="field">
      {label && <label>{label}</label>}
      <div className="input-wrap">
        <input ref={setRefs} className={className} {...inputProps} aria-invalid={!!error} />
        {right ? (
          isDate ? (
            <button type="button" className="icon-right" onClick={onRightClick} aria-label="Abrir calendário">
              {right}
            </button>
          ) : (
            <span className="icon-right">{right}</span>
          )
        ) : null}
      </div>
      <FormError message={error} />
    </div>
  )
})

TextInput.displayName = 'TextInput'
