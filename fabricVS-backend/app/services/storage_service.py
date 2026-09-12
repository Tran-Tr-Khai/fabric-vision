from datetime import datetime
from pathlib import Path

import cv2
import numpy as np

from app.config.settings import settings


def save_image(*, event_id: str, camera_id: str, frame: np.ndarray, image_format: str, jpeg_quality: int) -> Path:
    now = datetime.now()
    event_directory = settings.capture_dir / now.strftime("%Y") / now.strftime("%m") / now.strftime("%d") / event_id
    event_directory.mkdir(parents=True, exist_ok=True)
    extension = ".jpg" if image_format == "JPEG" else ".png"
    path = event_directory / f"{camera_id}{extension}"
    parameters = [cv2.IMWRITE_JPEG_QUALITY, jpeg_quality] if image_format == "JPEG" else []
    if not cv2.imwrite(str(path), frame, parameters):
        raise OSError(f"Could not write image to {path}")
    return path
