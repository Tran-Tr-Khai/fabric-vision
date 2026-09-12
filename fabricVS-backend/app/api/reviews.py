from fastapi import APIRouter

from app.schemas.review import ImageReviewResponse, ImageReviewUpsert
from app.services import review_service

router = APIRouter(prefix="/api/images", tags=["reviews"])


@router.get("/{image_id}/review", response_model=ImageReviewResponse)
def get_review(image_id: str) -> dict:
    return review_service.get_review(image_id)


@router.put("/{image_id}/review", response_model=ImageReviewResponse)
def upsert_review(image_id: str, payload: ImageReviewUpsert) -> dict:
    return review_service.upsert_review(image_id, payload)
