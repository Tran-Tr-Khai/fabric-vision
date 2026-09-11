import { useCallback, useEffect, useRef, useState } from 'react'
import {
  createImages,
  defaultSettings,
  initialCameras,
  initialEvents,
  initialImages,
  initialStation,
} from '@/data/mock'
import type { CaptureEvent, CaptureSettings, Station } from '@/types'
export function useCollection() {
  const [station, setStation] = useState<Station>(initialStation)
  const [settings, setSettings] = useState<CaptureSettings>(defaultSettings)
  const [events, setEvents] = useState(initialEvents)
  const [images, setImages] = useState(initialImages)
  const [collecting, setCollecting] = useState(false)
  const [flashing, setFlashing] = useState<string[]>([])
  const [notice, setNotice] = useState('')
  const counter = useRef(124)
  const flashTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const cameras = initialCameras.map((camera) => ({
    ...camera,
    resolution: settings.resolution,
    fps: settings.fps,
  }))
  const capture = useCallback(
    (cameraId?: string, triggerType: CaptureEvent['triggerType'] = 'manual') => {
      const targets = initialCameras.filter(
        (camera) => camera.status === 'online' && (!cameraId || camera.id === cameraId),
      )
      if (!targets.length) return
      const expectedCount = cameraId ? 1 : initialCameras.length
      const event: CaptureEvent = {
        id: `CAP_${String(counter.current++).padStart(6, '0')}`,
        stationId: station.id,
        timestamp: new Date().toISOString(),
        triggerType,
        cameraCount: targets.length,
        expectedCount,
        status: targets.length === expectedCount ? 'success' : 'partial',
        stationSnapshot: { ...station },
      }
      setEvents((previous) => [event, ...previous])
      setImages((previous) => [...createImages(event, targets, settings), ...previous])
      setFlashing(targets.map((camera) => camera.id))
      clearTimeout(flashTimeout.current)
      flashTimeout.current = setTimeout(() => setFlashing([]), 550)
      setNotice(`${event.id} · Đã chụp ${targets.length} camera thành công`)
    },
    [station, settings],
  )
  useEffect(() => {
    if (!collecting) return
    const timer = setInterval(() => capture(undefined, 'automatic'), settings.interval * 1000)
    return () => clearInterval(timer)
  }, [collecting, settings.interval, capture])
  useEffect(() => () => clearTimeout(flashTimeout.current), [])
  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(() => setNotice(''), 4000)
    return () => clearTimeout(timer)
  }, [notice])
  function start() {
    setCollecting(true)
    capture(undefined, 'automatic')
  }
  function stop() {
    setCollecting(false)
    setNotice('Đã dừng thu thập. Ảnh đã chụp vẫn được giữ trong phiên này.')
  }
  return {
    station: { ...station, status: collecting ? ('collecting' as const) : ('ready' as const) },
    setStation,
    settings,
    setSettings,
    cameras,
    events,
    images,
    collecting,
    flashing,
    notice,
    setNotice,
    capture,
    start,
    stop,
  }
}
