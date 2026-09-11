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
import type {
  Camera,
  CapturedImage,
  CaptureEvent,
  DefectType,
  ImageLabel,
  ImageReview,
} from '@/types'

const labels: { value: ImageLabel; label: string; hint: string }[] = [
  { value: 'normal', label: 'Normal', hint: 'Ảnh đạt yêu cầu' },
  { value: 'defect', label: 'Defect', hint: 'Có lỗi rõ ràng' },
  { value: 'suspected', label: 'Suspected Defect', hint: 'Cần kiểm tra thêm' },
  { value: 'unclear', label: 'Unclear', hint: 'Ảnh không đủ rõ' },
]

const defectTypes: { value: DefectType; label: string }[] = [
  { value: 'hole', label: 'Hole' },
  { value: 'stain', label: 'Stain' },
  { value: 'broken-yarn', label: 'Broken yarn' },
  { value: 'missing-yarn', label: 'Missing yarn' },
  { value: 'slub', label: 'Slub' },
  { value: 'wrinkle', label: 'Wrinkle' },
  { value: 'other', label: 'Other' },
]

const labelNames: Record<ImageLabel, string> = {
  normal: 'Normal',
  defect: 'Defect',
  suspected: 'Suspected Defect',
  unclear: 'Unclear',
}

function ReviewBadge({ review }: { review?: ImageReview }) {
  if (!review?.label) return <span className="review-badge pending">Chờ review</span>
  return <span className={`review-badge ${review.label}`}>{labelNames[review.label]}</span>
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
      title={`Review ảnh · ${camera.id}`}
      description={`${image.captureEventId} · ${date(image.timestamp)} ${time(image.timestamp)}`}
      className="label-dialog"
    >
      <div className="label-detail">
        <section className="label-image-stage">
          <FabricPreview camera={camera} imageUrl={image.imageUrl} className="label-large-image" />
          <div className="label-image-caption">
            <span>
              {camera.name} · {camera.position}
            </span>
            <span>
              {image.width} × {image.height}
            </span>
          </div>
          <div className="label-metadata">
            <span>
              <b>Capture Event</b>
              {event.id}
            </span>
            <span>
              <b>Station</b>
              {event.stationId}
            </span>
            <span>
              <b>Camera</b>
              {camera.id}
            </span>
            <span>
              <b>Timestamp</b>
              {date(image.timestamp)} {time(image.timestamp)}
            </span>
            <span>
              <b>Machine</b>
              {event.stationSnapshot.machine}
            </span>
            <span>
              <b>Roll</b>
              {event.stationSnapshot.roll}
            </span>
            <span>
              <b>Capture mode</b>
              {event.triggerType === 'automatic' ? 'Tự động' : 'Thủ công'}
            </span>
          </div>
        </section>

        <aside className="label-decision">
          <div className="label-step">
            <span>01</span>
            <div>
              <b>Quyết định nhãn</b>
              <small>Chọn đánh giá phù hợp cho ảnh.</small>
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
                  <b>{item.label}</b>
                  <small>{item.hint}</small>
                </span>
              </button>
            ))}
          </div>

          {label === 'defect' && (
            <div className="defect-section">
              <div className="label-step">
                <span>02</span>
                <div>
                  <b>Loại lỗi</b>
                  <small>Chọn loại lỗi quan sát được.</small>
                </div>
              </div>
              <div className="defect-options">
                {defectTypes.map((item) => (
                  <button
                    key={item.value}
                    className={defectType === item.value ? 'selected' : ''}
                    onClick={() => setDefectType(item.value)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <label className="label-notes">
            Ghi chú
            <textarea
              rows={3}
              placeholder="Thêm ghi chú cho ảnh này…"
              value={notes}
              onChange={(input) => setNotes(input.target.value)}
            />
          </label>
          <div className="label-primary-actions">
            <Button variant="outline" disabled={!canSave} onClick={() => persist(false)}>
              <Tags />
              Lưu nhãn
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
              Đánh dấu đã review
            </Button>
          </div>
        </aside>
      </div>
      <div className="label-navigation">
        <span>
          {currentIndex + 1} / {images.length} ảnh
        </span>
        <div>
          <Button
            variant="ghost"
            disabled={!previous}
            onClick={() => previous && onSelect(previous)}
          >
            <ArrowLeft />
            Trước
          </Button>
          <Button variant="ghost" disabled={!next} onClick={() => next && onSelect(next)}>
            <SkipForward />
            Bỏ qua
          </Button>
          <Button variant="outline" disabled={!next} onClick={() => next && onSelect(next)}>
            Tiếp
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
          <h1>Gắn nhãn</h1>
          <p>Review và gắn nhãn ảnh trước khi đưa vào dataset.</p>
        </div>
        {eventScope && (
          <div className="event-scope">
            <span>Đang review sự kiện</span>
            <b>{eventScope}</b>
            <Button variant="ghost" size="sm" onClick={onClearScope}>
              Xem tất cả ảnh
            </Button>
          </div>
        )}
      </div>
      <div className="label-summary">
        <div>
          <Clock3 />
          <span>
            Chờ review<b>{images.length - reviewedCount}</b>
          </span>
        </div>
        <div>
          <CheckCircle2 />
          <span>
            Đã review<b>{reviewedCount}</b>
          </span>
        </div>
        <div>
          <Check />
          <span>
            Normal<b>{normalCount}</b>
          </span>
        </div>
        <div>
          <AlertTriangle />
          <span>
            Defect<b>{defectCount}</b>
          </span>
        </div>
      </div>
      <div className="label-toolbar">
        <label>
          <Search />
          <input
            aria-label="Tìm ảnh cần review"
            placeholder="Tìm ảnh, event hoặc camera…"
            value={query}
            onChange={(input) => setQuery(input.target.value)}
          />
        </label>
        <div className="label-filter">
          <button className={status === 'all' ? 'active' : ''} onClick={() => setStatus('all')}>
            Tất cả
          </button>
          <button
            className={status === 'pending' ? 'active' : ''}
            onClick={() => setStatus('pending')}
          >
            Chờ review
          </button>
          <button
            className={status === 'reviewed' ? 'active' : ''}
            onClick={() => setStatus('reviewed')}
          >
            Đã review
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
                      {camera.id} · {camera.position}
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
          Không có ảnh phù hợp với bộ lọc.
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
