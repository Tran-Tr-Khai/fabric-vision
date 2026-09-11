import { useEffect, useState } from 'react'
import { CheckCircle2, X } from 'lucide-react'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { StationHeader } from '@/components/StationHeader'
import { CaptureControls } from '@/components/CaptureControls'
import { CameraGrid } from '@/components/CameraGrid'
import { StationInfo } from '@/components/StationInfo'
import { RecentCaptures } from '@/components/RecentCaptures'
import { CameraDetail, EventDetail } from '@/components/CaptureDetails'
import { Dialog } from '@/components/ui/dialog'
import { useCollection } from '@/hooks/useCollection'
import { useLabeling } from '@/hooks/useLabeling'
import { DatasetPage } from '@/pages/DatasetPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { LabelingPage } from '@/pages/LabelingPage'
import type { Camera, CaptureEvent, Page } from '@/types'
import { LanguageProvider, type Language } from '@/lib/i18n'
export default function App() {
  const collection = useCollection()
  const labeling = useLabeling()
  const [page, setPage] = useState<Page>('capture')
  const [columns, setColumns] = useState(4)
  const [filter, setFilter] = useState('all')
  const [mode, setMode] = useState<'automatic' | 'manual'>('automatic')
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<CaptureEvent | null>(null)
  const [info, setInfo] = useState<'notifications' | null>(null)
  const [labelingEventId, setLabelingEventId] = useState<string | null>(null)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = window.localStorage.getItem('fabric-vision-theme')
    return saved === 'light' ? 'light' : 'dark'
  })
  const [language, setLanguage] = useState<Language>(() =>
    window.localStorage.getItem('fabric-vision-language') === 'en' ? 'en' : 'vi',
  )
  useEffect(() => {
    window.localStorage.setItem('fabric-vision-theme', theme)
    document.body.classList.remove('theme-dark', 'theme-light')
    document.body.classList.add(`theme-${theme}`)
  }, [theme])
  useEffect(() => {
    window.localStorage.setItem('fabric-vision-language', language)
    document.documentElement.lang = language
  }, [language])
  const { station, settings, cameras, events, images, collecting, flashing, capture, start, stop } =
    collection
  return (
    <LanguageProvider language={language}>
    <div className={`app-shell theme-${theme}`}>
      <Sidebar
        page={page}
        cameraCount={cameras.length}
        onNavigate={(nextPage) => {
          if (nextPage === 'labeling') setLabelingEventId(null)
          setPage(nextPage)
        }}
      />
      <div className="app-main">
        <Header
          page={page}
          onNotifications={() => setInfo('notifications')}
          theme={theme}
          onToggleTheme={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
          language={language}
          onToggleLanguage={() => setLanguage((current) => (current === 'vi' ? 'en' : 'vi'))}
        />
        <main className="main-content">
          {page === 'capture' && (
            <>
              <div className="page-top">
                <StationHeader station={station} />
                <CaptureControls
                  collecting={collecting}
                  onCapture={() => capture()}
                  onStop={stop}
                  onSettings={() => setPage('settings')}
                />
              </div>
              <div className="capture-layout">
                <div className="capture-workspace">
                  <CameraGrid
                    cameras={cameras}
                    flashing={flashing}
                    onOpen={setSelectedCamera}
                    columns={columns}
                    onColumns={setColumns}
                  />
                  <RecentCaptures
                    events={events}
                    interval={settings.interval}
                    filter={filter}
                    onFilter={setFilter}
                    onOpen={setSelectedEvent}
                    onViewAll={() => setPage('dataset')}
                  />
                </div>
                <StationInfo
                  cameras={cameras}
                  settings={settings}
                  collecting={collecting}
                  mode={mode}
                  onMode={setMode}
                  onInterval={(interval) =>
                    collection.setSettings((previous) => ({ ...previous, interval }))
                  }
                  onStart={start}
                  onStop={stop}
                  onCamera={setSelectedCamera}
                />
              </div>
            </>
          )}
          {page === 'dataset' && (
            <DatasetPage
              images={images}
              events={events}
              cameras={cameras}
              station={station}
              onBack={() => setPage('capture')}
              onEvent={setSelectedEvent}
            />
          )}
          {page === 'settings' && (
            <SettingsPage
              settings={settings}
              station={station}
              collecting={collecting}
              onSave={(nextSettings, nextStation) => {
                collection.setSettings(nextSettings)
                collection.setStation(nextStation)
                collection.setNotice('Đã lưu cấu hình cho các lần chụp tiếp theo.')
              }}
            />
          )}
          {page === 'labeling' && (
            <LabelingPage
              images={images}
              events={events}
              cameras={cameras}
              reviews={labeling.reviews}
              eventScope={labelingEventId}
              onClearScope={() => setLabelingEventId(null)}
              onSave={(review) => {
                labeling.saveReview(review)
                collection.setNotice(
                  review.reviewed ? 'Đã lưu nhãn và đánh dấu ảnh đã review.' : 'Đã lưu nhãn ảnh.',
                )
              }}
            />
          )}
          {page === 'dashboard' && (
            <DashboardPage
              station={station}
              cameraCount={cameras.length}
              imageCount={images.length}
              onCapture={() => setPage('capture')}
              onDataset={() => setPage('dataset')}
            />
          )}
        </main>
      </div>
      <CameraDetail
        camera={
          (selectedCamera && cameras.find((camera) => camera.id === selectedCamera.id)) || null
        }
        images={images}
        settings={settings}
        onClose={() => setSelectedCamera(null)}
        onCapture={capture}
        onSettings={() => {
          setSelectedCamera(null)
          setPage('settings')
        }}
      />
      <EventDetail
        key={selectedEvent?.id}
        event={selectedEvent}
        images={images}
        cameras={cameras}
        onClose={() => setSelectedEvent(null)}
      />
      <Dialog
        open={info !== null}
        onOpenChange={(open) => !open && setInfo(null)}
        title="Thông báo hệ thống"
        description="Fabric Vision · Phiên làm việc hiện tại"
      >
        <div className="p-6 text-sm leading-7 text-slate-300">
          <p className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400" />
            Tất cả {cameras.length} camera mô phỏng đã sẵn sàng.
          </p>
          <p>
            {events.length} sự kiện · {images.length} ảnh ·{' '}
            {Object.values(labeling.reviews).filter((review) => review.reviewed).length} ảnh đã
            review trong phiên. Dữ liệu được đặt lại khi tải lại trang.
          </p>
        </div>
      </Dialog>
      {collection.notice && (
        <div className="toast" role="status">
          <CheckCircle2 size={18} />
          {collection.notice}
          <button aria-label="Đóng thông báo" onClick={() => collection.setNotice('')}>
            <X size={15} />
          </button>
        </div>
      )}
    </div>
    </LanguageProvider>
  )
}
