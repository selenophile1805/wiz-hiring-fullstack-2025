from typing import List
from datetime import datetime
import uuid
from database import supabase
from models import Booking, BookingCreate, BookingResponse, BookingWithDetails
import logging

logger = logging.getLogger(__name__)

class BookingService:
    
    @staticmethod
    async def create_booking(booking_data: BookingCreate) -> BookingResponse:
        try:
            slot_result = supabase.table("time_slots").select("*, bookings(id)").eq("id", booking_data.time_slot_id).single().execute()
            if not slot_result.data:
                return BookingResponse(success=False, message="Time slot not found.")
            
            slot = slot_result.data
            current_bookings = len(slot.get("bookings", []))
            
            if current_bookings >= slot["max_bookings"]:
                return BookingResponse(success=False, message="This time slot is completely booked.")
            
            existing_booking_check = supabase.table("bookings").select("id").eq("time_slot_id", booking_data.time_slot_id).eq("attendee_email", booking_data.attendee_email).execute()
            if existing_booking_check.data:
                raise ValueError("You have already booked this time slot.")
            
            booking_to_create = {
                "id": str(uuid.uuid4()),
                "event_id": booking_data.event_id,
                "time_slot_id": booking_data.time_slot_id,
                "attendee_name": booking_data.attendee_name,
                "attendee_email": booking_data.attendee_email,
                "created_at": datetime.utcnow().isoformat()
            }
            new_booking_result = supabase.table("bookings").insert(booking_to_create).execute()
            
            new_current_bookings = current_bookings + 1
            supabase.table("time_slots").update({"current_bookings": new_current_bookings}).eq("id", booking_data.time_slot_id).execute()
            
            event_result = supabase.table("events").select("title").eq("id", booking_data.event_id).single().execute()

            booking_with_details = {
                **new_booking_result.data[0],
                "event_title": event_result.data.get("title") if event_result.data else "N/A",
                "slot_start_time": slot.get("start_time"),
                "slot_end_time": slot.get("end_time"),
            }
            
            return BookingResponse(
                success=True,
                message="Booking successful!",
                booking=BookingWithDetails(**booking_with_details)
            )
        except Exception as e:
            logger.error(f"Error creating booking: {e}")
            raise
    
    @staticmethod
    async def get_bookings_by_email(email: str) -> List[dict]:
        try:
            bookings_result = supabase.table("bookings").select(
                "*, events!inner(*), time_slots!inner(*)"
            ).eq("attendee_email", email).order("created_at", desc=True).execute()
            
            return bookings_result.data
        except Exception as e:
            logger.error(f"Error fetching bookings by email: {e}")
            raise
    
    @staticmethod
    async def get_bookings_by_event(event_id: str) -> List[Booking]:
        try:
            result = supabase.table("bookings").select("*").eq("event_id", event_id).order("created_at", desc=True).execute()
            return [Booking(**b) for b in result.data]
        except Exception as e:
            logger.error(f"Error fetching bookings by event: {e}")
            raise
    
    @staticmethod
    async def cancel_booking(booking_id: str, attendee_email: str) -> bool:
        try:
            booking_result = supabase.table("bookings").select("time_slot_id").eq("id", booking_id).eq("attendee_email", attendee_email).single().execute()
            
            if not booking_result.data:
                return False
            
            time_slot_id = booking_result.data["time_slot_id"]
            
            result = supabase.table("bookings").delete().eq("id", booking_id).eq("attendee_email", attendee_email).execute()
            
            if len(result.data) > 0:
                slot_result = supabase.table("time_slots").select("current_bookings").eq("id", time_slot_id).single().execute()
                if slot_result.data:
                    current_bookings = slot_result.data["current_bookings"]
                    new_current_bookings = max(0, current_bookings - 1)
                    supabase.table("time_slots").update({"current_bookings": new_current_bookings}).eq("id", time_slot_id).execute()
                
                return True
            
            return False
        except Exception as e:
            logger.error(f"Error canceling booking: {e}")
            raise 