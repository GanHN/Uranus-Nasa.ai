import httpx
import os
from fastapi import APIRouter, HTTPException, Depends
from typing import Annotated, List, Dict, Any
from datetime import datetime
from dotenv import load_dotenv
from auth import get_current_user

load_dotenv()

router = APIRouter(
    prefix="/nasa",
    tags=["nasa"]
)

NASA_API_KEY = os.getenv("NASA_API_KEY")
user_dependency = Annotated[dict, Depends(get_current_user)]

@router.get("/apod")
async def get_apod(current_user: user_dependency):
    """Get NASA's Astronomy Picture of the Day (APOD)"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://api.nasa.gov/planetary/apod?api_key={NASA_API_KEY}"
            )
            if response.status_code == 200:
                return response.json()
            else:
                raise HTTPException(status_code=response.status_code, detail="Failed to retrieve APOD data")
    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"Error fetching APOD data: {str(e)}")
    

@router.get("/asteroids")
async def get_near_earth_asteroids(current_user: user_dependency):
    """Get the 3 closest Near Earth Objects (asteroids) for today"""
    try:
        today = datetime.now().strftime("%Y-%m-%d")
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://api.nasa.gov/neo/rest/v1/feed?start_date={today}&end_date={today}&api_key={NASA_API_KEY}"
            )
            response.raise_for_status()
            data = response.json()
            
            asteroids = data.get("near_earth_objects", {}).get(today, [])
            
            sorted_asteroids = sorted(
                asteroids,
                key=lambda x: float(x["close_approach_data"][0]["miss_distance"]["kilometers"])
            )[:3]
            
            # Format the response
            formatted_asteroids = []
            for asteroid in sorted_asteroids:
                close_approach = asteroid["close_approach_data"][0]
                formatted_asteroids.append({
                    "name": asteroid["name"],
                    "id": asteroid["id"],
                    "diameter_min_km": asteroid["estimated_diameter"]["kilometers"]["estimated_diameter_min"],
                    "diameter_max_km": asteroid["estimated_diameter"]["kilometers"]["estimated_diameter_max"],
                    "is_potentially_hazardous": asteroid["is_potentially_hazardous_asteroid"],
                    "close_approach_date": close_approach["close_approach_date"],
                    "miss_distance_km": close_approach["miss_distance"]["kilometers"],
                    "miss_distance_lunar": close_approach["miss_distance"]["lunar"],
                    "relative_velocity_kmh": close_approach["relative_velocity"]["kilometers_per_hour"],
                    "nasa_jpl_url": asteroid["nasa_jpl_url"]
                })
            
            return {
                "date": today,
                "count": len(formatted_asteroids),
                "asteroids": formatted_asteroids
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch asteroids: {str(e)}")