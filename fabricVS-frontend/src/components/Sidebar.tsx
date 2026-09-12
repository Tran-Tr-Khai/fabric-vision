import { Camera, Database, PanelLeftClose, PanelLeftOpen, Settings2, Tags } from 'lucide-react'
import type { Page } from '@/types'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/lib/i18n'
const items = [
  { id: 'capture', label: 'Thu thập dữ liệu', icon: Camera },
  { id: 'dataset', label: 'Kho dữ liệu', icon: Database },
  { id: 'labeling', label: 'Gắn nhãn', icon: Tags },
  { id: 'settings', label: 'Cài đặt', icon: Settings2 },
] as const
export function Sidebar({
  page,
  cameraCount,
  collapsed,
  onToggleCollapsed,
  onNavigate,
}: {
  page: Page
  cameraCount: number
  collapsed: boolean
  onToggleCollapsed: () => void
  onNavigate: (page: Page) => void
}) {
  const { t } = useLanguage()
  return (
    <aside className={cn('sidebar', collapsed && 'collapsed')}>
      <div className="brand">
        <a className="brand-name" href="#capture" onClick={() => onNavigate('capture')}>
          Fabric Vision
        </a>
        <button
          type="button"
          className="sidebar-toggle"
          aria-label={collapsed ? 'Mở thanh điều hướng' : 'Thu gọn thanh điều hướng'}
          title={collapsed ? 'Mở thanh điều hướng' : 'Thu gọn thanh điều hướng'}
          onClick={onToggleCollapsed}
        >
          {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
        </button>
      </div>
      <nav aria-label="Điều hướng chính">
        {items.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            aria-current={page === id ? 'page' : undefined}
            onClick={() => onNavigate(id)}
            className={cn('nav-item', page === id && 'active')}
            title={t(label)}
          >
            <Icon size={18} />
            <span className="nav-label-text">{t(label)}</span>
            {id === 'capture' && <span className="nav-count">{cameraCount}</span>}
          </button>
        ))}
      </nav>
    </aside>
  )
}
