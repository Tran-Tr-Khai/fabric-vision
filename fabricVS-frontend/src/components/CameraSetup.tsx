import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/i18n'
import type { Camera } from '@/types'

type UsbDevice = { device_index: number; name: string }

const positions = ['Mặt trên', 'Mặt dưới', 'Khu vực trái', 'Khu vực phải', 'Mép vải', 'Góc trái', 'Góc phải', 'Tổng quan']

function nextCameraNumber(cameras: Camera[]) {
  return Math.max(0, ...cameras.map((camera) => Number(camera.id.replace(/\D/g, '')) || 0)) + 1
}

export function CameraSetup({ machineId, cameras, onComplete }: {
  machineId: string
  cameras: Camera[]
  onComplete: () => Promise<void>
}) {
  const { t } = useLanguage()
  const [devices, setDevices] = useState<UsbDevice[]>([])
  const [busyIndex, setBusyIndex] = useState<number | null>(null)
  const [message, setMessage] = useState('')

  async function scan() {
    setMessage('')
    try {
      const result = await api<UsbDevice[]>('/cameras/devices')
      setDevices(result)
      if (!result.length) setMessage(t('Không tìm thấy camera USB.'))
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t('Không thể quét camera USB.'))
    }
  }

  async function addDevice(device: UsbDevice) {
    const number = nextCameraNumber(cameras)
    const cameraId = `C${String(number).padStart(3, '0')}`
    const position = positions.find((item) => !cameras.some((camera) => camera.position === item)) ?? positions[0]
    setBusyIndex(device.device_index)
    setMessage('')
    try {
      await api('/cameras', {
        method: 'POST',
        body: {
          id: cameraId,
          machine_id: machineId,
          name: `${t('Camera')} ${String(number).padStart(2, '0')}`,
          position,
          device_index: device.device_index,
          resolution: '1280x720',
          fps: 30,
          enabled: true,
        },
      })
      await api(`/cameras/${cameraId}/connect`, { method: 'POST' })
      await onComplete()
      setMessage(t('Đã thêm camera.'))
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t('Không thể lưu cấu hình camera.'))
    } finally {
      setBusyIndex(null)
    }
  }

  async function updatePosition(camera: Camera, position: string) {
    try {
      await api(`/cameras/${camera.id}`, { method: 'PATCH', body: { position } })
      await onComplete()
      setMessage(t('Đã lưu vị trí camera.'))
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t('Không thể lưu cấu hình camera.'))
    }
  }

  return (
    <div className="camera-device-manager">
      <div className="camera-device-toolbar">
        <Button type="button" variant="outline" size="sm" onClick={() => void scan()}>
          <RefreshCw /> {t('Quét camera')}
        </Button>
      </div>

      {devices.length > 0 && (
        <div className="usb-scan-list">
          {devices
            .map((device) => (
              <button
                type="button"
                key={device.device_index}
                className="usb-device-item"
                disabled={busyIndex !== null}
                onClick={() => {
                  const configuredCamera = cameras.find((camera) => camera.deviceIndex === device.device_index)
                  setDevices([])
                  if (!configuredCamera) void addDevice(device)
                }}
              >
                <div><b>{device.name}</b><span>{t('Thiết bị')} {device.device_index}</span></div>
                <span className="usb-device-select-hint">{t('Chọn thiết bị')}</span>
              </button>
            ))}
        </div>
      )}

      {cameras.length > 0 && (
        <div className="configured-camera-list">
          {cameras.map((camera) => (
            <div key={camera.id} className="configured-camera-row">
              <div className="camera-device-identity">
                <b>{camera.name}</b>
                <span>{camera.id} · {t('Thiết bị')} {camera.deviceIndex ?? '—'}</span>
              </div>
              <label>
                <span>{t('Vị trí')}</span>
                <select value={camera.position} onChange={(event) => void updatePosition(camera, event.target.value)}>
                  {positions.map((position) => <option key={position}>{t(position)}</option>)}
                </select>
              </label>
            </div>
          ))}
        </div>
      )}
      {message && <p className="camera-device-message">{message}</p>}
    </div>
  )
}
