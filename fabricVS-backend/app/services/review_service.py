from fastapi import HTTPException

from app.database.connection import get_connection
from app.schemas.review import ImageReviewUpsert


def upsert_review(image_id: str, payload: ImageReviewUpsert) -> dict:
    with get_connection() as connection:
        exists = connection.execute("SELECT 1 FROM captured_images WHERE id = ?", (image_id,)).fetchone()
        if exists is None:
            raise HTTPException(status_code=404, detail="Image not found.")
        connection.execute(
            """INSERT INTO image_reviews (image_id, label, defect_type, notes, reviewed)
               VALUES (?, ?, ?, ?, ?)
               ON CONFLICT(image_id) DO UPDATE SET
                   label = excluded.label,
                   defect_type = excluded.defect_type,
                   notes = excluded.notes,
                   reviewed = excluded.reviewed,
                   updated_at = CURRENT_TIMESTAMP""",
            (image_id, payload.label, payload.defect_type, payload.notes, int(payload.reviewed)),
        )
        row = connection.execute("SELECT * FROM image_reviews WHERE image_id = ?", (image_id,)).fetchone()
    return dict(row)


def get_review(image_id: str) -> dict:
    with get_connection() as connection:
        row = connection.execute("SELECT * FROM image_reviews WHERE image_id = ?", (image_id,)).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Review not found.")
    return dict(row)
