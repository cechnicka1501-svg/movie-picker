import { useId } from 'react'

export function Toggle({ checked, onChange, label }) {
  const id = useId()
  return (
    <label className="toggle" htmlFor={id}>
      <span className="toggle__label">{label}</span>
      <div className="toggle__track-wrap">
        <input
          id={id}
          type="checkbox"
          className="toggle__input"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="toggle__track">
          <span className="toggle__thumb" />
        </span>
      </div>
    </label>
  )
}
