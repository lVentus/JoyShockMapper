type ConfigEditorProps = {
  value: string
  label: string
  disabled?: boolean
  onChange: (value: string) => void
  onApply: () => void
  statusMessage: string | null
}

export function ConfigEditor({ value, label, disabled = false, onChange, onApply, statusMessage }: ConfigEditorProps) {
  return (
    <section className="config-panel legacy">
      <label>
        {label}
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={12} disabled={disabled} />
      </label>
      <div className="config-actions">
        <button onClick={onApply} disabled={disabled}>
          Apply Changes
        </button>
      </div>
      {statusMessage && <p className="status-message">{statusMessage}</p>}
    </section>
  )
}
