import { StartCaptureButton } from './CaptureControls'
import type { Camera, CaptureSettings } from '@/types'
import { useLanguage } from '@/lib/i18n'
export function StationInfo({
  cameras,
  settings,
  collecting,
  mode,
  onMode,
  onInterval,
  onStart,
  onStop,
  onCamera,
}: {
  cameras: Camera[]
  settings: CaptureSettings
  collecting: boolean
  mode: 'automatic' | 'manual'
  onMode: (mode: 'automatic' | 'manual') => void
  onInterval: (interval: number) => void
  onStart: () => void
  onStop: () => void
  onCamera: (camera: Camera) => void
}) {
  const { t } = useLanguage()
  return (
    <aside className="station-panel">
      <section className="panel station-config">
        <div className="panel-title">
          <h2>{t('Điều khiển thu thập')}</h2>
        </div>
        <div className="panel-body">
          <fieldset className="capture-mode">
            <legend>{t('Chế độ chụp')}</legend>
            <label>
              <input
                type="radio"
                name="mode"
                checked={mode === 'automatic'}
                disabled={collecting}
                onChange={() => onMode('automatic')}
              />
              <span>
                {t('Tự động')}<span>{t('Chụp theo khoảng thời gian')}</span>
              </span>
            </label>
            <label>
              <input
                type="radio"
                name="mode"
                checked={mode === 'manual'}
                disabled={collecting}
                onChange={() => onMode('manual')}
              />
              <span>
                {t('Thủ công')}<span>{t('Chụp khi nhấn nút')}</span>
              </span>
            </label>
          </fieldset>
          <label className="field-label interval-label">
            {t('Khoảng thời gian')}
            <select
              value={settings.interval}
              disabled={collecting || mode === 'manual'}
              onChange={(event) => onInterval(Number(event.target.value))}
            >
              <option value={10}>10 giây</option>
              <option value={30}>30 giây</option>
              <option value={60}>1 phút</option>
              <option value={180}>3 phút</option>
              <option value={300}>5 phút</option>
            </select>
          </label>
          {mode === 'automatic' ? (
            <StartCaptureButton collecting={collecting} onStart={onStart} onStop={onStop} />
          ) : (
            <div className="manual-hint">{t('Dùng “Chụp toàn trạm” hoặc nút chụp trên từng camera.')}</div>
          )}
          {collecting && <p className="capture-note">{t('Tự động chụp mỗi')} {settings.interval} giây</p>}
        </div>
      </section>
      <section className="panel camera-health">
        <div className="panel-title">
          <h2>{t('Trạng thái camera')}</h2>
          <span className="health-summary">
            {cameras.filter((camera) => camera.status === 'online').length}/{cameras.length}
          </span>
        </div>
        <div className="health-list">
          {cameras.map((camera) => (
            <button key={camera.id} onClick={() => onCamera(camera)}>
              <span className={`status-dot ${camera.status}`} />
              <b>{camera.id}</b>
              <span className="health-position">{camera.position}</span>
            </button>
          ))}
        </div>
      </section>
    </aside>
  )
}
