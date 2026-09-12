from fastapi import APIRouter, Depends, Response, status
from fastapi.responses import StreamingResponse

from app.cameras.detector import find_usb_cameras
from app.cameras.manager import CameraManager
from app.main_dependencies import get_camera_manager
from app.schemas.camera import CameraCreate, CameraResponse, CameraUpdate, UsbDeviceResponse
from app.services import camera_service
from app.services.live_stream_service import mjpeg_frames

router = APIRouter(prefix="/api/cameras", tags=["cameras"])


@router.get("/devices", response_model=list[UsbDeviceResponse])
def list_usb_devices() -> list[dict]:
    return [{"device_index": index, "name": f"USB Camera {index}"} for index in find_usb_cameras()]


@router.get("", response_model=list[CameraResponse])
def list_cameras(machine_id: str | None = None) -> list[dict]:
    return camera_service.list_cameras(machine_id)


@router.post("", response_model=CameraResponse, status_code=status.HTTP_201_CREATED)
def create_camera(payload: CameraCreate, manager: CameraManager = Depends(get_camera_manager)) -> dict:
    return camera_service.create_camera(payload, manager)


@router.get("/{camera_id}", response_model=CameraResponse)
def get_camera(camera_id: str) -> dict:
    return camera_service.get_camera(camera_id)


@router.patch("/{camera_id}", response_model=CameraResponse)
def update_camera(camera_id: str, payload: CameraUpdate, manager: CameraManager = Depends(get_camera_manager)) -> dict:
    return camera_service.update_camera(camera_id, payload, manager)


@router.delete("/{camera_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_camera(camera_id: str, manager: CameraManager = Depends(get_camera_manager)) -> Response:
    camera_service.delete_camera(camera_id, manager)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/{camera_id}/connect", response_model=CameraResponse)
def connect_camera(camera_id: str, manager: CameraManager = Depends(get_camera_manager)) -> dict:
    return camera_service.connect_camera(camera_id, manager)


@router.get("/{camera_id}/stream")
def stream_camera(camera_id: str, manager: CameraManager = Depends(get_camera_manager)) -> StreamingResponse:
    camera = camera_service.get_camera(camera_id)
    if camera["status"] != "online":
        return Response(status_code=status.HTTP_409_CONFLICT, content="Camera is offline.")
    return StreamingResponse(
        mjpeg_frames(camera, manager),
        media_type="multipart/x-mixed-replace; boundary=frame",
        headers={"Cache-Control": "no-cache, no-store"},
    )
