from app.database.connection import get_connection


SCHEMA = """
CREATE TABLE IF NOT EXISTS machines (
    id TEXT PRIMARY KEY, 
    name TEXT NOT NULL,
    machine_code TEXT NOT NULL UNIQUE,
    fabric TEXT NOT NULL DEFAULT '',
    roll TEXT NOT NULL DEFAULT '',
    operator TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'ready' CHECK (status IN ('ready', 'collecting')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
); 

CREATE TABLE IF NOT EXISTS cameras (
    id TEXT PRIMARY KEY,
    machine_id TEXT NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    position TEXT NOT NULL,
    device_index INTEGER NOT NULL CHECK (device_index >= 0),
    resolution TEXT NOT NULL DEFAULT '1280x720',
    fps INTEGER NOT NULL DEFAULT 30 CHECK (fps > 0),
    enabled INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('online', 'offline')),
    last_error TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cameras_machine_id ON cameras(machine_id);

CREATE TABLE IF NOT EXISTS capture_settings (
    machine_id TEXT PRIMARY KEY REFERENCES machines(id) ON DELETE CASCADE,
    interval_seconds INTEGER NOT NULL DEFAULT 600 CHECK (interval_seconds > 0),
    image_format TEXT NOT NULL DEFAULT 'JPEG' CHECK (image_format IN ('JPEG', 'PNG')),
    jpeg_quality INTEGER NOT NULL DEFAULT 90 CHECK (jpeg_quality BETWEEN 1 AND 100),
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS capture_events (
    id TEXT PRIMARY KEY,
    machine_id TEXT NOT NULL REFERENCES machines(id) ON DELETE RESTRICT,
    captured_at TEXT NOT NULL,
    trigger_type TEXT NOT NULL CHECK (trigger_type IN ('manual', 'automatic')),
    expected_count INTEGER NOT NULL CHECK (expected_count >= 0),
    camera_count INTEGER NOT NULL DEFAULT 0 CHECK (camera_count >= 0),
    status TEXT NOT NULL CHECK (status IN ('success', 'partial', 'failed')),
    machine_code_snapshot TEXT NOT NULL,
    fabric_snapshot TEXT NOT NULL,
    roll_snapshot TEXT NOT NULL,
    operator_snapshot TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_capture_events_machine_time
    ON capture_events(machine_id, captured_at DESC);

CREATE TABLE IF NOT EXISTS captured_images (
    id TEXT PRIMARY KEY,
    capture_event_id TEXT NOT NULL REFERENCES capture_events(id) ON DELETE CASCADE,
    camera_id TEXT NOT NULL REFERENCES cameras(id) ON DELETE RESTRICT,
    captured_at TEXT NOT NULL,
    file_path TEXT NOT NULL UNIQUE,
    width INTEGER NOT NULL CHECK (width > 0),
    height INTEGER NOT NULL CHECK (height > 0),
    file_size INTEGER NOT NULL CHECK (file_size >= 0)
);

CREATE INDEX IF NOT EXISTS idx_captured_images_event_id ON captured_images(capture_event_id);
CREATE INDEX IF NOT EXISTS idx_captured_images_camera_time
    ON captured_images(camera_id, captured_at DESC);

CREATE TABLE IF NOT EXISTS image_reviews (
    image_id TEXT PRIMARY KEY REFERENCES captured_images(id) ON DELETE CASCADE,
    label TEXT NOT NULL CHECK (label IN ('normal', 'defect', 'suspected', 'unclear')),
    defect_type TEXT,
    notes TEXT NOT NULL DEFAULT '',
    reviewed INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (label != 'defect' OR defect_type IS NOT NULL)
);
"""


def initialize_database() -> None:
    with get_connection() as connection:
        connection.executescript(SCHEMA)
        # Collection threads are process-local, so a restarted desktop app begins
        # in a truthful ready state instead of showing a stale "collecting" flag.
        connection.execute("UPDATE machines SET status = 'ready' WHERE status = 'collecting'")
