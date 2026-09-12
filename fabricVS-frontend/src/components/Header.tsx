import { Bell, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Language } from '@/lib/i18n'
export function Header({
  onNotifications,
  theme,
  onToggleTheme,
  language,
  onToggleLanguage,
}: {
  onNotifications: () => void
  theme: 'dark' | 'light'
  onToggleTheme: () => void
  language: Language
  onToggleLanguage: () => void
}) {
  return (
    <header className="top-header">
      <div className="header-right">
        <Button
          variant="ghost"
          size="sm"
          className="language-toggle"
          aria-label={language === 'vi' ? 'Switch to English' : 'Chuyển sang tiếng Việt'}
          onClick={onToggleLanguage}
        >
          {language === 'vi' ? 'EN' : 'VI'}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="theme-toggle"
          aria-label={theme === 'dark' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
          title={theme === 'dark' ? 'Giao diện sáng' : 'Giao diện tối'}
          onClick={onToggleTheme}
        >
          {theme === 'dark' ? <Sun /> : <Moon />}
        </Button>
        <Button variant="ghost" size="icon" aria-label="Thông báo" onClick={onNotifications}>
          <Bell />
        </Button>
        <div className="avatar small">KT</div>
      </div>
    </header>
  )
}
