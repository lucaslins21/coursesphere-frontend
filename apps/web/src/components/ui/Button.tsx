import React from 'react'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'gradient'
  full?: boolean
}

export const Button: React.FC<Props> = ({ variant='primary', full, className, children, ...rest }) => {
  const cls = ['btn']
  if (variant === 'ghost') cls.push('ghost')
  if (variant === 'gradient') cls.push('gradient')
  if (className) cls.push(className)
  return (
    <button className={cls.join(' ')} style={full?{width:'100%', justifyContent:'center'}:undefined} {...rest}>
      {children}
    </button>
  )
}

