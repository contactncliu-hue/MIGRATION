import './forms.css'
import { useId } from 'react'

type InputProps = React.ComponentPropsWithRef<'input'>

interface FieldProps extends Omit<InputProps, 'id'> {
  label: string
  /** Render a custom control (select, button group) instead of an <input>. */
  children?: React.ReactNode
}

/**
 * Labelled form control. Wires label→control with a generated id so every
 * field is reachable by screen readers and clickable by label.
 */
export function Field({ label, children, ...inputProps }: FieldProps) {
  const id = useId()

  return (
    <div className="field">
      <label htmlFor={children ? undefined : id}>{label}</label>
      {children ?? <input id={id} {...inputProps} />}
    </div>
  )
}

/** Two fields side by side. */
export function FieldRow({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={`field-row ${className}`.trim()}>{children}</div>
}
