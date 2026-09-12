from datetime import datetime, timezone
from uuid import uuid4

from fastapi import HTTPException

from app.cameras.manager import CameraManager
from app.config.settings import settings
from app.database.connection import get_connection
from app.schemas.capture import CaptureRequest, CaptureSettingsUpdate
from app.services.camera_service import _update_status
from app.services.storage_service import save_image


def get_settings(machine_id: str) -> dict:
    with get_connection() as connection:
        row = connection.execute("SELECT * FROM capture_settings WHERE machine_id = ?", (machine_id,)).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Machine settings not found.")
    return dict(row)


def update_settings(machine_id: str, payload: CaptureSettingsUpdate) -> dict:
    with get_connection() as connection:
        cursor = connection.execute(
            """UPDATE capture_settings
               SET interval_seconds = ?, image_format = ?, jpeg_quality = ?, updated_at = CURRENT_TIMESTAMP
               WHERE machine_id = ?""",
            (payload.interval_seconds, payload.image_format, payload.jpeg_quality, machine_id),
        )
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Machine settings not found.")
    return get_settings(machine_id)


def capture(machine_id: str, request: CaptureRequest, manager: CameraManager) -> dict:
    machine = _get_machine(machine_id)
    capture_settings = get_settings(machine_id)
    cameras = _get_cameras(machine_id, request.camera_ids)
    if not cameras:
        raise HTTPException(status_code=400, detail="No enabled cameras are configured for this machine.")

    event_id = f"EV-{datetime.now():%Y%m%d-%H%M%S}-{uuid4().hex[:6].upper()}"
    captured_at = datetime.now(timezone.utc).isoformat()
    saved_images: list[dict] = []
    failures: list[str] = []

    for camera in cameras:
        manager.configure(camera_id=camera["id"], device_index=camera["device_index"], resolution=camera["resolution"], fps=camera["fps"])
        try:
            frame = manager.capture(camera["id"])
            path = save_image(
                event_id=event_id,
                camera_id=camera["id"],
                frame=frame.data,
                image_format=capture_settings["image_format"],
                jpeg_quality=capture_settings["jpeg_quality"],
            )
            saved_images.append({
                "id": f"IMG-{uuid4().hex[:16].upper()}",
                "camera_id": camera["id"],
                "file_path": str(path.relative_to(settings.capture_dir.parent)).replace("\\", "/"),
                "width": frame.width,
                "height": frame.height,
                "file_size": path.stat().st_size,
            })
            _update_status(camera["id"], "online", None)
        except (RuntimeError, OSError) as error:
            failures.append(f"{camera['id']}: {error}")
            _update_status(camera["id"], "offline", str(error))

    event_status = "success" if len(saved_images) == len(cameras) else "partial" if saved_images else "failed"
    with get_connection() as connection:
        connection.execute(
            """INSERT INTO capture_events
               (id, machine_id, captured_at, trigger_type, expected_count, camera_count, status,
                machine_code_snapshot, fabric_snapshot, roll_snapshot, operator_snapshot)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (event_id, machine_id, captured_at, request.trigger_type, len(cameras), len(saved_images), event_status,
             machine["machine_code"], machine["fabric"], machine["roll"], machine["operator"]),
        )
        for image in saved_images:
            connection.execute(
                """INSERT INTO captured_images
                   (id, capture_event_id, camera_id, captured_at, file_path, width, height, file_size)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                (image["id"], event_id, image["camera_id"], captured_at, image["file_path"],
                 image["width"], image["height"], image["file_size"]),
            )
    return {"event": get_event(event_id), "images": saved_images, "failures": failures}


def list_events(machine_id: str, limit: int = 50) -> list[dict]:
    _purge_missing_images()
    with get_connection() as connection:
        return [dict(row) for row in connection.execute(
            "SELECT * FROM capture_events WHERE machine_id = ? ORDER BY captured_at DESC LIMIT ?", (machine_id, limit)
        )]


def get_event(event_id: str) -> dict:
    with get_connection() as connection:
        row = connection.execute("SELECT * FROM capture_events WHERE id = ?", (event_id,)).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Capture event not found.")
    return dict(row)


def list_images(event_id: str) -> list[dict]:
    _purge_missing_images()
    with get_connection() as connection:
        images = [dict(row) for row in connection.execute(
            "SELECT * FROM captured_images WHERE capture_event_id = ? ORDER BY camera_id", (event_id,)
        )]
    for image in images:
        image["image_url"] = f"/{image['file_path']}"
    return images


def _purge_missing_images() -> None:
    """Remove database records whose image files were removed from disk.

    Captures are stored as files, while SQLite only stores their metadata.
    This keeps both stores in sync when image files are removed manually.
    """
    with get_connection() as connection:
        image_rows = connection.execute("SELECT id, file_path FROM captured_images").fetchall()
        missing_ids = [
            row["id"]
            for row in image_rows
            if not (settings.capture_dir.parent / row["file_path"]).is_file()
        ]
        if not missing_ids:
            return

        placeholders = ", ".join("?" for _ in missing_ids)
        connection.execute(f"DELETE FROM captured_images WHERE id IN ({placeholders})", missing_ids)
        connection.execute(
            """DELETE FROM capture_events
               WHERE status != 'failed'
                 AND id NOT IN (SELECT DISTINCT capture_event_id FROM captured_images)"""
        )


def _get_machine(machine_id: str) -> dict:
    with get_connection() as connection:
        row = connection.execute("SELECT * FROM machines WHERE id = ?", (machine_id,)).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Machine not found.")
    return dict(row)


def _get_cameras(machine_id: str, camera_ids: list[str] | None) -> list[dict]:
    query = "SELECT * FROM cameras WHERE machine_id = ? AND enabled = 1"
    values: list[str] = [machine_id]
    if camera_ids:
        placeholders = ", ".join("?" for _ in camera_ids)
        query += f" AND id IN ({placeholders})"
        values.extend(camera_ids)
    with get_connection() as connection:
        return [dict(row) for row in connection.execute(query, values)]
