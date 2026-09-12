from app.cameras.manager import CameraManager
from app.services.collection_service import CollectionService


camera_manager = CameraManager()
collection_service = CollectionService(camera_manager)


def get_camera_manager() -> CameraManager:
    return camera_manager


def get_collection_service() -> CollectionService:
    return collection_service
