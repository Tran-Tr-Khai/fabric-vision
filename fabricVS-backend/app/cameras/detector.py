"""Discovery helpers for USB cameras.

OpenCV does not expose reliable friendly device names on every Windows driver,
so the device index is the stable value persisted by this application.
"""

import cv2


def open_device(device_index: int) -> cv2.VideoCapture | None:
    """Open a Windows camera with the first supported OpenCV backend."""
    for backend in (cv2.CAP_DSHOW, cv2.CAP_MSMF, cv2.CAP_ANY):
        capture = cv2.VideoCapture(device_index, backend)
        if capture.isOpened():
            return capture
        capture.release()
    return None


def find_usb_cameras(max_devices: int = 10) -> list[int]:
    available: list[int] = []
    for device_index in range(max_devices):
        capture = open_device(device_index)
        if capture is None:
            continue
        try:
            available.append(device_index)
        finally:
            capture.release()
    return available
