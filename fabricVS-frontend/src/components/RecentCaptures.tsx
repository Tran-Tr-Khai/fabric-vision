import { ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { date, time } from '@/lib/utils'
import type { CaptureEvent } from '@/types'
import { useLanguage } from '@/lib/i18n'
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
  const { t } = useLanguage()
  const visible = events
    .filter((event) => filter === 'all' || event.triggerType === filter)
    .slice(0, 4)
  const totalImages = visible.reduce((total, event) => total + event.cameraCount, 0)
  const completeCount = visible.filter((event) => event.status === 'success').length
  const intervalLabel = interval < 60 ? `${interval} ${t('giây')}` : `${interval / 60} ${t('phút')}`
  return (
    <section className="panel recent-captures">
      <div className="section-heading">
        <div>
          <div>
            <h2>{t('Lần chụp gần đây')}</h2>
            <p className="capture-insight">
              {visible.length} {t('lần chụp')} · {totalImages} {t('ảnh')} ·{' '}
              {completeCount === visible.length ? t('Tất cả hoàn tất') : `${completeCount} ${t('hoàn tất')}`}
              {' · '}{t('Chu kỳ')} {intervalLabel}
            </p>
          </div>
        </div>
        <div>
          <Button variant="ghost" size="sm" className="text-blue-400" onClick={onViewAll}>
            {t('Xem tất cả')}
            <ArrowUpRight size={13} />
          </Button>
          <select
            className="text-sm"
            aria-label={t('Lọc loại chụp')}
            value={filter}
            onChange={(event) => onFilter(event.target.value)}
          >
            <option value="all">{t('Tất cả sự kiện')}</option>
            <option value="automatic">{t('Tự động')}</option>
            <option value="manual">{t('Thủ công')}</option>
          </select>
        </div>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>{t('Lần chụp')}</th>
              <th>{t('Thời gian')}</th>
              <th>{t('Chế độ')}</th>
              <th>{t('Độ phủ camera')}</th>
              <th>{t('Trạng thái')}</th>
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
                    {event.triggerType === 'automatic' ? t('Tự động') : t('Thủ công')}
                  </span>
                </td>
                <td>
                  <span className="camera-coverage">
                    <b>
                      {event.cameraCount}/{event.expectedCount}
                    </b>
                    <span>{event.status === 'success' ? t('Đủ camera') : t('Thiếu camera')}</span>
                  </span>
                </td>
                <td>
                  <span className={`badge ${event.status === 'success' ? 'green' : 'amber'}`}>
                    {event.status === 'success' ? t('Thành công') : t('Chưa đầy đủ')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!visible.length && <div className="empty-state">{t('Chưa có sự kiện phù hợp với bộ lọc.')}</div>}
      </div>
    </section>
  )
}
