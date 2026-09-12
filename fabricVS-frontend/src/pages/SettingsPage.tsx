import { useState } from 'react'
import { Camera, Factory, Save, SlidersHorizontal, Timer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { CaptureSettings, Station } from '@/types'
import { useLanguage } from '@/lib/i18n'
import { CameraSetup } from '@/components/CameraSetup'
import type { Camera as CameraRecord } from '@/types'

const qualityPresets = [
  { id: 'low', label: 'Thấp', resolution: '640x480', fps: 15 },
  { id: 'standard', label: 'Tiêu chuẩn', resolution: '1280x720', fps: 30 },
  { id: 'high', label: 'Cao', resolution: '1920x1080', fps: 30 },
  { id: 'full-hd', label: 'Full HD', resolution: '1920x1080', fps: 60 },
] as const
export function SettingsPage({
  settings,
  station,
  collecting,
  cameras,
  onCameraConfigured,
  onSave,
}: {
  settings: CaptureSettings
  station: Station
  collecting: boolean
  cameras: CameraRecord[]
  onCameraConfigured: () => Promise<void>
  onSave: (settings: CaptureSettings, station: Station) => void | Promise<void>
}) {
  const { t } = useLanguage()
  const [draft, setDraft] = useState(settings)
  const [draftStation, setDraftStation] = useState(station)
  const currentQuality = qualityPresets.find(
    (preset) => preset.resolution === draft.resolution.replace(' × ', 'x') && preset.fps === draft.fps,
  )?.id ?? 'custom'
  return (
    <>
      <div className="secondary-page-heading">
        <div>
          <h1>{t('Cài đặt hệ thống')}</h1>
          <p>{t('Cấu hình trạm và thông số thu thập hình ảnh.')}</p>
        </div>
      </div>
      <form
        onSubmit={async (event) => {
          event.preventDefault()
          await onSave(draft, draftStation)
        }}
      >
        <fieldset disabled={collecting}>
          <section className="panel settings-frame">
            <section className="settings-section">
              <div className="settings-section-heading">
                <Camera size={17} />
                <h2>{t('Cấu hình camera')}</h2>
              </div>
              <div className="settings-section-body">
                <CameraSetup machineId={station.id} cameras={cameras} onComplete={onCameraConfigured} />
                <div className="form-grid">
                  <label className="field-label">
                    {t('Chất lượng hình ảnh')}
                    <select
                      value={currentQuality}
                      onChange={(e) => {
                        const preset = qualityPresets.find((item) => item.id === e.target.value)
                        if (preset) setDraft({ ...draft, resolution: preset.resolution, fps: preset.fps })
                      }}
                    >
                      {qualityPresets.map((preset) => <option key={preset.id} value={preset.id}>{t(preset.label)}</option>)}
                    </select>
                  </label>
                  <label className="field-label">
                    {t('Thông số hiện tại')}
                    <div className="read-field camera-quality-summary">
                      {draft.resolution.replace('x', ' × ')} · {draft.fps} FPS
                    </div>
                  </label>
                </div>
              </div>
            </section>
            <section className="settings-section">
              <div className="settings-section-heading">
                <Factory size={17} />
                <h2>{t('Cấu hình trạm')}</h2>
              </div>
              <div className="settings-section-body">
                <p className="settings-description">
                  {t('Máy')} {station.machine || station.id} · {t('Thông tin cho lần thu thập tiếp theo.')}
                </p>
                <div className="form-grid">
                  {(
                    [
                      { key: 'name', label: 'Tên máy' },
                      { key: 'machine', label: 'Máy sản xuất' },
                      { key: 'fabric', label: 'Loại vải' },
                      { key: 'roll', label: 'Mã cuộn' },
                      { key: 'operator', label: 'Người vận hành' },
                    ] as const
                  ).map((field) => (
                    <label key={field.key} className="field-label">
                      {t(field.label)}
                      <input
                        required
                        maxLength={70}
                        value={draftStation[field.key]}
                        onChange={(e) =>
                          setDraftStation({ ...draftStation, [field.key]: e.target.value })
                        }
                      />
                    </label>
                  ))}
                </div>
              </div>
            </section>
            <section className="settings-section">
              <div className="settings-section-heading">
                <Timer size={17} />
                <h2>{t('Cấu hình thu thập')}</h2>
              </div>
              <div className="settings-section-body">
                <div className="form-grid">
                  <label className="field-label">
                    {t('Khoảng thời gian')}
                    <select
                      value={draft.interval}
                      onChange={(e) => setDraft({ ...draft, interval: Number(e.target.value) })}
                    >
                      <option value={10}>10 giây</option>
                      <option value={30}>30 giây</option>
                      <option value={60}>1 phút</option>
                      <option value={180}>3 phút</option>
                      <option value={300}>5 phút</option>
                    </select>
                  </label>
                  <label className="field-label">
                    {t('Định dạng ảnh')}
                    <select
                      value={draft.format}
                      onChange={(e) =>
                        setDraft({ ...draft, format: e.target.value as CaptureSettings['format'] })
                      }
                    >
                      <option>PNG</option>
                      <option>JPEG</option>
                    </select>
                  </label>
                </div>
                <p className="settings-description mb-0">
                  <SlidersHorizontal size={13} />
                  {t('Thông số áp dụng cho các lần chụp tiếp theo.')}
                </p>
              </div>
            </section>
            <div className="settings-actions">
              <span>
                {collecting
                  ? t('Dừng thu thập trước khi thay đổi cấu hình.')
                  : t('Các thay đổi chỉ được lưu trong phiên làm việc hiện tại.')}
              </span>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDraft(settings)
                  setDraftStation(station)
                }}
              >
                {t('Hủy thay đổi')}
              </Button>
              <Button type="submit">
                <Save />
                {t('Lưu cấu hình')}
              </Button>
            </div>
          </section>
        </fieldset>
      </form>
    </>
  )
}
