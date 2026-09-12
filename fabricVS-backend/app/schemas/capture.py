from datetime import datetime

from pydantic import BaseModel, Field


class CaptureRequest(BaseModel):
    camera_ids: list[str] | None = None
    trigger_type: str = Field(default="manual", pattern="^(manual|automatic)$")


class CaptureSettingsUpdate(BaseModel):
    interval_seconds: int = Field(ge=1)
    image_format: str = Field(default="JPEG", pattern="^(JPEG|PNG)$")
    jpeg_quality: int = Field(default=90, ge=1, le=100)


class CaptureSettingsResponse(CaptureSettingsUpdate):
    machine_id: str
    updated_at: str


class CaptureEventResponse(BaseModel):
    id: str
    machine_id: str
    captured_at: datetime
    trigger_type: str
    expected_count: int
    camera_count: int
    status: str
    machine_code_snapshot: str
    fabric_snapshot: str
    roll_snapshot: str
    operator_snapshot: str


class CapturedImageResponse(BaseModel):
    id: str
    capture_event_id: str
    camera_id: str
    captured_at: datetime
    file_path: str
    width: int
    height: int
    file_size: int
