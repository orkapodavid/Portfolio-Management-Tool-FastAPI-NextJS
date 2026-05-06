from typing import Optional

from fastapi import APIRouter, Depends, Query

from app.database import User
from app.users import current_active_user
from pmt_core.services import ComplianceService

router = APIRouter(tags=["compliance"])

compliance_service = ComplianceService()


@router.get("/restricted-list")
async def get_restricted_list(
    user: User = Depends(current_active_user),
):
    return await compliance_service.get_restricted_list()


@router.get("/undertakings")
async def get_undertakings(
    position_date: Optional[str] = Query(default=None),
    user: User = Depends(current_active_user),
):
    return await compliance_service.get_undertakings(position_date=position_date)


@router.get("/beneficial-ownership")
async def get_beneficial_ownership(
    position_date: Optional[str] = Query(default=None),
    user: User = Depends(current_active_user),
):
    return await compliance_service.get_beneficial_ownership(
        position_date=position_date
    )


@router.get("/monthly-exercise-limit")
async def get_monthly_exercise_limit(
    position_date: Optional[str] = Query(default=None),
    user: User = Depends(current_active_user),
):
    return await compliance_service.get_monthly_exercise_limit(
        position_date=position_date
    )
