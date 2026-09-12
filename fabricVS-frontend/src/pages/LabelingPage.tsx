import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  CircleHelp,
  Clock3,
  Search,
  ShieldCheck,
  SkipForward,
  Tags,
} from 'lucide-react'
import { FabricPreview } from '@/components/CameraCard'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { cn, date, time } from '@/lib/utils'
import { useLanguage } from '@/lib/i18n'
import type {
  Camera,
  CapturedImage,
  CaptureEvent,
  DefectType,
  ImageLabel,
  ImageReview,
} from '@/types'

const labels: { value: ImageLabel; label: string; hint: string }[] = [
  { value: 'normal', label: 'Bình thường', hint: 'Ảnh đạt yêu cầu' },
  { value: 'defect', label: 'Lỗi', hint: 'Có lỗi rõ ràng' },
  { value: 'suspected', label: 'Nghi ngờ lỗi', hint: 'Cần kiểm tra thêm' },
  { value: 'unclear', label: 'Không rõ', hint: 'Ảnh không đủ rõ' },
]

const defectTypes: { value: DefectType; label: string }[] = [
  { value: 'hole', label: 'Lỗ thủng' },
  { value: 'stain', label: 'Vết bẩn' },
  { value: 'broken-yarn', label: 'Đứt sợi' },
  { value: 'missing-yarn', label: 'Thiếu sợi' },
  { value: 'slub', label: 'Nút sợi' },
  { value: 'wrinkle', label: 'Nếp nhăn' },
  { value: 'other', label: 'Khác' },
]

const labelNames: Record<ImageLabel, string> = {
  normal: 'Bình thường',
  defect: 'Lỗi',
  suspected: 'Nghi ngờ lỗi',
  unclear: 'Không rõ',
}

function ReviewBadge({ review }: { review?: ImageReview }) {
  const { t } = useLanguage()
  if (!review?.label) return <span className="review-badge pending">{t('Chờ review')}</span>
  return <span className={`review-badge ${review.label}`}>{t(labelNames[review.label])}</span>
}

function LabelDetail({
  image,
  images,
  event,
  camera,
  review,
  onSelect,
  onClose,
  onSave,
}: {
  image: CapturedImage
  images: CapturedImage[]
  event: CaptureEvent
  camera: Camera
  review?: ImageReview
  onSelect: (image: CapturedImage) => void
  onClose: () => void
  onSave: (review: ImageReview) => void
}) {
  const { t } = useLanguage()
  const [label, setLabel] = useState<ImageLabel | undefined>(review?.label)
  const [defectType, setDefectType] = useState<DefectType | undefined>(review?.defectType)
  const [notes, setNotes] = useState(review?.notes ?? '')
  const currentIndex = images.findIndex((item) => item.id === image.id)
  const previous = images[currentIndex - 1]
  const next = images[currentIndex + 1]
  const canSave = Boolean(label && (label !== 'defect' || defectType))

  function persist(reviewed: boolean) {
    if (!label) return
    onSave({
      imageId: image.id,
      label,
      defectType: label === 'defect' ? defectType : undefined,
      notes,
      reviewed,
    })
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={`${t('Review ảnh')} · ${camera.id}`}
      description={`${image.captureEventId} · ${date(image.timestamp)} ${time(image.timestamp)}`}
      className="label-dialog"
    >
      <div className="label-detail">
        <section className="label-image-stage">
          <FabricPreview camera={camera} imageUrl={image.imageUrl} className="label-large-image" />
          <div className="label-image-caption">
            <span>
              {camera.name} · {t(camera.position)}
            </span>
            <span>
              {image.width} × {image.height}
            </span>
          </div>
          <div className="label-metadata">
            <span>
              <b>{t('Sự kiện chụp')}</b>
              {event.id}
            </span>
            <span>
              <b>{t('Trạm')}</b>
              {event.stationId}
            </span>
            <span>
              <b>{t('Camera')}</b>
              {camera.id}
            </span>
            <span>
              <b>{t('Thời điểm')}</b>
              {date(image.timestamp)} {time(image.timestamp)}
            </span>
            <span>
              <b>{t('Máy')}</b>
              {event.stationSnapshot.machine}
            </span>
            <span>
              <b>{t('Cuộn')}</b>
              {event.stationSnapshot.roll}
            </span>
            <span>
              <b>{t('Chế độ chụp')}</b>
              {event.triggerType === 'automatic' ? t('Tự động') : t('Thủ công')}
            </span>
          </div>
        </section>

        <aside className="label-decision">
          <div className="label-step">
            <span>01</span>
            <div>
              <b>{t('Quyết định nhãn')}</b>
              <small>{t('Chọn đánh giá phù hợp cho ảnh.')}</small>
            </div>
          </div>
          <div className="label-options">
            {labels.map((item) => (
              <button
                key={item.value}
                className={cn(label === item.value && 'selected', item.value)}
                onClick={() => {
                  setLabel(item.value)
                  if (item.value !== 'defect') setDefectType(undefined)
                }}
              >
                <span className="label-radio">{label === item.value && <Check size={13} />}</span>
                <span>
                  <b>{t(item.label)}</b>
                  <small>{t(item.hint)}</small>
                </span>
              </button>
            ))}
          </div>

          {label === 'defect' && (
            <div className="defect-section">
              <div className="label-step">
                <span>02</span>
                <div>
                  <b>{t('Loại lỗi')}</b>
                  <small>{t('Chọn loại lỗi quan sát được.')}</small>
                </div>
              </div>
              <div className="defect-options">
                {defectTypes.map((item) => (
                  <button
                    key={item.value}
                    className={defectType === item.value ? 'selected' : ''}
                    onClick={() => setDefectType(item.value)}
                  >
                    {t(item.label)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <label className="label-notes">
            {t('Ghi chú')}
            <textarea
              rows={3}
              placeholder={t('Thêm ghi chú cho ảnh này…')}
              value={notes}
              onChange={(input) => setNotes(input.target.value)}
            />
          </label>
          <div className="label-primary-actions">
            <Button variant="outline" disabled={!canSave} onClick={() => persist(false)}>
              <Tags />
              {t('Lưu nhãn')}
            </Button>
            <Button
              disabled={!canSave}
              onClick={() => {
                persist(true)
                if (next) onSelect(next)
                else onClose()
              }}
            >
              <ShieldCheck />
              {t('Đánh dấu đã review')}
            </Button>
          </div>
        </aside>
      </div>
      <div className="label-navigation">
        <span>
            {currentIndex + 1} / {images.length} {t('ảnh')}
        </span>
        <div>
          <Button
            variant="ghost"
            disabled={!previous}
            onClick={() => previous && onSelect(previous)}
          >
            <ArrowLeft />
            {t('Trước')}
          </Button>
          <Button variant="ghost" disabled={!next} onClick={() => next && onSelect(next)}>
            <SkipForward />
            {t('Bỏ qua')}
          </Button>
          <Button variant="outline" disabled={!next} onClick={() => next && onSelect(next)}>
            {t('Tiếp')}
            <ArrowRight />
          </Button>
        </div>
      </div>
    </Dialog>
  )
}

export function LabelingPage({
  images,
  events,
  cameras,
  reviews,
  eventScope,
  onClearScope,
  onSave,
}: {
  images: CapturedImage[]
  events: CaptureEvent[]
  cameras: Camera[]
  reviews: Record<string, ImageReview>
  eventScope: string | null
  onClearScope: () => void
  onSave: (review: ImageReview) => void
}) {
  const { t } = useLanguage()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'all' | 'pending' | 'reviewed'>('all')
  const eventMap = useMemo(() => new Map(events.map((event) => [event.id, event])), [events])
  const visibleImages = images.filter((image) => {
    const review = reviews[image.id]
    return (
      (!eventScope || image.captureEventId === eventScope) &&
      (!query ||
        `${image.id} ${image.captureEventId} ${image.cameraId}`
          .toLowerCase()
          .includes(query.toLowerCase())) &&
      (status === 'all' || (status === 'reviewed' ? review?.reviewed : !review?.reviewed))
    )
  })
  const selected = images.find((image) => image.id === selectedId)
  const selectedEvent = selected && eventMap.get(selected.captureEventId)
  const selectedCamera = cameras.find((camera) => camera.id === selected?.cameraId)
  const reviewedCount = images.filter((image) => reviews[image.id]?.reviewed).length
  const normalCount = images.filter((image) => reviews[image.id]?.label === 'normal').length
  const defectCount = images.filter((image) => reviews[image.id]?.label === 'defect').length

  return (
    <>
      <div className="secondary-page-heading labeling-heading">
        <div>
          <h1>{t('Gắn nhãn')}</h1>
          <p>{t('Review và gắn nhãn ảnh trước khi đưa vào dataset.')}</p>
        </div>
        {eventScope && (
          <div className="event-scope">
            <span>{t('Đang review sự kiện')}</span>
            <b>{eventScope}</b>
            <Button variant="ghost" size="sm" onClick={onClearScope}>
              {t('Xem tất cả ảnh')}
            </Button>
          </div>
        )}
      </div>
      <div className="label-summary">
        <div>
          <Clock3 />
          <span>
            {t('Chờ review')}<b>{images.length - reviewedCount}</b>
          </span>
        </div>
        <div>
          <CheckCircle2 />
          <span>
            {t('Đã review')}<b>{reviewedCount}</b>
          </span>
        </div>
        <div>
          <Check />
          <span>
            {t('Bình thường')}<b>{normalCount}</b>
          </span>
        </div>
        <div>
          <AlertTriangle />
          <span>
            {t('Lỗi')}<b>{defectCount}</b>
          </span>
        </div>
      </div>
      <div className="label-toolbar">
        <label>
          <Search />
          <input
            aria-label={t('Tìm ảnh cần review')}
            placeholder={t('Tìm ảnh, event hoặc camera…')}
            value={query}
            onChange={(input) => setQuery(input.target.value)}
          />
        </label>
        <div className="label-filter">
          <button className={status === 'all' ? 'active' : ''} onClick={() => setStatus('all')}>
            {t('Tất cả')}
          </button>
          <button
            className={status === 'pending' ? 'active' : ''}
            onClick={() => setStatus('pending')}
          >
            {t('Chờ review')}
          </button>
          <button
            className={status === 'reviewed' ? 'active' : ''}
            onClick={() => setStatus('reviewed')}
          >
            {t('Đã review')}
          </button>
        </div>
        <span>{visibleImages.length} ảnh</span>
      </div>
      {visibleImages.length ? (
        <div className="label-grid">
          {visibleImages.map((image) => {
            const camera = cameras.find((item) => item.id === image.cameraId)
            const event = eventMap.get(image.captureEventId)
            return (
              camera &&
              event && (
                <button
                  key={image.id}
                  className="label-image-card"
                  onClick={() => setSelectedId(image.id)}
                >
                  <FabricPreview camera={camera} imageUrl={image.imageUrl} />
                  <div className="label-card-body">
                    <div>
                      <b>{image.captureEventId}</b>
                      <ReviewBadge review={reviews[image.id]} />
                    </div>
                    <span>
                      {camera.id} · {t(camera.position)}
                    </span>
                    <small>
                      {event.stationId}
                      <i />
                      {date(image.timestamp)} {time(image.timestamp)}
                    </small>
                  </div>
                </button>
              )
            )
          })}
        </div>
      ) : (
        <div className="panel empty-state">
          <CircleHelp className="mx-auto mb-3" />
          {t('Không có ảnh phù hợp với bộ lọc.')}
        </div>
      )}
      {selected && selectedEvent && selectedCamera && (
        <LabelDetail
          key={selected.id}
          image={selected}
          images={visibleImages}
          event={selectedEvent}
          camera={selectedCamera}
          review={reviews[selected.id]}
          onSelect={(image) => setSelectedId(image.id)}
          onClose={() => setSelectedId(null)}
          onSave={onSave}
        />
      )}
    </>
  )
}
