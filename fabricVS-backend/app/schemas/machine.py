from pydantic import BaseModel, Field


class MachineCreate(BaseModel):
    id: str = Field(min_length=1, max_length=32, pattern=r"^[A-Za-z0-9_-]+$")
    name: str = Field(min_length=1, max_length=100)
    machine_code: str = Field(min_length=1, max_length=50)
    fabric: str = Field(default="", max_length=100)
    roll: str = Field(default="", max_length=100)
    operator: str = Field(default="", max_length=100)


class MachineUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    machine_code: str | None = Field(default=None, min_length=1, max_length=50)
    fabric: str | None = Field(default=None, max_length=100)
    roll: str | None = Field(default=None, max_length=100)
    operator: str | None = Field(default=None, max_length=100)


class MachineResponse(MachineCreate):
    status: str
    created_at: str
    updated_at: str
