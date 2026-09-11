import type { Camera, CapturedImage, CaptureEvent, CaptureSettings, Station } from '@/types'
export const initialStation: Station = {
  id: 'WS2-01',
  name: 'Trạm kiểm tra WS2-01',
  machine: 'M-001',
  fabric: 'F001 (Cotton)',
  roll: 'R20260910-001',
  operator: 'Khải Trần',
  status: 'ready',
}
const positions = [
  'Mặt trên',
  'Mặt dưới',
  'Khu vực trái',
  'Khu vực phải',
  'Mép vải',
  'Góc trái',
  'Góc phải',
  'Tổng quan',
]
export const initialCameras: Camera[] = positions.map((position, i) => ({
  id: `C${String(i + 1).padStart(3, '0')}`,
  stationId: initialStation.id,
  name: `Camera ${String(i + 1).padStart(2, '0')}`,
  position,
  resolution: '1920 × 1080',
  fps: 30,
  status: 'online',
  previewVariant: i,
}))
export const defaultSettings: CaptureSettings = {
  interval: 180,
  format: 'PNG',
  exposure: 5.2,
  gain: 0,
  resolution: '1920 × 1080',
  fps: 30,
}
export const initialEvents: CaptureEvent[] = Array.from({ length: 6 }, (_, i) => ({
  id: `CAP_${String(123 - i).padStart(6, '0')}`,
  stationId: initialStation.id,
  timestamp: new Date(2026, 8, 10, 10, 24 - i * 3, 3).toISOString(),
  triggerType: i % 3 === 1 ? 'manual' : 'automatic',
  cameraCount: initialCameras.length,
  expectedCount: initialCameras.length,
  status: 'success',
  stationSnapshot: { ...initialStation },
}))
export function createImages(
  event: CaptureEvent,
  cameras: Camera[],
  settings: CaptureSettings = defaultSettings,
): CapturedImage[] {
  const [width, height] = settings.resolution.split(' × ').map(Number)
  return cameras.map((camera) => ({
    id: `${event.id}_${camera.id}.${settings.format.toLowerCase()}`,
    captureEventId: event.id,
    cameraId: camera.id,
    timestamp: event.timestamp,
    imageUrl: '/fabric.svg',
    width,
    height,
    fileSize: settings.format === 'PNG' ? 2400000 : 780000,
  }))
}
export const initialImages = initialEvents.flatMap((event) => createImages(event, initialCameras))
