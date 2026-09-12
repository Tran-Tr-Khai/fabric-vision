import { Camera, Play, Square, Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/i18n'
export function CaptureControls({
  collecting,
  onCapture,
  onStop,
  onSettings,
}: {
  collecting: boolean
  onCapture: () => void
  onStop: () => void
  onSettings: () => void
}) {
  const { t } = useLanguage()
  return (
    <div className="capture-controls">
      <Button onClick={onCapture} className="main-capture">
        <Camera />
        {t('Chụp toàn trạm')}
      </Button>
      <Button variant="ghost" onClick={onStop} disabled={!collecting}>
        <Square size={14} />
        {t('Dừng')}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10"
        onClick={onSettings}
        aria-label={t('Cài đặt thu thập')}
      >
        <Settings2 size={18} />
      </Button>
    </div>
  )
}
export function StartCaptureButton({
  collecting,
  onStart,
  onStop,
}: {
  collecting: boolean
  onStart: () => void
  onStop: () => void
}) {
  const { t } = useLanguage()
  return (
    <Button className="w-full" onClick={collecting ? onStop : onStart}>
      {collecting ? <Square /> : <Play />}
      {collecting ? t('Dừng thu thập') : t('Bắt đầu thu thập')}
    </Button>
  )
}
