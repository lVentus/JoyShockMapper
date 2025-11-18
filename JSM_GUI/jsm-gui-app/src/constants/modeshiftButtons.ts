type ModeshiftButtonOption = {
  value: string
  label: string
}

export const MODESHIFT_BUTTON_OPTIONS: ModeshiftButtonOption[] = [
  { value: '', label: 'No mode shift' },
  { value: 'S', label: 'S — South / Bottom' },
  { value: 'E', label: 'E — East / Right' },
  { value: 'N', label: 'N — North / Top' },
  { value: 'W', label: 'W — West / Left' },
  { value: 'UP', label: 'UP — D-pad up' },
  { value: 'DOWN', label: 'DOWN — D-pad down' },
  { value: 'LEFT', label: 'LEFT — D-pad left' },
  { value: 'RIGHT', label: 'RIGHT — D-pad right' },
  { value: 'L', label: 'L — Left bumper (L1/LB)' },
  { value: 'R', label: 'R — Right bumper (R1/RB)' },
  { value: 'ZL', label: 'ZL — Left trigger soft pull' },
  { value: 'ZLF', label: 'ZLF — Left trigger full pull' },
  { value: 'ZR', label: 'ZR — Right trigger soft pull' },
  { value: 'ZRF', label: 'ZRF — Right trigger full pull' },
  { value: '+', label: '+ — Options/Menu' },
  { value: '-', label: '- — Share/View' },
  { value: 'HOME', label: 'HOME — PS / Guide button' },
  { value: 'CAPTURE', label: 'CAPTURE — Touchpad click' },
  { value: 'MIC', label: 'MIC — Microphone button' },
  { value: 'L3', label: 'L3 — Left stick click' },
  { value: 'R3', label: 'R3 — Right stick click' },
  { value: 'LUP', label: 'LUP — Left stick up' },
  { value: 'LDOWN', label: 'LDOWN — Left stick down' },
  { value: 'LLEFT', label: 'LLEFT — Left stick left' },
  { value: 'LRIGHT', label: 'LRIGHT — Left stick right' },
  { value: 'LRING', label: 'LRING — Left stick ring' },
  { value: 'RUP', label: 'RUP — Right stick up' },
  { value: 'RDOWN', label: 'RDOWN — Right stick down' },
  { value: 'RLEFT', label: 'RLEFT — Right stick left' },
  { value: 'RRIGHT', label: 'RRIGHT — Right stick right' },
  { value: 'RRING', label: 'RRING — Right stick ring' },
]
