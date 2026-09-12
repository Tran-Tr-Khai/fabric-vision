from pydantic import BaseModel, Field


class CameraCreate(BaseModel):
    id: str = Field(min_length=1, max_length=32)
    machine_id: str = Field(min_length=1, max_length=32)
    name: str = Field(min_length=1, max_length=100)
    position: str = Field(min_length=1, max_length=100)
    device_index: int = Field(ge=0)
    resolution: str = "1280x720"
    fps: int = Field(default=30, gt=0, le=240)
    enabled: bool = True


class CameraResponse(CameraCreate):
    status: str
    last_error: str | None = None
    created_at: str
    updated_at: str

    model_config = {"from_attributes": True}


class CameraUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    position: str | None = Field(default=None, min_length=1, max_length=100)
    device_index: int | None = Field(default=None, ge=0)
    resolution: str | None = None
    fps: int | None = Field(default=None, gt=0, le=240)
    enabled: bool | None = None


class UsbDeviceResponse(BaseModel):
    device_index: int
    name: str
