import { Box, Layers3, UserRound, Cpu } from 'lucide-react'
import type { Station } from '@/types'
import { useLanguage } from '@/lib/i18n'

export function StationHeader({ station }: { station: Station }) {
  const { t } = useLanguage()

  return (
    <div className="station-header station-context" aria-label={t('Thông tin phiên làm việc')}>
      <div className="station-meta">
        <span>
          <Cpu />
          {t('Máy sản xuất')} <b>{station.machine}</b>
        </span>
        <span>
          <Layers3 />
          {t('Loại vải')} <b>{station.fabric}</b>
        </span>
        <span>
          <Box />
          {t('Mã cuộn')} <b>{station.roll}</b>
        </span>
        <span>
          <UserRound />
          {t('Người vận hành')} <b>{station.operator}</b>
        </span>
      </div>
    </div>
  )
}
