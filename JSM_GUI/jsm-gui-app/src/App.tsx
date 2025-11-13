import './App.css'
import { useEffect, useMemo, useState } from 'react'
import { useTelemetry } from './hooks/useTelemetry'
import { parseSensitivityValues, updateKeymapEntry, removeKeymapEntry } from './utils/keymap'
import { SensitivityControls } from './components/SensitivityControls'
import { CurvePreview } from './components/CurvePreview'
import { TelemetryBanner } from './components/TelemetryBanner'
import { ConfigEditor } from './components/ConfigEditor'
import { CalibrationCard } from './components/CalibrationCard'

const asNumber = (value: unknown) => (typeof value === 'number' ? value : undefined)
const formatNumber = (value: number | undefined, digits = 2) =>
  typeof value === 'number' && Number.isFinite(value) ? value.toFixed(digits) : '0.00'
const displayValue = (value: unknown) =>
  typeof value === 'number' || typeof value === 'string' ? value : '—'

function App() {
  const { sample, isCalibrating, countdown } = useTelemetry()
  const [configText, setConfigText] = useState('')
  const [appliedConfig, setAppliedConfig] = useState('')
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [recalibrating, setRecalibrating] = useState(false)
  const sensitivity = useMemo(() => parseSensitivityValues(configText), [configText])

  useEffect(() => {
    window.electronAPI?.loadKeymapFile?.().then(text => {
      const next = text ?? ''
      setConfigText(next)
      setAppliedConfig(next)
    })
  }, [])

  const applyConfig = async () => {
    try {
      const result = await window.electronAPI?.applyKeymap?.(configText)
      setStatusMessage(result?.restarted ? 'Keymap applied (JSM restarted).' : 'Keymap applied live.')
      setAppliedConfig(configText)
      setTimeout(() => setStatusMessage(null), 3000)
    } catch (err) {
      console.error(err)
      setStatusMessage('Failed to apply keymap.')
    }
  }

  const handleThresholdChange = (key: 'MIN_GYRO_THRESHOLD' | 'MAX_GYRO_THRESHOLD') => (value: string) => {
    if (value === '') {
      setConfigText(prev => removeKeymapEntry(prev, key))
      return
    }
    const next = parseFloat(value)
    if (Number.isNaN(next)) return
    setConfigText(prev => updateKeymapEntry(prev, key, [next]))
  }

  const handleDualSensChange = (key: 'MIN_GYRO_SENS' | 'MAX_GYRO_SENS', index: 0 | 1) => (value: string) => {
    if (value === '') {
      setConfigText(prev => removeKeymapEntry(prev, key))
      return
    }
    const next = parseFloat(value)
    if (Number.isNaN(next)) return
    setConfigText(prev => {
      const parsed = parseSensitivityValues(prev)
      const current =
        key === 'MIN_GYRO_SENS'
          ? [parsed.minSensX ?? 0, parsed.minSensY ?? parsed.minSensX ?? 0]
          : [parsed.maxSensX ?? 0, parsed.maxSensY ?? parsed.maxSensX ?? 0]
      current[index] = next
      return updateKeymapEntry(prev, key, current)
    })
  }

  const handleStaticSensChange = (index: 0 | 1) => (value: string) => {
    if (value === '') {
      setConfigText(prev => removeKeymapEntry(prev, 'GYRO_SENS'))
      return
    }
    const next = parseFloat(value)
    if (Number.isNaN(next)) return
    setConfigText(prev => {
      const parsed = parseSensitivityValues(prev)
      const current: [number, number] = [
        parsed.gyroSensX ?? parsed.minSensX ?? parsed.maxSensX ?? 1,
        parsed.gyroSensY ?? parsed.minSensY ?? parsed.maxSensY ?? parsed.gyroSensX ?? 1,
      ]
      current[index] = next
      return updateKeymapEntry(prev, 'GYRO_SENS', current)
    })
  }

const handleInGameSensChange = (value: string) => {
  const next = parseFloat(value)
  if (Number.isNaN(next)) return
  setConfigText(prev => updateKeymapEntry(prev, 'IN_GAME_SENS', [next]))
}

const handleRealWorldCalibrationChange = (value: string) => {
  const next = parseFloat(value)
  if (Number.isNaN(next)) return
  setConfigText(prev => updateKeymapEntry(prev, 'REAL_WORLD_CALIBRATION', [next]))
}

  const switchToStaticMode = () => {
    const mode = sensitivity.gyroSensX !== undefined ? 'static' : 'accel'
    if (mode === 'static') return
    const defaultX = sensitivity.minSensX ?? sensitivity.maxSensX ?? 1
    const defaultY = sensitivity.minSensY ?? sensitivity.maxSensY ?? defaultX
    setConfigText(prev => {
      let next = updateKeymapEntry(prev, 'GYRO_SENS', [defaultX, defaultY])
      ;['MIN_GYRO_SENS', 'MAX_GYRO_SENS', 'MIN_GYRO_THRESHOLD', 'MAX_GYRO_THRESHOLD'].forEach(key => {
        next = removeKeymapEntry(next, key)
      })
      return next
    })
  }

  const switchToAccelMode = () => {
    const mode = sensitivity.gyroSensX !== undefined ? 'static' : 'accel'
    if (mode === 'accel') return
    const defaultX = sensitivity.gyroSensX ?? 1
    const defaultY = sensitivity.gyroSensY ?? defaultX
    setConfigText(prev => {
      let next = removeKeymapEntry(prev, 'GYRO_SENS')
      next = updateKeymapEntry(next, 'MIN_GYRO_SENS', [sensitivity.minSensX ?? defaultX, sensitivity.minSensY ?? defaultY])
      next = updateKeymapEntry(next, 'MAX_GYRO_SENS', [sensitivity.maxSensX ?? defaultX, sensitivity.maxSensY ?? defaultY])
      next = updateKeymapEntry(next, 'MIN_GYRO_THRESHOLD', [sensitivity.minThreshold ?? 0])
      next = updateKeymapEntry(next, 'MAX_GYRO_THRESHOLD', [sensitivity.maxThreshold ?? 100])
      return next
    })
  }

  const handleCancel = () => {
    setConfigText(appliedConfig)
  }

  const handleRecalibrate = async () => {
    if (isCalibrating || recalibrating) return
    setRecalibrating(true)
    try {
      const result = await window.electronAPI?.recalibrateGyro?.()
      if (result?.success) {
        setStatusMessage('Recalibration started.')
      } else {
        setStatusMessage('Failed to start recalibration.')
      }
    } catch (err) {
      console.error(err)
      setStatusMessage('Failed to start recalibration.')
    } finally {
      setRecalibrating(false)
      setTimeout(() => setStatusMessage(null), 3000)
    }
  }

  const hasPendingChanges = configText !== appliedConfig

  const telemetryValues = {
    omega: formatNumber(asNumber(sample?.omega)),
    normalized: formatNumber(asNumber(sample?.t)),
    sensX: formatNumber(asNumber(sample?.sensX)),
    sensY: formatNumber(asNumber(sample?.sensY)),
    timestamp: String(displayValue(sample?.ts)),
  }

  const currentMode: 'static' | 'accel' = sensitivity.gyroSensX !== undefined ? 'static' : 'accel'

  return (
    <div className="app-frame">
      <div className="App legacy-shell">
        <header>
          <h1>JoyShockMapper Gyro UI</h1>
        </header>

        <CalibrationCard
          isCalibrating={isCalibrating}
          countdown={countdown}
          recalibrating={recalibrating}
          onRecalibrate={handleRecalibrate}
        />

        <SensitivityControls
          sensitivity={sensitivity}
          isCalibrating={isCalibrating}
          mode={currentMode}
          hasPendingChanges={hasPendingChanges}
          onModeChange={(mode) => (mode === 'static' ? switchToStaticMode() : switchToAccelMode())}
          onApply={applyConfig}
          onCancel={handleCancel}
          onInGameSensChange={handleInGameSensChange}
          onRealWorldCalibrationChange={handleRealWorldCalibrationChange}
          onMinThresholdChange={handleThresholdChange('MIN_GYRO_THRESHOLD')}
          onMaxThresholdChange={handleThresholdChange('MAX_GYRO_THRESHOLD')}
          onMinSensXChange={handleDualSensChange('MIN_GYRO_SENS', 0)}
          onMinSensYChange={handleDualSensChange('MIN_GYRO_SENS', 1)}
          onMaxSensXChange={handleDualSensChange('MAX_GYRO_SENS', 0)}
          onMaxSensYChange={handleDualSensChange('MAX_GYRO_SENS', 1)}
          onStaticSensXChange={handleStaticSensChange(0)}
          onStaticSensYChange={handleStaticSensChange(1)}
        />

        <CurvePreview sensitivity={sensitivity} sample={sample} hasPendingChanges={hasPendingChanges} />

        <TelemetryBanner {...telemetryValues} />

        <ConfigEditor value={configText} onChange={setConfigText} onApply={applyConfig} statusMessage={statusMessage} />
      </div>
    </div>
  )
}

export default App
