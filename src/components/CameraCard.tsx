import { Camera as CameraIcon, VideoOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Camera } from '@/types'
export function FabricPreview({
  camera,
  className,
  imageUrl = '/fabric.svg',
}: {
  camera: Camera
  className?: string
  imageUrl?: string
}) {
  return (
    <div className={cn('fabric-preview', `fabric-${camera.previewVariant % 8}`, className)}>
      <img
        src={imageUrl}
        alt={`Ảnh vải cotton — ${camera.name}, ${camera.position}`}
        draggable={false}
      />
      <div className="preview-vignette" />
      {camera.status === 'offline' && (
        <div className="offline-overlay">
          <VideoOff />
          Camera ngoại tuyến
        </div>
      )}
    </div>
  )
}
export function CameraCard({
  camera,
  flashing,
  onOpen,
}: {
  camera: Camera
  flashing: boolean
  onOpen: () => void
}) {
  return (
    <article className={cn('camera-card', flashing && 'is-capturing')}>
      <div className="camera-heading">
        <button className="camera-name" onClick={onOpen}>
          {camera.name}
        </button>
        <span className="camera-fps">{camera.fps} FPS</span>
      </div>
      <button className="preview-button" onClick={onOpen} aria-label={`Xem ${camera.name}`}>
        <FabricPreview camera={camera} />
        {flashing && (
          <span className="capture-flash">
            <CameraIcon size={28} />
            <span>Đã chụp</span>
          </span>
        )}
      </button>
      <div className="camera-footer">
        <span>
          {camera.id} · {camera.position}
        </span>
      </div>
    </article>
  )
}
