from collections.abc import Iterable

from app.cameras.worker import CameraWorker, Frame


class CameraManager:
    """Registry of camera workers keyed by the application's camera ID."""

    def __init__(self) -> None:
        self._workers: dict[str, CameraWorker] = {}

    def configure(self, *, camera_id: str, device_index: int, resolution: str, fps: int) -> CameraWorker:
        worker = self._workers.get(camera_id)
        if worker and (worker.device_index, worker.resolution, worker.fps) == (device_index, resolution, fps):
            return worker
        if worker:
            worker.disconnect()
        worker = CameraWorker(camera_id, device_index, resolution, fps)
        self._workers[camera_id] = worker
        return worker

    def remove(self, camera_id: str) -> None:
        worker = self._workers.pop(camera_id, None)
        if worker:
            worker.disconnect()

    def disconnect_all(self) -> None:
        for worker in self._workers.values():
            worker.disconnect()
        self._workers.clear()

    def capture(self, camera_id: str) -> Frame:
        worker = self._workers.get(camera_id)
        if worker is None:
            raise KeyError(f"Camera {camera_id} is not configured.")
        return worker.capture_frame()

    def connect(self, camera_id: str) -> None:
        worker = self._workers.get(camera_id)
        if worker is None:
            raise KeyError(f"Camera {camera_id} is not configured.")
        worker.connect()

    def configured_ids(self) -> Iterable[str]:
        return self._workers.keys()
