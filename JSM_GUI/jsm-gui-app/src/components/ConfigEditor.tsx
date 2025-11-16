type ConfigEditorProps = {
  value: string
  label: string
  disabled?: boolean
  onChange: (value: string) => void
  onApply: () => void
  statusMessage: string | null
}

import { Card } from './Card'

export function ConfigEditor({ value, label, disabled = false, onChange, onApply, statusMessage }: ConfigEditorProps) {
  return (
    <Card className="config-panel legacy">
      <label>
        {label}
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={12} disabled={disabled} />
      </label>
      <div className="config-actions">
        <button className="secondary-btn" onClick={onApply} disabled={disabled}>
          Apply Changes
        </button>
      </div>
      {statusMessage && <p className="status-message">{statusMessage}</p>}
    </Card>
  )
}
