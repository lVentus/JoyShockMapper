import './App.css'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTelemetry } from './hooks/useTelemetry'
import { parseSensitivityValues, updateKeymapEntry, removeKeymapEntry } from './utils/keymap'
import { SensitivityControls } from './components/SensitivityControls'
import { CurvePreview } from './components/CurvePreview'
import { TelemetryBanner } from './components/TelemetryBanner'
import { ConfigEditor } from './components/ConfigEditor'
import { CalibrationCard } from './components/CalibrationCard'
import { ProfileManager } from './components/ProfileManager'

const asNumber = (value: unknown) => (typeof value === 'number' ? value : undefined)
const formatNumber = (value: number | undefined, digits = 2) =>
  typeof value === 'number' && Number.isFinite(value) ? value.toFixed(digits) : '0.00'
const displayValue = (value: unknown) =>
  typeof value === 'number' || typeof value === 'string' ? value : '—'

type ProfileInfo = { id: number; name: string }

function App() {
  const { sample, isCalibrating, countdown } = useTelemetry()
  const [configText, setConfigText] = useState('')
  const [appliedConfig, setAppliedConfig] = useState('')
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [recalibrating, setRecalibrating] = useState(false)
  const [profiles, setProfiles] = useState<ProfileInfo[]>([])
  const [activeProfileId, setActiveProfileId] = useState<number | null>(null)
  const [lastAppliedProfileId, setLastAppliedProfileId] = useState<number | null>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [profileCopyStatus, setProfileCopyStatus] = useState<string | null>(null)
  const sensitivity = useMemo(() => parseSensitivityValues(configText), [configText])

  const loadProfileContent = useCallback(async (profileId: number) => {
    if (!profileId) return
    setIsLoadingProfile(true)
    try {
      const text = await window.electronAPI?.loadProfile?.(profileId)
      const next = text ?? ''
      setConfigText(next)
      setAppliedConfig(next)
    } finally {
      setIsLoadingProfile(false)
    }
  }, [])

  const refreshProfiles = useCallback(async () => {
    const state = await window.electronAPI?.getProfiles?.()
    if (state) {
      setProfiles(state.profiles)
      setActiveProfileId(state.activeProfile)
    }
    return state
  }, [])

  useEffect(() => {
    const bootstrap = async () => {
      const state = await refreshProfiles()
      const initialProfileId = state?.activeProfile ?? 1
      setActiveProfileId(initialProfileId)
      await loadProfileContent(initialProfileId)
      setLastAppliedProfileId(initialProfileId)
    }
    bootstrap()
  }, [loadProfileContent, refreshProfiles])

  const applyConfig = async () => {
    if (!activeProfileId) {
      return
    }
    try {
      const result = await window.electronAPI?.applyProfile?.(activeProfileId, configText)
      const profileName = profiles.find(profile => profile.id === activeProfileId)?.name ?? `Profile ${activeProfileId}`
      setStatusMessage(
        result?.restarted ? `Applied ${profileName} (JSM restarted).` : `Applied ${profileName} without restart.`
      )
      setAppliedConfig(configText)
      setLastAppliedProfileId(activeProfileId)
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

  const hasPendingChanges = Boolean(activeProfileId && configText !== appliedConfig)
  const activeProfileApplied = Boolean(activeProfileId && lastAppliedProfileId === activeProfileId)

  const handleCancel = () => {
    setConfigText(appliedConfig)
  }

  const handleProfileSwitch = async (profileId: number) => {
    if (profileId === activeProfileId) return
    if (hasPendingChanges) {
      const shouldSwitch = window.confirm('You have unsaved changes on this profile. Switch anyway?')
      if (!shouldSwitch) return
    }
    try {
      const nextState = await window.electronAPI?.setActiveProfile?.(profileId)
      if (nextState) {
        setProfiles(nextState.profiles)
        setActiveProfileId(nextState.activeProfile)
        await loadProfileContent(nextState.activeProfile)
      } else {
        setActiveProfileId(profileId)
        await loadProfileContent(profileId)
      }
      setStatusMessage(null)
    } catch (err) {
      console.error('Failed to switch profiles', err)
    }
  }

  const handleProfileRename = async (profileId: number, name: string) => {
    try {
      const nextState = await window.electronAPI?.renameProfile?.(profileId, name)
      if (nextState) {
        setProfiles(nextState.profiles)
      }
    } catch (err) {
      console.error('Failed to rename profile', err)
    }
  }

  const handleProfileCopy = async (sourceId: number, targetId: number) => {
    if (sourceId === targetId) return
    try {
      const updated = await window.electronAPI?.copyProfile?.(sourceId, targetId)
      if (updated) {
        setProfiles(updated.profiles)
      }
      if (targetId === activeProfileId) {
        await loadProfileContent(targetId)
        setLastAppliedProfileId(prev => (prev === targetId ? null : prev))
      }
      const sourceName = profiles.find(profile => profile.id === sourceId)?.name ?? `Profile ${sourceId}`
      const targetName = profiles.find(profile => profile.id === targetId)?.name ?? `Profile ${targetId}`
      setProfileCopyStatus(`Copied ${sourceName} into ${targetName}`)
      setTimeout(() => setProfileCopyStatus(null), 2500)
    } catch (err) {
      console.error('Failed to copy profile', err)
      setProfileCopyStatus('Failed to copy profile')
      setTimeout(() => setProfileCopyStatus(null), 2500)
    }
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

  const telemetryValues = {
    omega: formatNumber(asNumber(sample?.omega)),
    normalized: formatNumber(asNumber(sample?.t)),
    sensX: formatNumber(asNumber(sample?.sensX)),
    sensY: formatNumber(asNumber(sample?.sensY)),
    timestamp: String(displayValue(sample?.ts)),
  }

  const currentMode: 'static' | 'accel' = sensitivity.gyroSensX !== undefined ? 'static' : 'accel'
  const activeProfileName = profiles.find(profile => profile.id === activeProfileId)?.name
  const activeProfileFile = activeProfileId ? `keymap_0${activeProfileId}.txt` : null
  const profileFileLabel = activeProfileFile
    ? `${activeProfileFile} — ${activeProfileName ?? `Profile ${activeProfileId}`}`
    : 'Select a profile to begin'

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

        <ProfileManager
          profiles={profiles}
          activeProfileId={activeProfileId}
          hasPendingChanges={hasPendingChanges}
          isCalibrating={isCalibrating}
          profileApplied={activeProfileApplied}
          copyStatus={profileCopyStatus}
          onSelectProfile={handleProfileSwitch}
          onRenameProfile={handleProfileRename}
          onCopyProfile={handleProfileCopy}
          onApplyProfile={applyConfig}
          applyDisabled={!activeProfileId || isLoadingProfile}
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

        <ConfigEditor
          value={configText}
          label={profileFileLabel}
          disabled={!activeProfileId || isLoadingProfile}
          onChange={setConfigText}
          onApply={applyConfig}
          statusMessage={statusMessage}
        />
      </div>
    </div>
  )
}

export default App
