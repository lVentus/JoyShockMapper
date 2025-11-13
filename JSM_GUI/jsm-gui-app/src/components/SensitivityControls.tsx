import { SensitivityValues } from '../utils/keymap'
import { StaticSensForm } from './StaticSensForm'
import { AccelSensForm } from './AccelSensForm'

type SensitivityControlsProps = {
  sensitivity: SensitivityValues
  isCalibrating: boolean
  mode: 'static' | 'accel'
  hasPendingChanges: boolean
  onModeChange: (mode: 'static' | 'accel') => void
  onApply: () => void
  onCancel: () => void
  onInGameSensChange: (value: string) => void
  onRealWorldCalibrationChange: (value: string) => void
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
  onModeChange,
  onApply,
  onCancel,
  onInGameSensChange,
  onRealWorldCalibrationChange,
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
    <section className={`control-panel lockable ${isCalibrating ? 'locked' : ''}`}>
      <div className="locked-overlay">Controls locked while JSM calibrates</div>
      <div className="mode-toggle">
        <button className={mode === 'static' ? 'active' : ''} onClick={() => onModeChange('static')}>
          Static Sensitivity
        </button>
        <button className={mode === 'accel' ? 'active' : ''} onClick={() => onModeChange('accel')}>
          Acceleration Curve
        </button>
      </div>
      <h2>Gyro Sensitivity Controls</h2>
      <div className="flex-inputs">
        <label>
          In-Game Sens
          <input type="number" step="0.1" value={sensitivity.inGameSens ?? ''} onChange={(e) => onInGameSensChange(e.target.value)} />
        </label>
        <label>
          Real World Calibration
          <input type="number" step="0.1" value={sensitivity.realWorldCalibration ?? ''} onChange={(e) => onRealWorldCalibrationChange(e.target.value)} />
        </label>
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
        <button onClick={onApply}>Apply Changes</button>
        {hasPendingChanges && (
          <button className="secondary-btn" onClick={onCancel}>Cancel</button>
        )}
        {hasPendingChanges && (
          <span className="pending-banner">Pending changes — click Apply to send to JoyShockMapper.</span>
        )}
      </div>
    </section>
  )
}
