'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Search, CloudMoon, Thermometer, Cloud, Droplets, Wind, Eye, Star, Sunrise, Sunset } from 'lucide-react';

interface Location {
  name: string;
  country: string;
  admin1: string;
  latitude: number;
  longitude: number;
  timezone: string;
  display_name: string;
}

interface HourlyData {
  time: string;
  hour: number;
  temperature: number;
  cloud_cover: number;
  precipitation_probability: number;
  visibility: number | null;
  wind_speed: number;
  humidity: number;
}

interface WeatherSummary {
  avg_cloud_cover: number;
  avg_temperature: number;
  max_precipitation_probability: number;
  avg_visibility: number | null;
  avg_wind_speed: number;
  avg_humidity: number;
  quality: string;
  quality_score: number;
}

interface WeatherData {
  location: {
    latitude: number;
    longitude: number;
    timezone: string;
  };
  sunset: string;
  sunrise: string;
  tonight_hourly: HourlyData[];
  summary: WeatherSummary | null;
  units: {
    temperature: string;
    cloud_cover: string;
    precipitation: string;
    visibility: string;
    wind_speed: string;
    humidity: string;
  };
}

export default function WeatherDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const searchLocations = async () => {
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    setError('');
    setLocations([]);

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/');
        return;
      }

      const response = await fetch(
        `http://localhost:8000/weather/geocoding?city=${encodeURIComponent(searchQuery)}`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error('Location not found');
      }

      const data = await response.json();
      setLocations(data.locations || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSearchLoading(false);
    }
  };

  const fetchWeatherData = async (location: Location) => {
    setLoading(true);
    setError('');
    setSelectedLocation(location);
    setWeatherData(null);

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/');
        return;
      }

      const response = await fetch(
        `http://localhost:8000/weather/stargazing?latitude=${location.latitude}&longitude=${location.longitude}&timezone=${encodeURIComponent(location.timezone)}`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }

      const data = await response.json();
      setWeatherData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'Excellent': return 'text-green-400';
      case 'Good': return 'text-blue-400';
      case 'Fair': return 'text-yellow-400';
      case 'Poor': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getQualityBgColor = (quality: string) => {
    switch (quality) {
      case 'Excellent': return 'bg-green-500/20';
      case 'Good': return 'bg-blue-500/20';
      case 'Fair': return 'bg-yellow-500/20';
      case 'Poor': return 'bg-red-500/20';
      default: return 'bg-gray-500/20';
    }
  };

  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            onClick={() => router.push('/dashboard')}
            variant="outline"
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-2">
            <CloudMoon className="h-8 w-8" />
            Stargazing Weather
          </h1>
        </div>

        {/* Search Section */}
        <Card className="backdrop-blur-xl bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Find Your Stargazing Location</CardTitle>
            <CardDescription className="text-white/70">
              Search for a city to check tonight's weather conditions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter city name (e.g., London, Tokyo, New York)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchLocations()}
                className="bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder:text-white/50"
              />
              <Button
                onClick={searchLocations}
                disabled={searchLoading || !searchQuery.trim()}
                className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {error && (
              <div className="bg-red-500/20 text-white p-3 rounded-md border border-red-500/30">
                {error}
              </div>
            )}

            {locations.length > 0 && (
              <div className="space-y-2">
                <p className="text-white/70 text-sm">Select a location:</p>
                <div className="grid gap-2">
                  {locations.map((location, index) => (
                    <Button
                      key={index}
                      onClick={() => fetchWeatherData(location)}
                      variant="outline"
                      className="bg-white/10 hover:bg-white/20 text-white border-white/20 justify-start"
                    >
                      {location.display_name}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <Card className="backdrop-blur-xl bg-white/10 border-white/20">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                <p className="text-white">Loading weather data...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Weather Data Display */}
        {weatherData && weatherData.summary && selectedLocation && (
          <div className="space-y-6">
            {/* Location Header */}
            <Card className="backdrop-blur-xl bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-2xl text-white">
                  {selectedLocation.display_name}
                </CardTitle>
                <CardDescription className="text-white/70">
                  Tonight's stargazing conditions
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Overall Quality */}
            <Card className={`backdrop-blur-xl bg-white/10 border-white/20`}>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full ${getQualityBgColor(weatherData.summary.quality)}`}>
                    <Star className={`h-6 w-6 ${getQualityColor(weatherData.summary.quality)}`} />
                    <span className={`text-2xl font-bold ${getQualityColor(weatherData.summary.quality)}`}>
                      {weatherData.summary.quality}
                    </span>
                  </div>
                  <p className="text-white/70">Stargazing Conditions</p>
                </div>
              </CardContent>
            </Card>

            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Cloud Cover */}
              <Card className="backdrop-blur-xl bg-white/10 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Cloud className="h-5 w-5" />
                    Cloud Cover
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">
                    {weatherData.summary.avg_cloud_cover}%
                  </div>
                  <p className="text-white/70 text-sm mt-1">Average tonight</p>
                </CardContent>
              </Card>

              {/* Temperature */}
              <Card className="backdrop-blur-xl bg-white/10 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Thermometer className="h-5 w-5" />
                    Temperature
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">
                    {weatherData.summary.avg_temperature}{weatherData.units.temperature}
                  </div>
                  <p className="text-white/70 text-sm mt-1">Average tonight</p>
                </CardContent>
              </Card>

              {/* Precipitation */}
              <Card className="backdrop-blur-xl bg-white/10 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Droplets className="h-5 w-5" />
                    Precipitation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">
                    {weatherData.summary.max_precipitation_probability}%
                  </div>
                  <p className="text-white/70 text-sm mt-1">Max probability</p>
                </CardContent>
              </Card>

              {/* Humidity */}
              <Card className="backdrop-blur-xl bg-white/10 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Droplets className="h-5 w-5" />
                    Humidity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">
                    {weatherData.summary.avg_humidity}%
                  </div>
                  <p className="text-white/70 text-sm mt-1">Average tonight</p>
                </CardContent>
              </Card>

              {/* Wind Speed */}
              <Card className="backdrop-blur-xl bg-white/10 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Wind className="h-5 w-5" />
                    Wind Speed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">
                    {weatherData.summary.avg_wind_speed}
                  </div>
                  <p className="text-white/70 text-sm mt-1">{weatherData.units.wind_speed}</p>
                </CardContent>
              </Card>

              {/* Visibility */}
              {weatherData.summary.avg_visibility !== null && (
                <Card className="backdrop-blur-xl bg-white/10 border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Visibility
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-white">
                      {(weatherData.summary.avg_visibility / 1000).toFixed(1)} km
                    </div>
                    <p className="text-white/70 text-sm mt-1">Average tonight</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sunset/Sunrise Times */}
            <Card className="backdrop-blur-xl bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Sunset & Sunrise</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg">
                    <Sunset className="h-6 w-6 text-orange-400" />
                    <div>
                      <p className="text-white/70 text-sm">Sunset</p>
                      <p className="text-white font-semibold">{formatTime(weatherData.sunset)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg">
                    <Sunrise className="h-6 w-6 text-yellow-400" />
                    <div>
                      <p className="text-white/70 text-sm">Sunrise</p>
                      <p className="text-white font-semibold">{formatTime(weatherData.sunrise)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Hourly Forecast */}
            <Card className="backdrop-blur-xl bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Hourly Forecast (Tonight)</CardTitle>
                <CardDescription className="text-white/70">
                  Detailed conditions throughout the night
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <div className="flex gap-4 pb-4">
                    {weatherData.tonight_hourly.map((hour, index) => (
                      <div
                        key={index}
                        className="flex-shrink-0 w-32 p-4 bg-white/10 rounded-lg space-y-2"
                      >
                        <p className="text-white font-semibold text-center">
                          {formatTime(hour.time)}
                        </p>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center justify-between text-white/80">
                            <Thermometer className="h-4 w-4" />
                            <span>{hour.temperature}°</span>
                          </div>
                          <div className="flex items-center justify-between text-white/80">
                            <Cloud className="h-4 w-4" />
                            <span>{hour.cloud_cover}%</span>
                          </div>
                          <div className="flex items-center justify-between text-white/80">
                            <Droplets className="h-4 w-4" />
                            <span>{hour.precipitation_probability}%</span>
                          </div>
                          <div className="flex items-center justify-between text-white/80">
                            <Wind className="h-4 w-4" />
                            <span>{hour.wind_speed}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}