type StickSettingsCardProps = {
  title: string
  innerValue: string
  outerValue: string
  defaultInner: string
  defaultOuter: string
  modeValue: string
  ringValue: string
  onModeChange: (value: string) => void
  onRingChange: (value: string) => void
  disabled?: boolean
  onInnerChange: (value: string) => void
  onOuterChange: (value: string) => void
}

const clamp = (value: number) => {
  if (!Number.isFinite(value)) return 0
  return Math.min(1, Math.max(0, value))
}

export function StickSettingsCard({
  title,
  innerValue,
  outerValue,
  defaultInner,
  defaultOuter,
  modeValue,
  ringValue,
  onModeChange,
  onRingChange,
  disabled = false,
  onInnerChange,
  onOuterChange,
}: StickSettingsCardProps) {
  const resolvedInner = clamp(parseFloat(innerValue || defaultInner))
  const resolvedOuter = clamp(parseFloat(outerValue || defaultOuter))

  return (
    <div className="stick-mode-card" data-capture-ignore="true">
      <h3>{title}</h3>
      <label>
        Stick mode
        <select
          className="app-select"
          value={modeValue}
          onChange={(event) => onModeChange(event.target.value)}
          disabled={disabled}
        >
          <option value="">Default (NO_MOUSE)</option>
          <option value="NO_MOUSE">No Mouse</option>
          <option value="AIM">Aim</option>
          <option value="FLICK">Flick</option>
          <option value="FLICK_ONLY">Flick Only</option>
          <option value="ROTATE_ONLY">Rotate Only</option>
          <option value="MOUSE_RING">Mouse Ring</option>
          <option value="MOUSE_AREA">Mouse Area</option>
          <option value="SCROLL_WHEEL">Scroll Wheel</option>
          <option value="HYBRID_AIM">Hybrid Aim</option>
        </select>
      </label>
      <label>
        Ring mode
        <select
          className="app-select"
          value={ringValue}
          onChange={(event) => onRingChange(event.target.value)}
          disabled={disabled}
        >
          <option value="">Default (OUTER)</option>
          <option value="INNER">Inner</option>
          <option value="OUTER">Outer</option>
        </select>
      </label>
      <label>
        Inner deadzone {innerValue ? '' : `(default ${defaultInner})`}
        <input
          type="number"
          step="0.01"
          min="0"
          max="1"
          value={innerValue}
          placeholder={defaultInner}
          onChange={(event) => onInnerChange(event.target.value)}
          disabled={disabled}
        />
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={resolvedInner}
          onChange={(event) => onInnerChange(event.target.value)}
          disabled={disabled}
        />
      </label>
      <label>
        Outer deadzone {outerValue ? '' : `(default ${defaultOuter})`}
        <input
          type="number"
          step="0.01"
          min="0"
          max="1"
          value={outerValue}
          placeholder={defaultOuter}
          onChange={(event) => onOuterChange(event.target.value)}
          disabled={disabled}
        />
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={resolvedOuter}
          onChange={(event) => onOuterChange(event.target.value)}
          disabled={disabled}
        />
      </label>
    </div>
  )
}
