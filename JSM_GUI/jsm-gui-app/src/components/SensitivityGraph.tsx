import { useEffect, useRef } from 'react'

interface SensitivityGraphProps {
  minThreshold?: number
  maxThreshold?: number
  minSensX?: number
  minSensY?: number
  maxSensX?: number
  maxSensY?: number
  normalized?: number
  currentSensX?: number
  currentSensY?: number
  omega?: number
}

const MAX_OMEGA = 500

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

export function SensitivityGraph(props: SensitivityGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const {
      minThreshold,
      maxThreshold,
      minSensX,
      minSensY,
      maxSensX,
      maxSensY,
      normalized,
      currentSensX,
      currentSensY,
      omega,
    } = props

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const ratio = window.devicePixelRatio || 1
    const baseWidth = 800
    const baseHeight = 420
    canvas.width = baseWidth * ratio
    canvas.height = baseHeight * ratio
    canvas.style.width = '100%'
    canvas.style.height = `${(baseHeight / baseWidth) * 100}%`
    ctx.resetTransform()
    ctx.scale(ratio, ratio)

    ctx.fillStyle = '#0f0f0f'
    ctx.fillRect(0, 0, baseWidth, baseHeight)
    ctx.strokeStyle = '#2d2d2d'
    ctx.lineWidth = 2
    ctx.strokeRect(0, 0, baseWidth, baseHeight)

    if (
      minThreshold === undefined ||
      maxThreshold === undefined ||
      minSensX === undefined ||
      minSensY === undefined ||
      maxSensX === undefined ||
      maxSensY === undefined
    ) {
      ctx.fillStyle = '#777'
      ctx.font = '16px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('Provide min/max sensitivity + thresholds to preview.', baseWidth / 2, baseHeight / 2)
      return
    }

    const paddingLeft = 55
    const paddingRight = 25
    const paddingTop = 25
    const paddingBottom = 60
    const graphWidth = baseWidth - paddingLeft - paddingRight
    const graphHeight = baseHeight - paddingTop - paddingBottom

    ctx.fillStyle = '#ddd'
    ctx.font = '14px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Threshold (°/s)', paddingLeft + graphWidth / 2, baseHeight - 20)
    ctx.save()
    ctx.translate(20, paddingTop + graphHeight / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText('RWS', 0, 0)
    ctx.restore()

    const axisMaxX = Math.max(MAX_OMEGA, maxThreshold)
    const axisMaxY = Math.max(minSensX, minSensY, maxSensX, maxSensY, 2)

    const toX = (speed: number) => paddingLeft + (graphWidth * (speed / axisMaxX))
    const toY = (sens: number) => paddingTop + graphHeight - (graphHeight * (sens / axisMaxY))

    ctx.strokeStyle = '#3b3b3b'
    ctx.lineWidth = 1
    ctx.font = '12px sans-serif'
    ctx.fillStyle = '#aaa'
    ctx.textAlign = 'right'
    for (let i = 0; i <= 6; i++) {
      const value = (axisMaxY / 6) * i
      const y = paddingTop + graphHeight - (graphHeight / 6) * i
      ctx.beginPath()
      ctx.moveTo(paddingLeft, y)
      ctx.lineTo(baseWidth - paddingRight, y)
      ctx.stroke()
      ctx.fillText(value.toFixed(2), paddingLeft - 7, y + 4)
    }
    ctx.textAlign = 'center'
    for (let i = 0; i <= 10; i++) {
      const value = (axisMaxX / 10) * i
      const x = paddingLeft + (graphWidth / 10) * i
      ctx.beginPath()
      ctx.moveTo(x, paddingTop)
      ctx.lineTo(x, paddingTop + graphHeight)
      ctx.stroke()
      ctx.fillText(value.toFixed(0), x, paddingTop + graphHeight + 30)
    }

    const drawCurve = (minSens: number, maxSens: number, color: string) => {
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(toX(0), toY(minSens))
      ctx.lineTo(toX(minThreshold), toY(minSens))
      ctx.lineTo(toX(maxThreshold), toY(maxSens))
      ctx.lineTo(toX(axisMaxX), toY(maxSens))
      ctx.stroke()
    }

    drawCurve(minSensX, maxSensX, '#6a8bff')
    drawCurve(minSensY, maxSensY, '#ff6d6d')

    const resolveLive = () => {
      if (typeof omega === 'number' && Number.isFinite(omega)) {
        return {
          speed: clamp(omega, 0, axisMaxX),
          sensX: typeof currentSensX === 'number' ? currentSensX : undefined,
          sensY: typeof currentSensY === 'number' ? currentSensY : undefined,
        }
      }
      if (typeof normalized === 'number' && Number.isFinite(normalized)) {
          const t = clamp(normalized, 0, 1)
          const speed = minThreshold + t * (maxThreshold - minThreshold)
          const sensX = minSensX + t * (maxSensX - minSensX)
          const sensY = minSensY + t * (maxSensY - minSensY)
          return { speed, sensX, sensY }
      }
      return null
    }

    const live = resolveLive()
    if (live) {
      const getSens = (speed: number, minSens: number, maxSens: number) => {
        if (speed <= minThreshold) return minSens
        if (speed >= maxThreshold) return maxSens
        const progress = (speed - minThreshold) / (maxThreshold - minThreshold || 1)
        return minSens + progress * (maxSens - minSens)
      }
      const speed = clamp(live.speed, 0, axisMaxX)
      const sensX = live.sensX ?? getSens(speed, minSensX, maxSensX)
      const sensY = live.sensY ?? getSens(speed, minSensY, maxSensY)

      const drawDot = (sens: number, color: string) => {
        ctx.beginPath()
        ctx.arc(toX(speed), toY(sens), 5, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.fill()
      }
      drawDot(sensX, '#6a8bff')
      drawDot(sensY, '#ff6d6d')

      ctx.fillStyle = '#ddd'
      ctx.font = '12px monospace'
      ctx.textAlign = 'right'
      ctx.fillText(`LIVE → SPEED: ${speed.toFixed(1)}°/s`, baseWidth - 15, paddingTop + graphHeight - 30)
      ctx.fillText(`H: ${sensX.toFixed(3)}   V: ${sensY.toFixed(3)}`, baseWidth - 15, paddingTop + graphHeight - 12)
    }

    ctx.textAlign = 'left'
    ctx.fillStyle = '#6a8bff'
    ctx.fillRect(paddingLeft, paddingTop - 15, 12, 12)
    ctx.fillStyle = '#ddd'
    ctx.fillText('(H)', paddingLeft + 18, paddingTop - 5)
    ctx.fillStyle = '#ff6d6d'
    ctx.fillRect(paddingLeft + 55, paddingTop - 15, 12, 12)
    ctx.fillStyle = '#ddd'
    ctx.fillText('(V)', paddingLeft + 73, paddingTop - 5)
  }, [
    props.minThreshold,
    props.maxThreshold,
    props.minSensX,
    props.minSensY,
    props.maxSensX,
    props.maxSensY,
    props.normalized,
    props.currentSensX,
    props.currentSensY,
    props.omega,
  ])

  return <canvas ref={canvasRef} className="legacy-curve-canvas" />
}
