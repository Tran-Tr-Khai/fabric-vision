import { Box, Layers3, UserRound, Cpu } from 'lucide-react'
import type { Station } from '@/types'
export function StationHeader({ station }: { station: Station }) {
  return (
    <div className="station-header">
      <div className="station-title">
        <h1>{station.name}</h1>
      </div>
      <p>Thu thập hình ảnh vải đồng bộ từ hệ thống camera đa điểm.</p>
      <div className="station-meta">
        <span>
          <Cpu />
          Máy <b>{station.machine}</b>
        </span>
        <span>
          <Layers3 />
          Vải <b>{station.fabric}</b>
        </span>
        <span>
          <Box />
          Cuộn <b>{station.roll}</b>
        </span>
        <span>
          <UserRound />
          <b>{station.operator}</b>
        </span>
      </div>
    </div>
  )
}
