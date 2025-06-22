from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List
from models import Booking, BookingCreate, BookingResponse
from services.booking_service import BookingService

router = APIRouter(prefix="/bookings", tags=["bookings"])

@router.post("/", response_model=BookingResponse)
async def create_new_booking(booking_data: BookingCreate):
    """Endpoint to create a new booking."""
    try:
        booking_response = await BookingService.create_booking(booking_data)
        if not booking_response.success:
            raise HTTPException(status_code=400, detail=booking_response.message)
        return booking_response
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/user/{email}", response_model=List[Booking])
async def get_user_bookings(email: str):
    """Get all bookings for a user by email, with nested event and time slot details."""
    try:
        # The service now returns data that matches the List[Booking] model
        bookings = await BookingService.get_bookings_by_email(email)
        return bookings
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/event/{event_id}", response_model=List[Booking])
async def get_event_bookings(event_id: str):
    """Get all bookings for a specific event."""
    try:
        bookings = await BookingService.get_bookings_by_event(event_id)
        return bookings
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{booking_id}", status_code=204)
async def cancel_user_booking(booking_id: str, attendee_email: str):
    """Cancel a booking, requires booking ID and attendee email for verification."""
    try:
        success = await BookingService.cancel_booking(booking_id, attendee_email)
        if not success:
            raise HTTPException(status_code=404, detail="Booking not found or email does not match.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 