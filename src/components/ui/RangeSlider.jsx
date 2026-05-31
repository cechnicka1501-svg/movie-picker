export function RangeSlider({ min, max, step, value, onChange, formatValue }) {
  const display = formatValue ? formatValue(value) : value
  return (
    <div className="range-slider">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="range-slider__input"
      />
      <span className="range-slider__value">{display}</span>
    </div>
  )
}
