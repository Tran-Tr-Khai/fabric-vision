from dataclasses import dataclass
from threading import Lock

import cv2
import numpy as np

from app.cameras.detector import open_device


@dataclass(frozen=True)
class Frame:
    data: np.ndarray
    width: int
    height: int


class CameraWorker:
    """Owns one OpenCV capture handle and serializes access to it."""

    def __init__(self, camera_id: str, device_index: int, resolution: str, fps: int) -> None:
        self.camera_id = camera_id
        self.device_index = device_index
        self.resolution = resolution
        self.fps = fps
        self._capture: cv2.VideoCapture | None = None
        self._lock = Lock()
        self.last_error: str | None = None

    def connect(self) -> None:
        with self._lock:
            self._connect_unlocked()
            # Opening a device is not enough: another application may own the
            # stream. Validate that this process can actually read a frame.
            self._read_frame_unlocked()

    def disconnect(self) -> None:
        if self._capture is not None:
            self._capture.release()
            self._capture = None

    def capture_frame(self) -> Frame:
        with self._lock:
            if self._capture is None or not self._capture.isOpened():
                self._connect_unlocked()
            return self._read_frame_unlocked()

    def _read_frame_unlocked(self) -> Frame:
        assert self._capture is not None
        success, frame = self._capture.read()
        if not success or frame is None:
            self.last_error = "Camera did not return a frame. Close other apps using the camera and try again."
            self.disconnect()
            raise RuntimeError(self.last_error)
        height, width = frame.shape[:2]
        return Frame(data=frame, width=width, height=height)

    def _connect_unlocked(self) -> None:
        self.disconnect()
        capture = open_device(self.device_index)
        if capture is None:
            self.last_error = f"Cannot open USB camera at index {self.device_index}."
            raise RuntimeError(self.last_error)
        width, height = self._dimensions()
        capture.set(cv2.CAP_PROP_FRAME_WIDTH, width)
        capture.set(cv2.CAP_PROP_FRAME_HEIGHT, height)
        capture.set(cv2.CAP_PROP_FPS, self.fps)
        self._capture = capture
        self.last_error = None

    def _dimensions(self) -> tuple[int, int]:
        try:
            width, height = self.resolution.lower().split("x", maxsplit=1)
            return int(width), int(height)
        except (AttributeError, ValueError):
            return 1280, 720
