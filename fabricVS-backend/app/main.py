from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config.settings import settings
from app.database.models import initialize_database
from app.api import cameras, captures, machines, reviews
from app.main_dependencies import camera_manager, collection_service


def create_app() -> FastAPI:
    app = FastAPI(title=settings.app_name)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(machines.router)
    app.include_router(cameras.router)
    app.include_router(captures.router)
    app.include_router(reviews.router)
    settings.capture_dir.mkdir(parents=True, exist_ok=True)
    app.mount("/captures", StaticFiles(directory=settings.capture_dir), name="captures")

    @app.on_event("startup")
    def startup() -> None:
        initialize_database()

    @app.on_event("shutdown")
    def shutdown() -> None:
        collection_service.stop_all()
        camera_manager.disconnect_all()

    @app.get("/api/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    return app


app = create_app()
