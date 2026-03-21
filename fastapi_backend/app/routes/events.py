from typing import Optional

from fastapi import APIRouter, Depends, Query

from app.database import User
from app.users import current_active_user
from app.routes._validation import validate_date
from pmt_core.services import EventCalendarService, EventStreamService, ReverseInquiryService

router = APIRouter(tags=["events"])

event_calendar_service = EventCalendarService()
event_stream_service = EventStreamService()
reverse_inquiry_service = ReverseInquiryService()


@router.get("/calendar")
async def get_event_calendar(
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    user: User = Depends(current_active_user),
):
    start = validate_date(start_date, "start_date")
    end = validate_date(end_date, "end_date")
    return await event_calendar_service.get_events(start, end)


@router.get("/stream")
async def get_event_stream(
    user: User = Depends(current_active_user),
):
    return await event_stream_service.get_events()


@router.get("/reverse-inquiry")
async def get_reverse_inquiries(
    user: User = Depends(current_active_user),
):
    return await reverse_inquiry_service.get_inquiries()
