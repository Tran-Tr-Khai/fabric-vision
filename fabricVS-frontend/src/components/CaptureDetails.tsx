import { useState } from 'react'
import { Camera as CameraIcon, ImageIcon, SlidersHorizontal } from 'lucide-react'
import { Dialog } from './ui/dialog'
import { Button } from './ui/button'
import { FabricPreview } from './CameraCard'
import { date, time } from '@/lib/utils'
import { useLanguage } from '@/lib/i18n'
import { assetUrl } from '@/lib/api'
import type { Camera, CapturedImage, CaptureEvent, CaptureSettings } from '@/types'
export function CameraDetail({
  camera,
  images,
  settings,
  onClose,
  onCapture,
  onSettings,
}: {
  camera: Camera | null
  images: CapturedImage[]
  settings: CaptureSettings
  onClose: () => void
  onCapture: (id: string) => void
  onSettings: () => void
}) {
  const { t } = useLanguage()
  if (!camera) return null
  const recent = images.filter((image) => image.cameraId === camera.id).slice(0, 4)
  return (
    <Dialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={`${camera.name} · ${camera.id}`}
      description={`${t(camera.position)} / ${camera.stationId} · ${t('Xem trước trực tiếp')}`}
    >
      <div className="detail-layout">
        <div>
          <FabricPreview
            camera={camera}
            className="large-preview"
            imageUrl={camera.status === 'online' ? assetUrl(`/api/cameras/${camera.id}/stream`) : recent[0]?.imageUrl}
          />
          <div className="preview-detail-caption">
            <span className="status-dot" />
            {camera.resolution} <i /> {camera.fps} FPS{' '}
            <span className="ml-auto">{t(camera.position)}</span>
          </div>
          <h3 className="detail-section-title">
            <ImageIcon size={15} />
            {t('Ảnh chụp gần đây')}
          </h3>
          <div className="detail-thumbnails">
            {recent.map((image) => (
              <div key={image.id}>
                <FabricPreview camera={camera} imageUrl={image.imageUrl} />
                <span>{time(image.timestamp)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="detail-info">
          <h3>
            <SlidersHorizontal size={16} />
            {t('Cấu hình chụp')}
          </h3>
          <dl>
            <dt>{t('Camera')}</dt>
            <dd>{camera.id}</dd>
            <dt>{t('Trạng thái')}</dt>
            <dd className="text-emerald-400">{t(camera.status)}</dd>
            <dt>{t('Vị trí')}</dt>
            <dd>{t(camera.position)}</dd>
            <dt>{t('Độ phân giải')}</dt>
            <dd>{camera.resolution}</dd>
            <dt>{t('Tốc độ')}</dt>
            <dd>{camera.fps} FPS</dd>
            <dt>{t('Độ phơi sáng')}</dt>
            <dd>{settings.exposure} ms</dd>
            <dt>{t('Độ khuếch đại')}</dt>
            <dd>{settings.gain} dB</dd>
            <dt>{t('Định dạng')}</dt>
            <dd>{settings.format}</dd>
            <dt>{t('Chu kỳ')}</dt>
            <dd>{settings.interval} {t('giây')}</dd>
          </dl>
          <Button
            onClick={() => onCapture(camera.id)}
            disabled={camera.status === 'offline'}
            className="w-full mt-6"
          >
            <CameraIcon />
            {t('Chụp ảnh')}
          </Button>
          <Button variant="outline" className="w-full mt-2" onClick={onSettings}>
            {t('Chỉnh sửa cấu hình')}
          </Button>
          <p className="mt-4 text-xs leading-5 text-slate-500">
            {t('Ảnh được thêm vào một sự kiện chụp riêng của camera này.')}
          </p>
        </div>
      </div>
    </Dialog>
  )
}
export function EventDetail({
  event,
  images,
  cameras,
  onClose,
}: {
  event: CaptureEvent | null
  images: CapturedImage[]
  cameras: Camera[]
  onClose: () => void
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const { t } = useLanguage()
  if (!event) return null
  const station = event.stationSnapshot
  const eventImages = images.filter((image) => image.captureEventId === event.id)
  const selected = eventImages.find((image) => image.id === selectedId) ?? eventImages[0]
  const camera = cameras.find((item) => item.id === selected?.cameraId)
  return (
    <Dialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={`${t('Chi tiết lần chụp')} · ${event.id}`}
      description={`${date(event.timestamp)} · ${time(event.timestamp)} · ${event.cameraCount}/${event.expectedCount} ${t('camera')} · ${event.triggerType === 'manual' ? t('Thủ công') : t('Tự động')}`}
    >
      <div className="detail-layout">
        <div>
          {camera && selected && (
            <>
              <FabricPreview
                camera={camera}
                imageUrl={selected.imageUrl}
                className="large-preview"
              />
              <div className="preview-detail-caption">
                {camera.name} <i />
                {t(camera.position)}
                <span className="ml-auto">
                  {selected.width} × {selected.height}
                </span>
              </div>
            </>
          )}
          <div className="event-thumbnails">
            {eventImages.map((image) => {
              const itemCamera = cameras.find((item) => item.id === image.cameraId)
              return (
                itemCamera && (
                  <button
                    key={image.id}
                    aria-label={`Xem ảnh ${image.cameraId}`}
                    aria-pressed={image.id === selected?.id}
                    className={image.id === selected?.id ? 'selected' : ''}
                    onClick={() => setSelectedId(image.id)}
                  >
                    <FabricPreview camera={itemCamera} imageUrl={image.imageUrl} />
                    <span>{image.cameraId}</span>
                  </button>
                )
              )
            })}
          </div>
        </div>
        <div className="detail-info">
          <h3>
            <ImageIcon size={16} />
            {t('Thông tin ảnh')}
          </h3>
          <dl>
            <dt>{t('Trạm')}</dt>
            <dd>{event.stationId}</dd>
            <dt>{t('Máy')}</dt>
            <dd>{station.machine}</dd>
            <dt>{t('Vải')}</dt>
            <dd>{station.fabric}</dd>
            <dt>{t('Cuộn')}</dt>
            <dd>{station.roll}</dd>
            <dt>{t('Người vận hành')}</dt>
            <dd>{station.operator}</dd>
            <dt>{t('Camera')}</dt>
            <dd>{selected?.cameraId}</dd>
            <dt>{t('Kích thước')}</dt>
            <dd>
              {selected?.width} × {selected?.height}
            </dd>
            <dt>{t('Dung lượng')}</dt>
            <dd>{((selected?.fileSize ?? 0) / 1000000).toFixed(2)} MB</dd>
            <dt>{t('Định dạng')}</dt>
            <dd>{selected?.id.split('.').at(-1)?.toUpperCase()}</dd>
          </dl>
          <div className="file-path">{selected?.id}</div>
          <span className={`badge ${event.status === 'success' ? 'green' : 'amber'} mt-5`}>
            {event.status === 'success' ? t('Thu thập thành công') : t('Thu thập chưa đầy đủ')}
          </span>
        </div>
      </div>
    </Dialog>
  )
}
