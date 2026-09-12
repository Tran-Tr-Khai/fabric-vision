import time
from collections.abc import Iterator

import cv2

from app.cameras.manager import CameraManager


def mjpeg_frames(camera: dict, manager: CameraManager, fps: int = 10) -> Iterator[bytes]:
    """Yield a browser-compatible MJPEG stream from an already configured USB camera."""
    manager.configure(
        camera_id=camera["id"],
        device_index=camera["device_index"],
        resolution=camera["resolution"],
        fps=camera["fps"],
    )
    frame_interval = 1 / max(1, min(fps, camera["fps"]))
    while True:
        frame = manager.capture(camera["id"])
        encoded, image = cv2.imencode(".jpg", frame.data, [cv2.IMWRITE_JPEG_QUALITY, 85])
        if not encoded:
            raise RuntimeError("Could not encode camera frame.")
        yield b"--frame\r\nContent-Type: image/jpeg\r\n\r\n" + image.tobytes() + b"\r\n"
        time.sleep(frame_interval)
