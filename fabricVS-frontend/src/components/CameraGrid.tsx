import { Grid2X2, LayoutGrid } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CameraCard } from './CameraCard'
import type { Camera } from '@/types'
import { useLanguage } from '@/lib/i18n'
export function CameraGrid({
  cameras,
  flashing,
  onOpen,
  columns,
  onColumns,
}: {
  cameras: Camera[]
  flashing: string[]
  onOpen: (camera: Camera) => void
  columns: number
  onColumns: (columns: number) => void
}) {
  const { t } = useLanguage()
  return (
    <section className="camera-section" aria-label={t('Camera trực tiếp')}>
      <div className="section-heading">
        <div>
          <h2>{t('Camera trực tiếp')}</h2>
          <span className="camera-total">{cameras.length} {t('camera')}</span>
        </div>
        <div className="grid-toggle">
          <Button
            variant={columns === 4 ? 'secondary' : 'ghost'}
            size="icon"
            aria-label={t('Hiển thị 4 cột')}
            aria-pressed={columns === 4}
            onClick={() => onColumns(4)}
          >
            <LayoutGrid />
          </Button>
          <Button
            variant={columns === 2 ? 'secondary' : 'ghost'}
            size="icon"
            aria-label={t('Hiển thị 2 cột')}
            aria-pressed={columns === 2}
            onClick={() => onColumns(2)}
          >
            <Grid2X2 />
          </Button>
        </div>
      </div>
      <div className={`camera-grid columns-${columns}`}>
        {cameras.map((camera) => (
          <CameraCard
            key={camera.id}
            camera={camera}
            flashing={flashing.includes(camera.id)}
            onOpen={() => onOpen(camera)}
          />
        ))}
      </div>
    </section>
  )
}
