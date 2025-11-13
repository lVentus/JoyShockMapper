import { SensitivityValues } from '../utils/keymap'
import { SensitivityGraph } from './SensitivityGraph'
import { TelemetrySample } from '../hooks/useTelemetry'
import { TelemetryBanner } from './TelemetryBanner'

type CurvePreviewProps = {
  sensitivity: SensitivityValues
  sample: TelemetrySample | null
  hasPendingChanges: boolean
  telemetry: {
    omega: string
    sensX: string
    sensY: string
    timestamp: string
  }
}

export function CurvePreview({ sensitivity, sample, hasPendingChanges, telemetry }: CurvePreviewProps) {
  const asNumber = (value: unknown) => (typeof value === 'number' ? value : undefined)
  return (
    <section className="graph-panel">
      <h2>Curve Preview</h2>
      <div className="graph-legend">
        <span><span className="legend-dot sensitivity" /> Sensitivity</span>
        <span><span className="legend-dot velocity" /> Normalized output velocity</span>
        <span className="legend-curve">Curve: {sample?.curve ?? 'linear'}</span>
      </div>
      <SensitivityGraph
        minThreshold={sensitivity.minThreshold}
        maxThreshold={sensitivity.maxThreshold}
        minSensX={sensitivity.minSensX}
        minSensY={sensitivity.minSensY}
        maxSensX={sensitivity.maxSensX}
        maxSensY={sensitivity.maxSensY}
        normalized={asNumber(sample?.t)}
        currentSensX={asNumber(sample?.sensX)}
        omega={asNumber(sample?.omega)}
        disableLiveDot={hasPendingChanges}
      />
      <small>Live dot tracks the current gyro speed against your sensitivity curve.</small>
      <div className="graph-footer">
        <TelemetryBanner {...telemetry} />
      </div>
    </section>
  )
}
