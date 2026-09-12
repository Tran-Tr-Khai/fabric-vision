from pydantic import BaseModel, Field, model_validator


class ImageReviewUpsert(BaseModel):
    label: str = Field(pattern="^(normal|defect|suspected|unclear)$")
    defect_type: str | None = Field(default=None, max_length=100)
    notes: str = Field(default="", max_length=2_000)
    reviewed: bool = False

    @model_validator(mode="after")
    def defect_requires_type(self) -> "ImageReviewUpsert":
        if self.label == "defect" and not self.defect_type:
            raise ValueError("defect_type is required when label is defect")
        return self


class ImageReviewResponse(ImageReviewUpsert):
    image_id: str
    updated_at: str
