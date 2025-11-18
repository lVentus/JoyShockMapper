import { SensitivityValues } from '../utils/keymap'

type AccelSensFormProps = {
  sensitivity: SensitivityValues
  onMinThresholdChange: (value: string) => void
  onMaxThresholdChange: (value: string) => void
  onMinSensXChange: (value: string) => void
  onMinSensYChange: (value: string) => void
  onMaxSensXChange: (value: string) => void
  onMaxSensYChange: (value: string) => void
}

export function AccelSensForm({
  sensitivity,
  onMinThresholdChange,
  onMaxThresholdChange,
  onMinSensXChange,
  onMinSensYChange,
  onMaxSensXChange,
  onMaxSensYChange,
}: AccelSensFormProps) {
  const minSensXValue = sensitivity.minSensX ?? ''
  const minSensYValue = sensitivity.minSensY ?? sensitivity.minSensX ?? ''
  const maxSensXValue = sensitivity.maxSensX ?? ''
  const maxSensYValue = sensitivity.maxSensY ?? sensitivity.maxSensX ?? ''
  const minSensXRange = sensitivity.minSensX ?? 0
  const minSensYRange = sensitivity.minSensY ?? sensitivity.minSensX ?? 0
  const maxSensXRange = sensitivity.maxSensX ?? 0
  const maxSensYRange = sensitivity.maxSensY ?? sensitivity.maxSensX ?? 0
  return (
    <>
      <div className="flex-inputs">
        <label>
          Min Sens (X)
          <input type="number" step="0.1" value={minSensXValue} onChange={(e) => onMinSensXChange(e.target.value)} />
          <input type="range" min="0" max="30" step="0.1" value={minSensXRange} onChange={(e) => onMinSensXChange(e.target.value)} />
        </label>
        <label>
          Min Sens (Y)
          <input type="number" step="0.1" value={minSensYValue} onChange={(e) => onMinSensYChange(e.target.value)} />
          <input type="range" min="0" max="30" step="0.1" value={minSensYRange} onChange={(e) => onMinSensYChange(e.target.value)} />
        </label>
        <label>
          Max Sens (X)
          <input type="number" step="0.1" value={maxSensXValue} onChange={(e) => onMaxSensXChange(e.target.value)} />
          <input type="range" min="0" max="30" step="0.1" value={maxSensXRange} onChange={(e) => onMaxSensXChange(e.target.value)} />
        </label>
        <label>
          Max Sens (Y)
          <input type="number" step="0.1" value={maxSensYValue} onChange={(e) => onMaxSensYChange(e.target.value)} />
          <input type="range" min="0" max="30" step="0.1" value={maxSensYRange} onChange={(e) => onMaxSensYChange(e.target.value)} />
        </label>
      </div>
      <div className="flex-inputs">
        <label>
          Min Threshold
          <input type="number" step="1" value={sensitivity.minThreshold ?? ''} onChange={(e) => onMinThresholdChange(e.target.value)} />
          <input type="range" min="0" max="500" step="1" value={sensitivity.minThreshold ?? 0} onChange={(e) => onMinThresholdChange(e.target.value)} />
        </label>
        <label>
          Max Threshold
          <input type="number" step="1" value={sensitivity.maxThreshold ?? ''} onChange={(e) => onMaxThresholdChange(e.target.value)} />
          <input type="range" min="0" max="500" step="1" value={sensitivity.maxThreshold ?? 0} onChange={(e) => onMaxThresholdChange(e.target.value)} />
        </label>
      </div>
    </>
  )
}
