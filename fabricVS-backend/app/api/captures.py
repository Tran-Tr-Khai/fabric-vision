from fastapi import APIRouter, Depends

from app.cameras.manager import CameraManager
from app.main_dependencies import get_camera_manager, get_collection_service
from app.schemas.capture import CaptureRequest
from app.services.collection_service import CollectionService
from app.services import capture_service

router = APIRouter(prefix="/api", tags=["captures"])


@router.post("/machines/{machine_id}/captures")
def capture(machine_id: str, payload: CaptureRequest, manager: CameraManager = Depends(get_camera_manager)) -> dict:
    return capture_service.capture(machine_id, payload, manager)


@router.post("/machines/{machine_id}/collection/start")
def start_collection(machine_id: str, service: CollectionService = Depends(get_collection_service)) -> dict:
    service.start(machine_id)
    return {"machine_id": machine_id, "status": "collecting"}


@router.post("/machines/{machine_id}/collection/stop")
def stop_collection(machine_id: str, service: CollectionService = Depends(get_collection_service)) -> dict:
    service.stop(machine_id)
    return {"machine_id": machine_id, "status": "ready"}

@router.get("/machines/{machine_id}/capture-events")
def list_events(machine_id: str, limit: int = 50) -> list[dict]:
    return capture_service.list_events(machine_id, min(max(limit, 1), 200))


@router.get("/capture-events/{event_id}")
def get_event(event_id: str) -> dict:
    return capture_service.get_event(event_id)


@router.get("/capture-events/{event_id}/images")
def list_images(event_id: str) -> list[dict]:
    return capture_service.list_images(event_id)
