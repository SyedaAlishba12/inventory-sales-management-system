from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, model_validator


class ActivityLogCreate(BaseModel):
    user_id: int | None = Field(default=None, gt=0)
    action: str = Field(min_length=1, max_length=100)
    entity_type: str | None = Field(default=None, max_length=50)
    entity_id: int | None = Field(default=None, gt=0)
    description: str | None = None

    @model_validator(mode="after")
    def normalize_and_validate(self) -> "ActivityLogCreate":
        self.action = self.action.strip()
        self.entity_type = self.entity_type.strip() if self.entity_type else None
        self.description = self.description.strip() if self.description else None
        if not self.action:
            raise ValueError("action must not be blank")
        if self.entity_id is not None and self.entity_type is None:
            raise ValueError("entity_type is required when entity_id is provided")
        return self


class ActivityLogRead(BaseModel):
    id: int
    user_id: int | None
    action: str
    entity_type: str | None
    entity_id: int | None
    description: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ActivityLogListResponse(BaseModel):
    items: list[ActivityLogRead]
    page: int
    page_size: int
    total: int
    total_pages: int
