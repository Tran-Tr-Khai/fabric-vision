# Fabric Vision

Frontend prototype for an industrial fabric image collection workstation. React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui-style Radix primitives, and Lucide icons.

## Chạy ứng dụng local

Mở **hai PowerShell terminal** tại thư mục gốc `fabric-vision`: một terminal chạy backend và một terminal chạy frontend.

### Terminal 1 — Backend FastAPI

```powershell
cd fabricVS-backend
uv run python run.py
```

Backend chạy tại `http://127.0.0.1:8000`.

- API docs: `http://127.0.0.1:8000/docs`
- Health check: `http://127.0.0.1:8000/api/health`

Lần đầu, `uv` tự tạo `.venv` và cài dependency khi chạy lệnh trên. Hoặc đồng bộ dependency trước:

```powershell
cd fabricVS-backend
uv sync
```

### Terminal 2 — Frontend React

```powershell
cd fabricVS-frontend
npm run dev
```

Mở URL Vite in ra trong terminal ở `http://127.0.0.1:5173`.

