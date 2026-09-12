from threading import Event, Lock, Thread

from fastapi import HTTPException

from app.cameras.manager import CameraManager
from app.database.connection import get_connection
from app.schemas.capture import CaptureRequest
from app.services.capture_service import capture, get_settings


class CollectionService:
    """Runs one automatic collection loop per machine in the current process.

    The configured interval and collected data stay in SQLite; only the active
    thread is runtime state and is recreated when the desktop app restarts.
    """

    def __init__(self, camera_manager: CameraManager) -> None:
        self._camera_manager = camera_manager
        self._jobs: dict[str, Event] = {}
        self._lock = Lock()

    def start(self, machine_id: str) -> None:
        with self._lock:
            if machine_id in self._jobs:
                raise HTTPException(status_code=409, detail="Collection is already running.")
            self._ensure_machine(machine_id)
            stop_event = Event()
            self._jobs[machine_id] = stop_event
            self._set_machine_status(machine_id, "collecting")
            Thread(target=self._run, args=(machine_id, stop_event), daemon=True, name=f"collection-{machine_id}").start()

    def stop(self, machine_id: str) -> None:
        with self._lock:
            stop_event = self._jobs.pop(machine_id, None)
            if stop_event is None:
                raise HTTPException(status_code=409, detail="Collection is not running.")
            stop_event.set()
            self._set_machine_status(machine_id, "ready")

    def stop_all(self) -> None:
        with self._lock:
            machine_ids = list(self._jobs)
            for stop_event in self._jobs.values():
                stop_event.set()
            self._jobs.clear()
        for machine_id in machine_ids:
            self._set_machine_status(machine_id, "ready")

    def is_running(self, machine_id: str) -> bool:
        with self._lock:
            return machine_id in self._jobs

    def _run(self, machine_id: str, stop_event: Event) -> None:
        # A collection starts immediately, then repeats after the configured interval.
        while not stop_event.is_set():
            try:
                capture(machine_id, CaptureRequest(trigger_type="automatic"), self._camera_manager)
            except Exception:
                # Errors are retained in camera status/last_error; a failed cycle must
                # not terminate the whole production run.
                pass
            interval_seconds = get_settings(machine_id)["interval_seconds"]
            stop_event.wait(interval_seconds)

    @staticmethod
    def _ensure_machine(machine_id: str) -> None:
        with get_connection() as connection:
            exists = connection.execute("SELECT 1 FROM machines WHERE id = ?", (machine_id,)).fetchone()
        if exists is None:
            raise HTTPException(status_code=404, detail="Machine not found.")

    @staticmethod
    def _set_machine_status(machine_id: str, status: str) -> None:
        with get_connection() as connection:
            connection.execute(
                "UPDATE machines SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", (status, machine_id)
            )
