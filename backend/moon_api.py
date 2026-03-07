from fastapi import APIRouter, Depends
from typing import Annotated
from datetime import datetime
import math
from auth import get_current_user

router = APIRouter(prefix = "/moon", tags=["moon"])

user_dependency = Annotated[dict, Depends(get_current_user)]

def calculate_moon_phase(date=None):
    if date is None:
        date = datetime.now()

    known_new_moon = datetime(2000, 1, 6, 18, 14)  # Known new moon date
    lunar_cycle = 29.530588853
    days_since = (date - known_new_moon).total_seconds() / (24 * 3600)
    current_cycle = days_since % lunar_cycle
    phase = current_cycle / lunar_cycle
    illumination = (1 - math.cos(phase * 2 * math.pi)) / 2 * 100

    if phase < 0.03 or phase > 0.97:
        phase_name = "New Moon"
        emoji = "🌑"
    elif phase < 0.22:
        phase_name = "Waxing Crescent"
        emoji = "🌒"
    elif phase < 0.28:
        phase_name = "First Quarter"
        emoji = "🌓"
    elif phase < 0.47:
        phase_name = "Waxing Gibbous"
        emoji = "🌔"
    elif phase < 0.53:
        phase_name = "Full Moon"
        emoji = "🌕"
    elif phase < 0.72:
        phase_name = "Waning Gibbous"
        emoji = "🌖"
    elif phase < 0.78:
        phase_name = "Last Quarter"
        emoji = "🌗"
    else:
        phase_name = "Waning Crescent"
        emoji = "🌘"
    
    # Calculate days until next full moon and new moon
    days_to_full = ((0.5 - phase) % 1) * lunar_cycle
    days_to_new = ((1.0 - phase) % 1) * lunar_cycle
    
    return {
        "phase_name": phase_name,
        "emoji": emoji,
        "illumination": round(illumination, 1),
        "phase_value": round(phase, 3),
        "days_to_full_moon": round(days_to_full, 1),
        "days_to_new_moon": round(days_to_new, 1),
        "date": date.isoformat(),
        "is_waxing": phase < 0.5,
    }

@router.get("/current")
async def get_current_moon_phase(current_user: user_dependency):
    """Get current moon phase and illumination"""
    return calculate_moon_phase()

@router.get("/date")
async def get_moon_phase_by_date(current_user: user_dependency, date: str):
    """Get moon phase for a specific date (YYYY-MM-DD)"""
    try:
        target_date = datetime.fromisoformat(date)
        return calculate_moon_phase(target_date)
    except ValueError:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")