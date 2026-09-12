import { createContext, useContext, type ReactNode } from 'react'

export type Language = 'vi' | 'en'

const en: Record<string, string> = {
  Dashboard: 'Dashboard',
  'Data Collection': 'Data Collection',
  Dataset: 'Dataset',
  'Gắn nhãn': 'Labeling',
  Settings: 'Settings',
  'Trạm kiểm tra': 'Inspection station',
  'Thu thập hình ảnh vải đồng bộ từ hệ thống camera đa điểm.':
    'Collect synchronized fabric images from the multi-camera system.',
  'Camera trực tiếp': 'Live cameras',
  camera: 'cameras',
  'Hiển thị 4 cột': 'Show 4 columns',
  'Hiển thị 2 cột': 'Show 2 columns',
  'Chụp toàn trạm': 'Capture station',
  'Dừng thu thập': 'Stop collection',
  'Cài đặt thu thập': 'Collection settings',
  'Bắt đầu thu thập': 'Start collection',
  Dừng: 'Stop',
  'Điều khiển thu thập': 'Collection control',
  'Chế độ chụp': 'Capture mode',
  'Tự động': 'Automatic',
  'Chụp theo khoảng thời gian': 'Capture on an interval',
  'Thủ công': 'Manual',
  'Chụp khi nhấn nút': 'Capture on demand',
  'Khoảng thời gian': 'Interval',
  'Dùng “Chụp toàn trạm” hoặc nút chụp trên từng camera.':
    'Use “Capture station” or the capture button on an individual camera.',
  'Tự động chụp mỗi': 'Captures automatically every',
  'Trạng thái camera': 'Camera status',
  'Lần chụp gần đây': 'Recent captures',
  'Xem tất cả': 'View all',
  'Tất cả sự kiện': 'All events',
  'Lần chụp': 'Capture',
  'Thời gian': 'Time',
  'Chế độ': 'Mode',
  'Độ phủ camera': 'Camera coverage',
  'Trạng thái': 'Status',
  'Đủ camera': 'All cameras',
  'Thiếu camera': 'Missing cameras',
  'Thành công': 'Successful',
  'Chưa đầy đủ': 'Incomplete',
  'Kho dữ liệu hình ảnh': 'Image dataset',
  'Duyệt hình ảnh và metadata từ các lần thu thập.':
    'Browse images and metadata from collection runs.',
  'Về thu thập': 'Back to collection',
  'Tìm mã ảnh hoặc sự kiện…': 'Search image or event…',
  'Tìm ảnh': 'Search images',
  'Lọc ngày chụp': 'Filter capture date',
  'Lọc trạm': 'Filter station',
  'Tất cả trạm': 'All stations',
  'Lọc camera': 'Filter camera',
  'Tất cả camera': 'All cameras',
  'Lọc máy': 'Filter machine',
  'Tất cả máy': 'All machines',
  'Xóa lọc': 'Clear filters',
  'sự kiện trong phiên': 'events in this session',
  'Lưới ảnh': 'Image grid',
  'Bảng ảnh': 'Image table',
  'Không tìm thấy ảnh phù hợp. Hãy thay đổi bộ lọc.': 'No matching images. Adjust your filters.',
  Ảnh: 'Image',
  'Sự kiện': 'Event',
  'Kích thước': 'Dimensions',
  'Dung lượng': 'File size',
  'Xem thêm': 'Load more',
  'Thông tin ảnh': 'Image details',
  Trạm: 'Station',
  Máy: 'Machine',
  'Vị trí': 'Position',
  Vải: 'Fabric',
  'Xem sự kiện chứa ảnh': 'View capture event',
  'Review và gắn nhãn ảnh trước khi đưa vào dataset.':
    'Review and label images before adding them to the dataset.',
  'Cài đặt hệ thống': 'System settings',
  'Cấu hình trạm và thông số thu thập hình ảnh.': 'Configure the station and image collection parameters.',
  'Cấu hình mô phỏng': 'Simulation configuration',
  'Cấu hình camera': 'Camera configuration',
  'Cấu hình trạm': 'Station configuration',
  'Cấu hình thu thập': 'Collection configuration',
  'Áp dụng đồng bộ cho tất cả camera của trạm.': 'Applied consistently to all station cameras.',
  'Độ phân giải': 'Resolution',
  'Máy sản xuất': 'Production machine',
  'Loại vải': 'Fabric type',
  'Mã cuộn': 'Roll code',
  'Người vận hành': 'Operator',
  'Định dạng ảnh': 'Image format',
  'Thông số áp dụng cho các lần chụp tiếp theo.': 'These settings apply to future captures.',
  'Hủy thay đổi': 'Discard changes',
  'Lưu cấu hình': 'Save configuration',
  'Dừng thu thập trước khi thay đổi cấu hình.': 'Stop collection before changing configuration.',
  'Các thay đổi chỉ được lưu trong phiên làm việc hiện tại.':
    'Changes are saved only for the current session.',
  'Thông báo': 'Notifications',
  'Đóng thông báo': 'Close notification',
}

const LanguageContext = createContext<Language>('vi')

export function LanguageProvider({ language, children }: { language: Language; children: ReactNode }) {
  return <LanguageContext.Provider value={language}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const language = useContext(LanguageContext)
  const t = (value: string) => (language === 'en' ? en[value] ?? value : value)
  return { language, t }
}
