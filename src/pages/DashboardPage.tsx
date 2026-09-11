import { ArrowRight, Camera, Factory, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Station } from '@/types'
export function DashboardPage({
  station,
  cameraCount,
  imageCount,
  onCapture,
  onDataset,
}: {
  station: Station
  cameraCount: number
  imageCount: number
  onCapture: () => void
  onDataset: () => void
}) {
  return (
    <>
      <div className="secondary-page-heading">
        <div>
          <div className="eyebrow">PRODUCTION WORKSPACE</div>
          <h1>Không gian làm việc</h1>
          <p>Chọn trạm để bắt đầu thu thập hình ảnh vải.</p>
        </div>
      </div>
      <div className="dashboard-station panel">
        <div className="dashboard-icon">
          <Factory size={27} />
        </div>
        <div>
          <span className="badge green">
            <span className="status-dot" />
            {station.status === 'collecting' ? 'Đang thu thập' : 'Sẵn sàng'}
          </span>
          <h2>{station.name}</h2>
          <p>
            {station.machine} · {station.fabric} · {station.roll}
          </p>
          <div className="flex gap-5 mt-4 text-xs text-slate-400">
            <span className="flex gap-2 items-center">
              <Camera size={14} />
              {cameraCount} camera
            </span>
            <span className="flex gap-2 items-center">
              <ImageIcon size={14} />
              {imageCount} ảnh trong phiên
            </span>
          </div>
        </div>
        <div className="dashboard-actions">
          <Button onClick={onCapture}>
            Mở trạm thu thập
            <ArrowRight />
          </Button>
          <Button variant="outline" onClick={onDataset}>
            Duyệt ảnh đã chụp
          </Button>
        </div>
      </div>
    </>
  )
}
