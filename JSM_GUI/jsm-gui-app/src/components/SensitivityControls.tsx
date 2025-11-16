import { SensitivityValues } from '../utils/keymap'
import { StaticSensForm } from './StaticSensForm'
import { AccelSensForm } from './AccelSensForm'
import { Card } from './Card'
import { TelemetrySample } from '../hooks/useTelemetry'
import { CurvePreview } from './CurvePreview'

type SensitivityControlsProps = {
  sensitivity: SensitivityValues
  isCalibrating: boolean
  mode: 'static' | 'accel'
  hasPendingChanges: boolean
  sample: TelemetrySample | null
  telemetry: {
    omega: string
    sensX: string
    sensY: string
    timestamp: string
  }
  onModeChange: (mode: 'static' | 'accel') => void
  onApply: () => void
  onCancel: () => void
  onMinThresholdChange: (value: string) => void
  onMaxThresholdChange: (value: string) => void
  onMinSensXChange: (value: string) => void
  onMinSensYChange: (value: string) => void
  onMaxSensXChange: (value: string) => void
  onMaxSensYChange: (value: string) => void
  onStaticSensXChange: (value: string) => void
  onStaticSensYChange: (value: string) => void
}

export function SensitivityControls({
  sensitivity,
  isCalibrating,
  mode,
  hasPendingChanges,
  sample,
  telemetry,
  onModeChange,
  onApply,
  onCancel,
  onMinThresholdChange,
  onMaxThresholdChange,
  onMinSensXChange,
  onMinSensYChange,
  onMaxSensXChange,
  onMaxSensYChange,
  onStaticSensXChange,
  onStaticSensYChange,
}: SensitivityControlsProps) {
  return (
    <Card
      className="control-panel"
      lockable
      locked={isCalibrating}
      lockMessage="Controls locked while JSM calibrates"
    >
      <h2>Gyro Sensitivity Controls</h2>
      <div className="mode-toggle">
        <button className={`pill-tab ${mode === 'static' ? 'active' : ''}`} onClick={() => onModeChange('static')}>
          Static Sensitivity
        </button>
        <button className={`pill-tab ${mode === 'accel' ? 'active' : ''}`} onClick={() => onModeChange('accel')}>
          Acceleration Curve
        </button>
      </div>
      {mode === 'static' ? (
        <StaticSensForm
          sensitivity={sensitivity}
          onChangeX={onStaticSensXChange}
          onChangeY={onStaticSensYChange}
        />
      ) : (
        <AccelSensForm
          sensitivity={sensitivity}
          onMinThresholdChange={onMinThresholdChange}
          onMaxThresholdChange={onMaxThresholdChange}
          onMinSensXChange={onMinSensXChange}
          onMinSensYChange={onMinSensYChange}
          onMaxSensXChange={onMaxSensXChange}
          onMaxSensYChange={onMaxSensYChange}
        />
      )}
      <div className="control-actions">
        <button className="secondary-btn" onClick={onApply}>Apply Changes</button>
        {hasPendingChanges && (
          <button className="secondary-btn" onClick={onCancel}>Cancel</button>
        )}
        {hasPendingChanges && (
          <span className="pending-banner">Pending changes — click Apply to send to JoyShockMapper.</span>
        )}
      </div>
      <CurvePreview sensitivity={sensitivity} sample={sample} hasPendingChanges={hasPendingChanges} telemetry={telemetry} />
    </Card>
  )
}
