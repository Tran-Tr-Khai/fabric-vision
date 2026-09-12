import { useState } from 'react'
import { Camera, Factory, Save, SlidersHorizontal, Timer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { CaptureSettings, Station } from '@/types'
export function SettingsPage({
  settings,
  station,
  collecting,
  onSave,
}: {
  settings: CaptureSettings
  station: Station
  collecting: boolean
  onSave: (settings: CaptureSettings, station: Station) => void
}) {
  const [draft, setDraft] = useState(settings)
  const [draftStation, setDraftStation] = useState(station)
  return (
    <>
      <div className="secondary-page-heading">
        <div>
          <h1>Cài đặt hệ thống</h1>
          <p>Cấu hình trạm và thông số thu thập hình ảnh.</p>
        </div>
        <span className="badge">Cấu hình mô phỏng</span>
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          onSave(draft, draftStation)
        }}
      >
        <fieldset disabled={collecting}>
          <section className="panel settings-frame">
            <section className="settings-section">
              <div className="settings-section-heading">
                <Camera size={17} />
                <h2>Cấu hình camera</h2>
              </div>
              <div className="settings-section-body">
                <p className="settings-description">Áp dụng đồng bộ cho tất cả camera của trạm.</p>
                <div className="form-grid">
                  <label className="field-label">
                    Độ phân giải
                    <select
                      value={draft.resolution}
                      onChange={(e) => setDraft({ ...draft, resolution: e.target.value })}
                    >
                      <option>1920 × 1080</option>
                      <option>2560 × 1440</option>
                      <option>3840 × 2160</option>
                    </select>
                  </label>
                  <label className="field-label">
                    FPS
                    <select
                      value={draft.fps}
                      onChange={(e) => setDraft({ ...draft, fps: Number(e.target.value) })}
                    >
                      <option value={15}>15 FPS</option>
                      <option value={30}>30 FPS</option>
                      <option value={60}>60 FPS</option>
                    </select>
                  </label>
                  <label className="field-label">
                    Exposure (ms)
                    <input
                      type="number"
                      min="0.1"
                      max="100"
                      step="0.1"
                      required
                      value={draft.exposure}
                      onChange={(e) => setDraft({ ...draft, exposure: Number(e.target.value) })}
                    />
                  </label>
                  <label className="field-label">
                    Gain (dB)
                    <input
                      type="number"
                      min="0"
                      max="24"
                      step="0.1"
                      required
                      value={draft.gain}
                      onChange={(e) => setDraft({ ...draft, gain: Number(e.target.value) })}
                    />
                  </label>
                </div>
              </div>
            </section>
            <section className="settings-section">
              <div className="settings-section-heading">
                <Factory size={17} />
                <h2>Cấu hình trạm</h2>
              </div>
              <div className="settings-section-body">
                <p className="settings-description">
                  Trạm {station.id} · Thông tin của phiên làm việc.
                </p>
                <div className="form-grid">
                  {(
                    [
                      { key: 'name', label: 'Tên trạm' },
                      { key: 'machine', label: 'Máy sản xuất' },
                      { key: 'fabric', label: 'Loại vải' },
                      { key: 'roll', label: 'Mã cuộn' },
                      { key: 'operator', label: 'Người vận hành' },
                    ] as const
                  ).map((field) => (
                    <label key={field.key} className="field-label">
                      {field.label}
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
                <h2>Cấu hình thu thập</h2>
              </div>
              <div className="settings-section-body">
                <div className="form-grid">
                  <label className="field-label">
                    Khoảng thời gian
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
                    Định dạng ảnh
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
                  Thông số áp dụng cho các lần chụp tiếp theo.
                </p>
              </div>
            </section>
            <div className="settings-actions">
              <span>
                {collecting
                  ? 'Dừng thu thập trước khi thay đổi cấu hình.'
                  : 'Các thay đổi chỉ được lưu trong phiên làm việc hiện tại.'}
              </span>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDraft(settings)
                  setDraftStation(station)
                }}
              >
                Hủy thay đổi
              </Button>
              <Button type="submit">
                <Save />
                Lưu cấu hình
              </Button>
            </div>
          </section>
        </fieldset>
      </form>
    </>
  )
}
