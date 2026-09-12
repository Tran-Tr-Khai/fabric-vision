# Fabric Vision Backend

FastAPI backend chạy offline cho camera USB và thu thập ảnh vải.

## Chạy local

```powershell
uv sync
uv run python run.py
```

API docs: `http://127.0.0.1:8000/docs`

## Dữ liệu local

- SQLite: `data/fabric_vision.db`
- Ảnh: `data/captures/YYYY/MM/DD/<event-id>/`

Database chỉ lưu metadata và đường dẫn ảnh. File ảnh giữ trên ổ đĩa để việc backup và truy xuất không làm database phình to.

## API chính

- `GET /api/health`
- `GET, POST /api/machines`
- `GET, POST /api/cameras`
- `GET /api/cameras/devices` — quét USB camera
- `POST /api/cameras/{camera_id}/connect`
- `POST /api/machines/{machine_id}/captures`
- `POST /api/machines/{machine_id}/collection/start`
- `POST /api/machines/{machine_id}/collection/stop`
- `PUT /api/images/{image_id}/review`
