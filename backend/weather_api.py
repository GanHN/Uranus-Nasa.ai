from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Annotated, Optional
import httpx
from datetime import datetime, timedelta
from auth import get_current_user

router = APIRouter(prefix="/weather", tags=["weather"])

user_dependency = Annotated[dict, Depends(get_current_user)]

@router.get("/geocoding")
async def geocode_location(
    current_user: user_dependency,
    city: str = Query(..., description="City name to search for")
):
    """Get coordinates for a city using Open-Meteo geocoding API"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://geocoding-api.open-meteo.com/v1/search",
                params={
                    "name": city,
                    "count": 5,
                    "language": "en",
                    "format": "json"
                }
            )
            response.raise_for_status()
            data = response.json()

            if not data.get("results"):
                raise HTTPException(status_code=404, detail=f"City '{city}' not found")
            
            locations = []
            for result in data["results"]:
                locations.append({
                    "name": result["name"],
                    "country": result.get("country", ""),
                    "admin1": result.get("admin1", ""),  #state/province
                    "latitude": result["latitude"],
                    "longitude": result["longitude"],
                    "timezone": result.get("timezone", ""),
                    "display_name": f"{result['name']}, {result.get('admin1', '')}, {result.get('country', '')}".strip(", ")
                })
            return {"locations": locations}
    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"Error fetching geocoding data: {str(e)}")


@router.get("/stargazing")
async def get_stargazing_weather(
    current_user: user_dependency,
    latitude: float = Query(..., description="Latitude of the location"),
    longitude: float = Query(..., description="Longitude of the location"),
    timezone: str = Query("auto", description="Timezone for the location")
):
    """Get tonight's weather conditions for stargazing"""
    try:
        async with httpx.AsyncClient() as client:
            now = datetime.now()
            
            # Calculate tonight (6 PM today to 6 AM tomorrow)
            today = now.date()
            start_date = today
            end_date = today + timedelta(days=1)
            
            response = await client.get(
                "https://api.open-meteo.com/v1/forecast",
                params={
                    "latitude": latitude,
                    "longitude": longitude,
                    "hourly": "temperature_2m,cloud_cover,precipitation_probability,visibility,wind_speed_10m,relative_humidity_2m",
                    "daily": "sunset,sunrise",
                    "timezone": timezone,
                    "start_date": start_date.isoformat(),
                    "end_date": end_date.isoformat(),
                }
            )
            response.raise_for_status()
            data = response.json()
            
            # Extract hourly data
            hourly = data.get("hourly", {})
            times = hourly.get("time", [])
            temperatures = hourly.get("temperature_2m", [])
            cloud_covers = hourly.get("cloud_cover", [])
            precipitation_probs = hourly.get("precipitation_probability", [])
            visibilities = hourly.get("visibility", [])
            wind_speeds = hourly.get("wind_speed_10m", [])
            humidity = hourly.get("relative_humidity_2m", [])
            
            # Get sunset and sunrise
            daily = data.get("daily", {})
            sunset = daily.get("sunset", [""])[0]
            sunrise = daily.get("sunrise", [""])[0] if len(daily.get("sunrise", [])) > 1 else daily.get("sunrise", [""])[0]
            
            # Filter for tonight's hours (sunset to sunrise)
            tonight_data = []
            
            for i, time_str in enumerate(times):
                time_dt = datetime.fromisoformat(time_str)
                hour = time_dt.hour
                
                if hour >= 18 or hour <= 6:
                    tonight_data.append({
                        "time": time_str,
                        "hour": hour,
                        "temperature": temperatures[i] if i < len(temperatures) else None,
                        "cloud_cover": cloud_covers[i] if i < len(cloud_covers) else None,
                        "precipitation_probability": precipitation_probs[i] if i < len(precipitation_probs) else None,
                        "visibility": visibilities[i] if i < len(visibilities) else None,
                        "wind_speed": wind_speeds[i] if i < len(wind_speeds) else None,
                        "humidity": humidity[i] if i < len(humidity) else None,
                    })
            
            # Calculate average conditions for tonight
            if tonight_data:
                avg_cloud_cover = sum(d["cloud_cover"] for d in tonight_data if d["cloud_cover"] is not None) / len([d for d in tonight_data if d["cloud_cover"] is not None])
                avg_temp = sum(d["temperature"] for d in tonight_data if d["temperature"] is not None) / len([d for d in tonight_data if d["temperature"] is not None])
                max_precip = max((d["precipitation_probability"] for d in tonight_data if d["precipitation_probability"] is not None), default=0)
                avg_visibility = sum(d["visibility"] for d in tonight_data if d["visibility"] is not None) / len([d for d in tonight_data if d["visibility"] is not None]) if any(d["visibility"] is not None for d in tonight_data) else None
                avg_wind = sum(d["wind_speed"] for d in tonight_data if d["wind_speed"] is not None) / len([d for d in tonight_data if d["wind_speed"] is not None])
                avg_humidity = sum(d["humidity"] for d in tonight_data if d["humidity"] is not None) / len([d for d in tonight_data if d["humidity"] is not None])
                
                # Determine stargazing quality
                quality = "Excellent"
                quality_score = 100
                
                if avg_cloud_cover > 75:
                    quality = "Poor"
                    quality_score = 25
                elif avg_cloud_cover > 50:
                    quality = "Fair"
                    quality_score = 50
                elif avg_cloud_cover > 25:
                    quality = "Good"
                    quality_score = 75
                
                if max_precip > 50:
                    quality = "Poor"
                    quality_score = min(quality_score, 30)
                
                summary = {
                    "avg_cloud_cover": round(avg_cloud_cover, 1),
                    "avg_temperature": round(avg_temp, 1),
                    "max_precipitation_probability": round(max_precip, 1),
                    "avg_visibility": round(avg_visibility, 1) if avg_visibility else None,
                    "avg_wind_speed": round(avg_wind, 1),
                    "avg_humidity": round(avg_humidity, 1),
                    "quality": quality,
                    "quality_score": quality_score,
                }
            else:
                summary = None
            
            return {
                "location": {
                    "latitude": latitude,
                    "longitude": longitude,
                    "timezone": data.get("timezone", timezone)
                },
                "sunset": sunset,
                "sunrise": sunrise,
                "tonight_hourly": tonight_data,
                "summary": summary,
                "units": {
                    "temperature": data.get("hourly_units", {}).get("temperature_2m", "°C"),
                    "cloud_cover": "%",
                    "precipitation": "%",
                    "visibility": data.get("hourly_units", {}).get("visibility", "m"),
                    "wind_speed": data.get("hourly_units", {}).get("wind_speed_10m", "km/h"),
                    "humidity": "%"
                }
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch weather data: {str(e)}") 