const MIN_YEAR = 1930
const MAX_YEAR = 2026

export function YearRange({ yearFrom, yearTo, onYearFromChange, onYearToChange, onClear }) {
  return (
    <div className="year-range">
      <div className="year-range__header">
        <span className="year-range__display">{yearFrom}–{yearTo}</span>
        <button type="button" className="text-action" onClick={onClear}>
          Clear years
        </button>
      </div>
      <div className="year-range__sliders">
        <div className="year-range__row">
          <span className="year-range__sublabel">From</span>
          <input
            type="range"
            min={MIN_YEAR}
            max={MAX_YEAR}
            step={1}
            value={yearFrom}
            onChange={(e) => onYearFromChange(parseInt(e.target.value, 10))}
            className="range-slider__input"
          />
        </div>
        <div className="year-range__row">
          <span className="year-range__sublabel">To</span>
          <input
            type="range"
            min={MIN_YEAR}
            max={MAX_YEAR}
            step={1}
            value={yearTo}
            onChange={(e) => onYearToChange(parseInt(e.target.value, 10))}
            className="range-slider__input"
          />
        </div>
      </div>
    </div>
  )
}
