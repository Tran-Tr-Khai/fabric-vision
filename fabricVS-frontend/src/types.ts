export type Page = 'capture' | 'dataset' | 'labeling' | 'settings'

export type ImageLabel = 'normal' | 'defect' | 'suspected' | 'unclear'
export type DefectType =
  'hole' | 'stain' | 'broken-yarn' | 'missing-yarn' | 'slub' | 'wrinkle' | 'other'

export interface ImageReview {
  imageId: string
  label?: ImageLabel
  defectType?: DefectType
  notes: string
  reviewed: boolean
  updatedAt?: string
}
export interface Station {
  id: string
  name: string
  machine: string
  fabric: string
  roll: string
  operator: string
  status: 'ready' | 'collecting'
}
export interface Camera {
  id: string
  stationId: string
  deviceIndex?: number
  name: string
  position: string
  resolution: string
  fps: number
  status: 'online' | 'offline'
  previewVariant: number
}
export interface CaptureEvent {
  id: string
  stationId: string
  timestamp: string
  triggerType: 'manual' | 'automatic'
  cameraCount: number
  expectedCount: number
  status: 'success' | 'partial'
  /** Preserve collection-time metadata when station settings change. */
  stationSnapshot: Station
}
export interface CapturedImage {
  id: string
  captureEventId: string
  cameraId: string
  timestamp: string
  imageUrl: string
  width: number
  height: number
  fileSize: number
}
export interface CaptureSettings {
  interval: number
  format: 'PNG' | 'JPEG'
  exposure: number
  gain: number
  resolution: string
  fps: number
}
