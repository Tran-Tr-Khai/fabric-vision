import { useEffect, useState } from 'react'
import { CheckCircle2, X } from 'lucide-react'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { StationHeader } from '@/components/StationHeader'
import { CameraGrid } from '@/components/CameraGrid'
import { CameraSetup } from '@/components/CameraSetup'
import { StationInfo } from '@/components/StationInfo'
import { RecentCaptures } from '@/components/RecentCaptures'
import { CameraDetail, EventDetail } from '@/components/CaptureDetails'
import { Dialog } from '@/components/ui/dialog'
import { useCollection } from '@/hooks/useCollection'
import { useLabeling } from '@/hooks/useLabeling'
import { DatasetPage } from '@/pages/DatasetPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { LabelingPage } from '@/pages/LabelingPage'
import type { Camera, CaptureEvent, Page } from '@/types'
import { LanguageProvider, type Language } from '@/lib/i18n'
import { api } from '@/lib/api'
export default function App() {
  const collection = useCollection()
  const labeling = useLabeling()
  const [page, setPage] = useState<Page>('capture')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [columns, setColumns] = useState(2)
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
  const { station, settings, cameras, events, images, collecting, flashing, capture, start, stop, error, loading } =
    collection
  return (
    <LanguageProvider language={language}>
    <div className={`app-shell theme-${theme}${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}>
      <Sidebar
        page={page}
        cameraCount={cameras.length}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed((current) => !current)}
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
        <main className={`main-content${page === 'capture' ? ' capture-page' : ''}`}>
          {page === 'capture' && (
            <>
              {loading && <div className="panel empty-state">Đang tải dữ liệu camera…</div>}
              {!loading && error && <div className="panel empty-state">Không thể kết nối backend: {error}</div>}
              {!loading && !error && !cameras.length && (
                <CameraSetup machineId={station.id} cameras={cameras} onComplete={collection.reload} />
              )}
              {!loading && !error && cameras.length > 0 && (
                <div className="capture-layout">
                <div className="capture-workspace">
                  <CameraGrid
                    cameras={cameras}
                    images={images}
                    flashing={flashing}
                    onOpen={setSelectedCamera}
                    columns={columns}
                    onColumns={setColumns}
                    context={<StationHeader station={station} />}
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
                  onInterval={(interval) => {
                    void collection.saveSettings({ ...settings, interval }).catch((saveError) => {
                      collection.setNotice(saveError instanceof Error ? saveError.message : 'Không thể lưu khoảng thời gian.')
                    })
                  }}
                  onStart={start}
                  onStop={stop}
                  onCamera={setSelectedCamera}
                  onCapture={() => capture()}
                  onSettings={() => setPage('settings')}
                />
              </div>
              )}
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
              cameras={cameras}
              onCameraConfigured={collection.reload}
              onSave={async (nextSettings, nextStation) => {
                await collection.saveSettings(nextSettings)
                collection.setStation(nextStation)
                await Promise.all(cameras.map((camera) => api(`/cameras/${camera.id}`, {
                  method: 'PATCH',
                  body: {
                    resolution: nextSettings.resolution.replace(' × ', 'x'),
                    fps: nextSettings.fps,
                  },
                })))
                await collection.reload()
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
            {cameras.filter((camera) => camera.status === 'online').length}/{cameras.length} camera đang trực tuyến.
          </p>
          <p>
            {events.length} sự kiện · {images.length} ảnh ·{' '}
            {Object.values(labeling.reviews).filter((review) => review.reviewed).length} ảnh đã
            review. Dữ liệu được lưu bởi backend local.
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
