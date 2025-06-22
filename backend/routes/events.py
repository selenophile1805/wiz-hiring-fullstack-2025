from fastapi import APIRouter, HTTPException
from typing import List
from pydantic import BaseModel, Field
from models import Event, EventCreate, EventWithSlots, TimeSlotCreate
from services.event_service import EventService

router = APIRouter(prefix="/events", tags=["events"])

class EventCreateRequest(BaseModel):
    event: EventCreate
    time_slots: List[TimeSlotCreate] = Field(..., min_items=1, description="At least one time slot is required")

@router.post("/", response_model=EventWithSlots)
async def create_event(request: EventCreateRequest):
    if not request.time_slots:
        raise HTTPException(status_code=400, detail="At least one time slot is required")
    
    event = await EventService.create_event(request.event, request.time_slots)
    return event

@router.get("/", response_model=List[Event])
async def get_all_events():
    events = await EventService.get_all_events()
    return events

@router.get("/with-slots", response_model=List[EventWithSlots])
async def get_all_events_with_slots():
    events = await EventService.get_all_events_with_slots()
    return events

@router.get("/{event_id}", response_model=EventWithSlots)
async def get_event_by_id(event_id: str):
    event = await EventService.get_event_by_id(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

@router.put("/{event_id}", response_model=Event)
async def update_event(event_id: str, event_data: dict):
    event = await EventService.update_event(event_id, event_data)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

@router.delete("/{event_id}")
async def delete_event(event_id: str):
    success = await EventService.delete_event(event_id)
    if not success:
        raise HTTPException(status_code=404, detail="Event not found")
    return {"message": "Event deleted successfully"} 