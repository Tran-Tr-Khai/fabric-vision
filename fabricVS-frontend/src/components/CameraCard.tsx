import { Camera as CameraIcon, VideoOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/lib/i18n'
import type { Camera } from '@/types'
export function FabricPreview({
  camera,
  className,
  imageUrl,
}: {
  camera: Camera
  className?: string
  imageUrl?: string
}) {
  const { t } = useLanguage()
  return (
    <div className={cn('fabric-preview', camera.status === 'offline' && `fabric-${camera.previewVariant % 8}`, className)}>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={`${t('Ảnh vải cotton')} — ${camera.name}, ${t(camera.position)}`}
          draggable={false}
        />
      ) : (
        <span className="camera-no-image">{t('Chưa có ảnh chụp')}</span>
      )}
      <div className="preview-vignette" />
      {camera.status === 'offline' && (
        <div className="offline-overlay">
          <VideoOff />
          {t('Camera ngoại tuyến')}
        </div>
      )}
    </div>
  )
}
export function CameraCard({
  camera,
  flashing,
  imageUrl,
  onOpen,
}: {
  camera: Camera
  flashing: boolean
  imageUrl?: string
  onOpen: () => void
}) {
  const { t } = useLanguage()
  return (
    <article className={cn('camera-card', flashing && 'is-capturing')}>
      <div className="camera-heading">
        <button className="camera-name" onClick={onOpen}>
          {camera.name}
        </button>
        <span className="camera-fps">{camera.fps} FPS</span>
      </div>
      <button className="preview-button" onClick={onOpen} aria-label={`${t('Xem ảnh')} ${camera.name}`}>
        <FabricPreview camera={camera} imageUrl={imageUrl} />
        {flashing && (
          <span className="capture-flash">
            <CameraIcon size={28} />
            <span>{t('Đã chụp')}</span>
          </span>
        )}
      </button>
      <div className="camera-footer">
        <span>
          {camera.id} · {t(camera.position)}
        </span>
      </div>
    </article>
  )
}
