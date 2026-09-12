from fastapi import APIRouter, status

from app.schemas.capture import CaptureSettingsResponse, CaptureSettingsUpdate
from app.schemas.machine import MachineCreate, MachineResponse, MachineUpdate
from app.services import capture_service, machine_service

router = APIRouter(prefix="/api/machines", tags=["machines"])


@router.get("", response_model=list[MachineResponse])
def list_machines() -> list[dict]:
    return machine_service.list_machines()


@router.post("", response_model=MachineResponse, status_code=status.HTTP_201_CREATED)
def create_machine(payload: MachineCreate) -> dict:
    return machine_service.create_machine(payload)


@router.get("/{machine_id}", response_model=MachineResponse)
def get_machine(machine_id: str) -> dict:
    return machine_service.get_machine(machine_id)


@router.patch("/{machine_id}", response_model=MachineResponse)
def update_machine(machine_id: str, payload: MachineUpdate) -> dict:
    return machine_service.update_machine(machine_id, payload)


@router.get("/{machine_id}/settings", response_model=CaptureSettingsResponse)
def get_settings(machine_id: str) -> dict:
    return capture_service.get_settings(machine_id)


@router.put("/{machine_id}/settings", response_model=CaptureSettingsResponse)
def update_settings(machine_id: str, payload: CaptureSettingsUpdate) -> dict:
    return capture_service.update_settings(machine_id, payload)
