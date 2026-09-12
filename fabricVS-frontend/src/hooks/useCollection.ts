import { useCallback, useEffect, useRef, useState } from 'react'
import { api, assetUrl } from '@/lib/api'
import type { Camera, CapturedImage, CaptureEvent, CaptureSettings, Station } from '@/types'

type ApiMachine = { id: string; name: string; machine_code: string; fabric: string; roll: string; operator: string; status: 'ready' | 'collecting' }
type ApiCamera = { id: string; machine_id: string; device_index: number; name: string; position: string; resolution: string; fps: number; status: 'online' | 'offline' }
type ApiSettings = { interval_seconds: number; image_format: 'JPEG' | 'PNG' }
type ApiEvent = {
  id: string; machine_id: string; captured_at: string; trigger_type: 'manual' | 'automatic'; camera_count: number; expected_count: number; status: 'success' | 'partial' | 'failed'
  machine_code_snapshot: string; fabric_snapshot: string; roll_snapshot: string; operator_snapshot: string
}
type ApiImage = { id: string; capture_event_id: string; camera_id: string; captured_at: string; image_url: string; width: number; height: number; file_size: number }

const emptyStation: Station = { id: '', name: 'Chưa cấu hình máy', machine: '', fabric: '', roll: '', operator: '', status: 'ready' }
const defaultSettings: CaptureSettings = { interval: 600, format: 'JPEG', exposure: 0, gain: 0, resolution: '1280x720', fps: 30 }

function toStation(machine: ApiMachine): Station {
  return { id: machine.id, name: machine.name, machine: machine.machine_code, fabric: machine.fabric, roll: machine.roll, operator: machine.operator, status: machine.status }
}

function toEvent(event: ApiEvent): CaptureEvent {
  return {
    id: event.id,
    stationId: event.machine_id,
    timestamp: event.captured_at,
    triggerType: event.trigger_type,
    cameraCount: event.camera_count,
    expectedCount: event.expected_count,
    status: event.status === 'failed' ? 'partial' : event.status,
    stationSnapshot: {
      id: event.machine_id, name: event.machine_code_snapshot, machine: event.machine_code_snapshot,
      fabric: event.fabric_snapshot, roll: event.roll_snapshot, operator: event.operator_snapshot, status: 'ready',
    },
  }
}

function toImage(image: ApiImage): CapturedImage {
  return {
    id: image.id, captureEventId: image.capture_event_id, cameraId: image.camera_id,
    timestamp: image.captured_at, imageUrl: assetUrl(image.image_url), width: image.width,
    height: image.height, fileSize: image.file_size,
  }
}

export function useCollection() {
  const [station, setStation] = useState<Station>(emptyStation)
  const [settings, setSettings] = useState<CaptureSettings>(defaultSettings)
  const [cameras, setCameras] = useState<Camera[]>([])
  const [events, setEvents] = useState<CaptureEvent[]>([])
  const [images, setImages] = useState<CapturedImage[]>([])
  const [collecting, setCollecting] = useState(false)
  const [flashing, setFlashing] = useState<string[]>([])
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const flashTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    setError('')
    try {
      const machines = await api<ApiMachine[]>('/machines')
      if (!machines.length) {
        setStation(emptyStation); setCameras([]); setEvents([]); setImages([])
        return
      }
      const machine = machines[0]
      const [apiCameras, apiSettings, apiEvents] = await Promise.all([
        api<ApiCamera[]>(`/cameras?machine_id=${encodeURIComponent(machine.id)}`),
        api<ApiSettings>(`/machines/${machine.id}/settings`),
        api<ApiEvent[]>(`/machines/${machine.id}/capture-events`),
      ])
      const imageGroups = await Promise.all(apiEvents.map((event) => api<ApiImage[]>(`/capture-events/${event.id}/images`)))
      setStation(toStation(machine))
      setCollecting(machine.status === 'collecting')
      setCameras(apiCameras.map((camera, index) => ({
        id: camera.id, stationId: camera.machine_id, deviceIndex: camera.device_index, name: camera.name, position: camera.position,
        resolution: camera.resolution.replace('x', ' × '), fps: camera.fps, status: camera.status, previewVariant: index,
      })))
      setSettings((previous) => ({ ...previous, interval: apiSettings.interval_seconds, format: apiSettings.image_format }))
      setEvents(apiEvents.map(toEvent))
      setImages(imageGroups.flat().map(toImage))
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Không thể kết nối backend.')
    } finally {
      if (!silent) setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])
  useEffect(() => {
    const refreshInterval = window.setInterval(() => void load(true), collecting ? 2_000 : 10_000)
    return () => window.clearInterval(refreshInterval)
  }, [collecting, load])
  useEffect(() => () => clearTimeout(flashTimeout.current), [])

  const capture = useCallback(async (cameraId?: string) => {
    if (!station.id) { setNotice('Hãy tạo máy và cấu hình camera trước khi chụp.'); return }
    try {
      const result = await api<{ event: ApiEvent; images: ApiImage[]; failures: string[] }>(`/machines/${station.id}/captures`, {
        method: 'POST', body: { camera_ids: cameraId ? [cameraId] : undefined, trigger_type: 'manual' },
      })
      setFlashing(result.images.map((image) => image.camera_id))
      clearTimeout(flashTimeout.current)
      flashTimeout.current = setTimeout(() => setFlashing([]), 550)
      setNotice(result.failures.length ? result.failures.join(' ') : `${result.event.id} · Đã chụp thành công.`)
      await load()
    } catch (captureError) {
      setNotice(captureError instanceof Error ? captureError.message : 'Chụp ảnh thất bại.')
    }
  }, [load, station.id])

  const start = useCallback(async () => {
    if (!station.id) return
    try { await api(`/machines/${station.id}/collection/start`, { method: 'POST' }); setCollecting(true); setNotice('Đã bắt đầu thu thập tự động.') }
    catch (startError) { setNotice(startError instanceof Error ? startError.message : 'Không thể bắt đầu thu thập.') }
  }, [station.id])

  const stop = useCallback(async () => {
    if (!station.id) return
    try { await api(`/machines/${station.id}/collection/stop`, { method: 'POST' }); setCollecting(false); setNotice('Đã dừng thu thập.') }
    catch (stopError) { setNotice(stopError instanceof Error ? stopError.message : 'Không thể dừng thu thập.') }
  }, [station.id])

  const saveSettings = useCallback(async (nextSettings: CaptureSettings) => {
    if (!station.id) {
      setSettings(nextSettings)
      return
    }
    const saved = await api<ApiSettings>(`/machines/${station.id}/settings`, {
      method: 'PUT',
      body: {
        interval_seconds: nextSettings.interval,
        image_format: nextSettings.format,
        jpeg_quality: 90,
      },
    })
    setSettings((previous) => ({
      ...previous,
      ...nextSettings,
      interval: saved.interval_seconds,
      format: saved.image_format,
    }))
  }, [station.id])

  return { station, setStation, settings, setSettings, saveSettings, cameras, events, images, collecting, flashing, notice, error, loading, setNotice, capture, start, stop, reload: load }
}
