from typing import List, Optional
from datetime import datetime
import uuid
from database import supabase
from models import Event, EventCreate, TimeSlot, TimeSlotCreate, EventWithSlots
import logging

logger = logging.getLogger(__name__)

class EventService:
    
    @staticmethod
    async def create_event(event_data: EventCreate, time_slots: List[TimeSlotCreate]) -> EventWithSlots:
        try:
            event_id = str(uuid.uuid4())
            current_time = datetime.utcnow()
            
            event_dict = {
                "id": event_id,
                "title": event_data.title,
                "description": event_data.description,
                "creator_name": event_data.creator_name,
                "creator_email": event_data.creator_email,
                "created_at": current_time.isoformat(),
                "updated_at": current_time.isoformat()
            }
            
            supabase.table("events").insert(event_dict).execute()
            
            for slot in time_slots:
                slot_dict = {
                    "id": str(uuid.uuid4()),
                    "event_id": event_id,
                    "start_time": slot.start_time.isoformat(),
                    "end_time": slot.end_time.isoformat(),
                    "max_bookings": slot.max_bookings,
                    "status": "available",
                    "current_bookings": 0,
                    "created_at": current_time.isoformat()
                }
                supabase.table("time_slots").insert(slot_dict).execute()
            
            return await EventService.get_event_by_id(event_id)
        except Exception as e:
            logger.error(f"Error in create_event: {e}")
            raise
    
    @staticmethod
    async def get_all_events() -> List[Event]:
        try:
            result = supabase.table("events").select("*").order("created_at", desc=True).execute()
            return [Event(**event) for event in result.data]
        except Exception as e:
            logger.error(f"Error in get_all_events: {e}")
            raise
    
    @staticmethod
    async def get_all_events_with_slots() -> List[EventWithSlots]:
        try:
            result = supabase.table("events").select(
                "*, time_slots(*, bookings(*))"
            ).order("created_at", desc=True).execute()
            
            for event in result.data:
                for time_slot in event.get("time_slots", []):
                    actual_bookings_count = len(time_slot.get("bookings", []))
                    stored_bookings_count = time_slot.get("current_bookings", 0)
                    
                    if actual_bookings_count != stored_bookings_count:
                        supabase.table("time_slots").update({
                            "current_bookings": actual_bookings_count
                        }).eq("id", time_slot["id"]).execute()
                        
                        time_slot["current_bookings"] = actual_bookings_count
            
            return [EventWithSlots(**event) for event in result.data]
        except Exception as e:
            logger.error(f"Error in get_all_events_with_slots: {e}")
            raise
    
    @staticmethod
    async def get_event_by_id(event_id: str) -> Optional[EventWithSlots]:
        try:
            result = supabase.table("events").select(
                "*, time_slots(*, bookings(*))"
            ).eq("id", event_id).single().execute()

            if not result.data:
                return None
            
            for time_slot in result.data.get("time_slots", []):
                actual_bookings_count = len(time_slot.get("bookings", []))
                stored_bookings_count = time_slot.get("current_bookings", 0)
                
                if actual_bookings_count != stored_bookings_count:
                    supabase.table("time_slots").update({
                        "current_bookings": actual_bookings_count
                    }).eq("id", time_slot["id"]).execute()
                    
                    time_slot["current_bookings"] = actual_bookings_count
            
            return EventWithSlots(**result.data)
        except Exception as e:
            logger.error(f"Error in get_event_by_id: {e}")
            raise
    
    @staticmethod
    async def update_event(event_id: str, event_data: dict) -> Optional[Event]:
        try:
            event_data["updated_at"] = datetime.utcnow().isoformat()
            result = supabase.table("events").update(event_data).eq("id", event_id).execute()
            
            if not result.data:
                return None
            
            return Event(**result.data[0])
        except Exception as e:
            logger.error(f"Error in update_event: {e}")
            raise
    
    @staticmethod
    async def delete_event(event_id: str) -> bool:
        try:
            supabase.table("time_slots").delete().eq("event_id", event_id).execute()
            result = supabase.table("events").delete().eq("id", event_id).execute()
            return len(result.data) > 0
        except Exception as e:
            logger.error(f"Error in delete_event: {e}")
            raise 