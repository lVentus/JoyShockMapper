type TelemetryBannerProps = {
  omega: string
  sensX: string
  sensY: string
  timestamp: string
}

export function TelemetryBanner({ omega, sensX, sensY, timestamp }: TelemetryBannerProps) {
  return (
    <section className="telemetry-banner">
      <p className="telemetry-heading">Live packets streaming</p>
      <div className="telemetry-readouts">
        <div className="telemetry-node">
          <span className="telemetry-label">Gyro Speed</span>
          <strong className="telemetry-value">{omega}°/s</strong>
        </div>
        <div className="telemetry-node">
          <span className="telemetry-label">Sens X/Y</span>
          <strong className="telemetry-value">{sensX} / {sensY}</strong>
        </div>
        <div className="telemetry-node">
          <span className="telemetry-label">Timestamp</span>
          <strong className="telemetry-value">{timestamp}</strong>
        </div>
      </div>
    </section>
  )
}
