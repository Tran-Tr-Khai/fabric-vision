import { ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { date, time } from '@/lib/utils'
import type { CaptureEvent } from '@/types'
export function RecentCaptures({
  events,
  interval,
  filter,
  onFilter,
  onOpen,
  onViewAll,
}: {
  events: CaptureEvent[]
  interval: number
  filter: string
  onFilter: (filter: string) => void
  onOpen: (event: CaptureEvent) => void
  onViewAll: () => void
}) {
  const visible = events
    .filter((event) => filter === 'all' || event.triggerType === filter)
    .slice(0, 4)
  const totalImages = visible.reduce((total, event) => total + event.cameraCount, 0)
  const completeCount = visible.filter((event) => event.status === 'success').length
  const intervalLabel = interval < 60 ? `${interval} giây` : `${interval / 60} phút`
  return (
    <section className="panel recent-captures">
      <div className="section-heading">
        <div>
          <div>
            <h2>Lần chụp gần đây</h2>
            <p className="capture-insight">
              {visible.length} lần chụp · {totalImages} ảnh ·{' '}
              {completeCount === visible.length ? 'Tất cả hoàn tất' : `${completeCount} hoàn tất`}
              {' · '}Chu kỳ {intervalLabel}
            </p>
          </div>
        </div>
        <div>
          <Button variant="ghost" size="sm" className="text-blue-400" onClick={onViewAll}>
            Xem tất cả
            <ArrowUpRight size={13} />
          </Button>
          <select
            aria-label="Lọc loại chụp"
            value={filter}
            onChange={(event) => onFilter(event.target.value)}
          >
            <option value="all">Tất cả sự kiện</option>
            <option value="automatic">Tự động</option>
            <option value="manual">Thủ công</option>
          </select>
        </div>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Lần chụp</th>
              <th>Thời gian</th>
              <th>Chế độ</th>
              <th>Độ phủ camera</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((event) => (
              <tr key={event.id} onClick={() => onOpen(event)}>
                <td>
                  <span className="event-cell">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onOpen(event)
                      }}
                    >
                      {event.id}
                    </button>
                  </span>
                </td>
                <td>
                  <span className="event-time">{time(event.timestamp)}</span>
                  <span className="event-date">{date(event.timestamp)}</span>
                </td>
                <td>
                  <span className={`capture-mode-tag ${event.triggerType}`}>
                    {event.triggerType === 'automatic' ? 'Tự động' : 'Thủ công'}
                  </span>
                </td>
                <td>
                  <span className="camera-coverage">
                    <b>
                      {event.cameraCount}/{event.expectedCount}
                    </b>
                    <span>{event.status === 'success' ? 'Đủ camera' : 'Thiếu camera'}</span>
                  </span>
                </td>
                <td>
                  <span className={`badge ${event.status === 'success' ? 'green' : 'amber'}`}>
                    {event.status === 'success' ? 'Thành công' : 'Chưa đầy đủ'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!visible.length && <div className="empty-state">Chưa có sự kiện phù hợp với bộ lọc.</div>}
      </div>
    </section>
  )
}
