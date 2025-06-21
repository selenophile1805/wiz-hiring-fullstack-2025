from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import List, Optional
from datetime import datetime

class EventBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1, max_length=1000)
    creator_name: str = Field(..., min_length=1, max_length=100)
    creator_email: EmailStr

class EventCreate(EventBase):
    pass

class Event(EventBase):
    id: str
    created_at: datetime
    updated_at: datetime

class TimeSlotBase(BaseModel):
    start_time: datetime
    end_time: datetime
    max_bookings: int = Field(..., ge=1, le=100)

    @field_validator('start_time', 'end_time', mode='before')
    @classmethod
    def parse_datetime(cls, v):
        if isinstance(v, str):
            return datetime.fromisoformat(v.replace('Z', '+00:00'))
        return v

class TimeSlotCreate(TimeSlotBase):
    pass

class TimeSlot(TimeSlotBase):
    id: str
    event_id: str
    status: str = "available"
    created_at: datetime
    current_bookings: int = 0

class BookingBase(BaseModel):
    event_id: str
    time_slot_id: str
    attendee_name: str = Field(..., min_length=1, max_length=100)
    attendee_email: EmailStr

class BookingCreate(BookingBase):
    pass


class EventForBooking(BaseModel):
    title: str
    creator_name: str
    description: Optional[str] = None

class TimeSlotForBooking(BaseModel):
    start_time: datetime
    end_time: datetime

class Booking(BookingBase):
    id: str
    created_at: datetime
    events: EventForBooking
    time_slots: TimeSlotForBooking


class BookingWithDetails(BookingBase):
    id: str
    created_at: datetime
    event_title: Optional[str] = None
    slot_start_time: Optional[datetime] = None
    slot_end_time: Optional[datetime] = None

class EventWithSlots(Event):
    time_slots: List[TimeSlot] = []

class BookingResponse(BaseModel):
    success: bool
    message: str
    booking: Optional[BookingWithDetails] = None 