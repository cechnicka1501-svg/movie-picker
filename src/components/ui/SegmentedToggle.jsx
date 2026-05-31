export function SegmentedToggle({ options, value, onChange }) {
  return (
    <div className="segmented-toggle">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`segmented-toggle__option${value === opt.value ? ' segmented-toggle__option--active' : ''}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
