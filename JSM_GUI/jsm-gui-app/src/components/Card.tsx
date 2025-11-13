import { ReactNode } from 'react'

type CardProps = {
  children: ReactNode
  className?: string
  lockable?: boolean
  locked?: boolean
  lockMessage?: string
}

export function Card({ children, className = '', lockable = false, locked = false, lockMessage }: CardProps) {
  const classes = ['app-card']
  if (lockable) classes.push('lockable')
  if (locked) classes.push('locked')
  if (className) classes.push(className)

  return (
    <section className={classes.join(' ')}>
      {lockable && lockMessage && <div className="locked-overlay">{lockMessage}</div>}
      {children}
    </section>
  )
}
