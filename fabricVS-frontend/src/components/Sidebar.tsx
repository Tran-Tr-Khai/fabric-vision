import { Aperture, Camera, Database, LayoutDashboard, Settings2, Tags } from 'lucide-react'
import type { Page } from '@/types'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/lib/i18n'
const items = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'capture', label: 'Data Collection', icon: Camera },
  { id: 'dataset', label: 'Dataset', icon: Database },
  { id: 'labeling', label: 'Gắn nhãn', icon: Tags },
  { id: 'settings', label: 'Settings', icon: Settings2 },
] as const
export function Sidebar({
  page,
  cameraCount,
  onNavigate,
}: {
  page: Page
  cameraCount: number
  onNavigate: (page: Page) => void
}) {
  const { t } = useLanguage()
  return (
    <aside className="sidebar">
      <a className="brand" href="#capture" onClick={() => onNavigate('capture')}>
        <span className="brand-icon">
          <Aperture size={23} />
        </span>
        <div>
          Fabric Vision<span>DATA COLLECTION SYSTEM</span>
        </div>
      </a>
      <nav aria-label="Điều hướng chính">
        {items.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            aria-current={page === id ? 'page' : undefined}
            onClick={() => onNavigate(id)}
            className={cn('nav-item', page === id && 'active')}
          >
            <Icon size={18} />
            {t(label)}
            {id === 'capture' && <span className="nav-count">{cameraCount}</span>}
          </button>
        ))}
      </nav>
    </aside>
  )
}
