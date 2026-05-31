export function Chip({ label, selected, onClick, disabled = false }) {
  return (
    <button
      className={`chip${selected ? ' chip--selected' : ''}${disabled ? ' chip--disabled' : ''}`}
      onClick={disabled ? undefined : onClick}
      type="button"
    >
      {label}
    </button>
  )
}
