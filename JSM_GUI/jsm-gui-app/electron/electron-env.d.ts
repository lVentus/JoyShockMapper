/// <reference types="vite-plugin-electron/electron-env" />

declare namespace NodeJS {
  interface ProcessEnv {
    /**
     * The built directory structure
     *
     * ```tree
     * ├─┬─┬ dist
     * │ │ └── index.html
     * │ │
     * │ ├─┬ dist-electron
     * │ │ ├── main.js
     * │ │ └── preload.js
     * │
     * ```
     */
    APP_ROOT: string
    /** /dist/ or /public/ */
    VITE_PUBLIC: string
  }
}

// Used in Renderer process, expose in `preload.ts`
interface Window {
  electronAPI: {
    launchJSM: (calibrationSeconds?: number) => Promise<void>
    terminateJSM: () => Promise<void>
    saveKeymapFile: (text: string) => Promise<void>
    loadKeymapFile: () => Promise<string>
    minimizeTemporarily: () => Promise<void>
    applyKeymap: (text: string) => Promise<{ restarted: boolean }>
    onCalibrationStatus: (callback: (payload: { calibrating: boolean; seconds?: number }) => void) => () => void
  }
  telemetry: {
    onSample: (callback: (payload: unknown) => void) => () => void
  }
}
