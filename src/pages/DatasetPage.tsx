import { useState } from 'react'
import { Database, Grid2X2, List, Search, ArrowLeft, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { FabricPreview } from '@/components/CameraCard'
import { date, time } from '@/lib/utils'
import type { Camera, CapturedImage, CaptureEvent, Station } from '@/types'
export function DatasetPage({
  images,
  events,
  cameras,
  station,
  onBack,
  onEvent,
}: {
  images: CapturedImage[]
  events: CaptureEvent[]
  cameras: Camera[]
  station: Station
  onBack: () => void
  onEvent: (event: CaptureEvent) => void
}) {
  const [search, setSearch] = useState('')
  const [cameraId, setCameraId] = useState('all')
  const [stationId, setStationId] = useState('all')
  const [machine, setMachine] = useState('all')
  const [day, setDay] = useState('')
  const [view, setView] = useState<'grid' | 'table'>('grid')
  const [selected, setSelected] = useState<CapturedImage | null>(null)
  const [limit, setLimit] = useState(24)
  const eventsById = new Map(events.map((event) => [event.id, event]))
  const machines = [...new Set(events.map((event) => event.stationSnapshot.machine))]
  const filtered = images.filter((image) => {
    const event = eventsById.get(image.captureEventId)
    const localDay = new Date(image.timestamp).toLocaleDateString('en-CA')
    return (
      image.id.toLowerCase().includes(search.toLowerCase()) &&
      (cameraId === 'all' || cameraId === image.cameraId) &&
      (stationId === 'all' || event?.stationId === stationId) &&
      (machine === 'all' || machine === event?.stationSnapshot.machine) &&
      (!day || localDay === day)
    )
  })
  const selectedCamera = cameras.find((camera) => camera.id === selected?.cameraId)
  const selectedEvent = events.find((event) => event.id === selected?.captureEventId)
  const imageStation = selectedEvent?.stationSnapshot ?? station
  return (
    <>
      <div className="secondary-page-heading">
        <div>
          <h1>Kho dữ liệu hình ảnh</h1>
          <p>Duyệt hình ảnh và metadata từ các lần thu thập.</p>
        </div>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft />
          Về thu thập
        </Button>
      </div>
      <div className="dataset-filters">
        <label className="search-field">
          <Search size={15} />
          <input
            placeholder="Tìm mã ảnh hoặc sự kiện…"
            aria-label="Tìm ảnh"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <input
          type="date"
          aria-label="Lọc ngày chụp"
          value={day}
          onChange={(e) => setDay(e.target.value)}
        />
        <select
          aria-label="Lọc trạm"
          value={stationId}
          onChange={(e) => setStationId(e.target.value)}
        >
          <option value="all">Tất cả trạm</option>
          <option>{station.id}</option>
        </select>
        <select
          aria-label="Lọc camera"
          value={cameraId}
          onChange={(e) => setCameraId(e.target.value)}
        >
          <option value="all">Tất cả camera</option>
          {cameras.map((camera) => (
            <option key={camera.id}>{camera.id}</option>
          ))}
        </select>
        <select aria-label="Lọc máy" value={machine} onChange={(e) => setMachine(e.target.value)}>
          <option value="all">Tất cả máy</option>
          {machines.map((name) => (
            <option key={name}>{name}</option>
          ))}
        </select>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSearch('')
            setDay('')
            setCameraId('all')
            setStationId('all')
            setMachine('all')
          }}
        >
          Xóa lọc
        </Button>
      </div>
      <div className="section-heading">
        <div>
          <Database size={17} />
          <h2>{filtered.length} hình ảnh</h2>
          <span className="dataset-summary">/ {events.length} sự kiện trong phiên</span>
        </div>
        <div className="grid-toggle">
          <Button
            variant={view === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            aria-label="Lưới ảnh"
            aria-pressed={view === 'grid'}
            onClick={() => setView('grid')}
          >
            <Grid2X2 />
          </Button>
          <Button
            variant={view === 'table' ? 'secondary' : 'ghost'}
            size="icon"
            aria-label="Bảng ảnh"
            aria-pressed={view === 'table'}
            onClick={() => setView('table')}
          >
            <List />
          </Button>
        </div>
      </div>
      {!filtered.length ? (
        <div className="panel empty-state">
          <ImageIcon className="mx-auto mb-3" />
          Không tìm thấy ảnh phù hợp. Hãy thay đổi bộ lọc.
        </div>
      ) : view === 'grid' ? (
        <div className="dataset-grid">
          {filtered.slice(0, limit).map((image) => {
            const camera = cameras.find((item) => item.id === image.cameraId)
            return (
              camera && (
                <button className="dataset-image" key={image.id} onClick={() => setSelected(image)}>
                  <FabricPreview camera={camera} imageUrl={image.imageUrl} />
                  <div>
                    <b>{image.captureEventId}</b>
                    <span>
                      {image.cameraId}
                      <i />
                      {camera.position}
                    </span>
                    <small>
                      {date(image.timestamp)} · {time(image.timestamp)}
                    </small>
                  </div>
                </button>
              )
            )
          })}
        </div>
      ) : (
        <div className="panel table-scroll">
          <table>
            <thead>
              <tr>
                <th>Ảnh</th>
                <th>Sự kiện</th>
                <th>Camera</th>
                <th>Thời gian</th>
                <th>Kích thước</th>
                <th>Dung lượng</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, limit).map((image) => (
                <tr key={image.id} onClick={() => setSelected(image)}>
                  <td>
                    <button className="dataset-image-link" onClick={() => setSelected(image)}>
                      {image.id}
                    </button>
                  </td>
                  <td>{image.captureEventId}</td>
                  <td>{image.cameraId}</td>
                  <td>
                    {date(image.timestamp)} {time(image.timestamp)}
                  </td>
                  <td>
                    {image.width} × {image.height}
                  </td>
                  <td>{(image.fileSize / 1000000).toFixed(2)} MB</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {filtered.length > limit && (
        <div className="flex justify-center p-6">
          <Button variant="outline" onClick={() => setLimit((previous) => previous + 24)}>
            Xem thêm {Math.min(24, filtered.length - limit)} ảnh
          </Button>
        </div>
      )}
      <Dialog
        open={selected !== null}
        onOpenChange={(open) => !open && setSelected(null)}
        title={selected?.id ?? 'Chi tiết ảnh'}
        description="Ảnh thu thập · Metadata"
      >
        <div className="detail-layout">
          {selectedCamera && (
            <FabricPreview
              camera={selectedCamera}
              imageUrl={selected?.imageUrl}
              className="large-preview"
            />
          )}
          <div className="detail-info">
            <h3>Thông tin ảnh</h3>
            <dl>
              <dt>Trạm</dt>
              <dd>{imageStation.id}</dd>
              <dt>Máy</dt>
              <dd>{imageStation.machine}</dd>
              <dt>Camera</dt>
              <dd>{selected?.cameraId}</dd>
              <dt>Vị trí</dt>
              <dd>{selectedCamera?.position}</dd>
              <dt>Vải</dt>
              <dd>{imageStation.fabric}</dd>
              <dt>Kích thước</dt>
              <dd>
                {selected?.width} × {selected?.height}
              </dd>
              <dt>Dung lượng</dt>
              <dd>{((selected?.fileSize ?? 0) / 1000000).toFixed(2)} MB</dd>
              <dt>Thời gian</dt>
              <dd>{selected && time(selected.timestamp)}</dd>
            </dl>
            <Button
              className="w-full mt-6"
              variant="outline"
              onClick={() => {
                if (selectedEvent) {
                  setSelected(null)
                  onEvent(selectedEvent)
                }
              }}
            >
              Xem sự kiện chứa ảnh
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  )
}
