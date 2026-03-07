'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, AlertTriangle, Rocket, Calendar, Ruler, Gauge, Play } from 'lucide-react';
import Image from 'next/image';

interface Asteroid {
  name: string;
  id: string;
  diameter_min_km: number;
  diameter_max_km: number;
  is_potentially_hazardous: boolean;
  close_approach_date: string;
  miss_distance_km: string;
  miss_distance_lunar: string;
  relative_velocity_kmh: string;
  nasa_jpl_url: string;
}

interface AsteroidsData {
  date: string;
  count: number;
  asteroids: Asteroid[];
}

interface APOD {
  title: string;
  explanation: string;
  url: string;
  hdurl?: string;
  media_type: string;
  date: string;
  copyright?: string;
}

export default function NasaDashboard() {
  const [apod, setApod] = useState<APOD | null>(null);
  const [asteroids, setAsteroids] = useState<AsteroidsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchNasaData = async () => {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        router.push('/');
        return;
      }

      try {
        // Fetch APOD
        const apodResponse = await fetch('http://localhost:8000/nasa/apod', {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        // Fetch Asteroids
        const asteroidsResponse = await fetch('http://localhost:8000/nasa/asteroids', {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!apodResponse.ok || !asteroidsResponse.ok) {
          throw new Error('Failed to fetch NASA data');
        }

        const apodData = await apodResponse.json();
        const asteroidsData = await asteroidsResponse.json();

        setApod(apodData);
        setAsteroids(asteroidsData);
      } catch (err: any) {
        setError(err.message);
        if (err.message === 'Unauthorized') {
          localStorage.removeItem('access_token');
          router.push('/');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNasaData();
  }, [router]);

  // Helper function to determine if URL is a video
  const isVideoUrl = (url: string) => {
    return url.match(/\.(mp4|webm|ogg|mov)$/i) !== null;
  };

  // Helper function to determine if it's a YouTube video
  const isYouTubeUrl = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-blue-900">
        <Card className="w-96 backdrop-blur-xl bg-white/10 border-white/20">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              <p className="text-white">Loading NASA data...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-blue-900 p-4">
        <Card className="w-full max-w-md backdrop-blur-xl bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-white/80">{error}</p>
            <Button onClick={() => router.push('/dashboard')} className="mt-4 w-full">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 md:p-8">
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
            <Rocket className="h-8 w-8" />
            NASA Space Data
          </h1>
        </div>

        {/* Astronomy Picture of the Day */}
        {apod && (
          <Card className="backdrop-blur-xl bg-white/10 border-white/20 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-2xl text-white flex items-center gap-2">
                <Calendar className="h-6 w-6" />
                Astronomy Picture of the Day
                {(apod.media_type === 'video' || isVideoUrl(apod.url)) && (
                  <Play className="h-5 w-5 text-red-400" />
                )}
              </CardTitle>
              <CardDescription className="text-white/70">
                {apod.date} {apod.copyright && `• © ${apod.copyright}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative w-full rounded-lg overflow-hidden bg-black">
                {/* Handle direct video files (mp4, webm, etc) */}
                {isVideoUrl(apod.url) ? (
                  <video
                    controls
                    autoPlay
                    loop
                    muted
                    className="w-full h-auto max-h-[600px]"
                    poster={apod.hdurl || undefined}
                  >
                    <source src={apod.url} type="video/mp4" />
                    <source src={apod.url} type="video/webm" />
                    <source src={apod.url} type="video/ogg" />
                    Your browser does not support the video tag.
                  </video>
                ) : apod.media_type === 'video' || isYouTubeUrl(apod.url) ? (
                  /* Handle YouTube embeds and other iframe videos */
                  <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      src={apod.url}
                      className="absolute top-0 left-0 w-full h-full"
                      title={apod.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  /* Handle images */
                  <div className="relative w-full h-64 md:h-96">
                    <Image
                      src={apod.hdurl || apod.url}
                      alt={apod.title}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">{apod.title}</h3>
                <p className="text-white/80 leading-relaxed">{apod.explanation}</p>
                {apod.hdurl && (
                  <Button
                    variant="outline"
                    className="mt-4 bg-white/10 hover:bg-white/20 text-white border-white/20"
                    onClick={() => window.open(apod.hdurl, '_blank')}
                  >
                    View HD Version →
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Near Earth Asteroids */}
        {asteroids && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="h-6 w-6" />
              3 Closest Asteroids Today ({asteroids.date})
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              {asteroids.asteroids.map((asteroid, index) => (
                <Card
                  key={asteroid.id}
                  className="backdrop-blur-xl bg-white/10 border-white/20 hover:bg-white/15 transition-colors"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg text-white">
                        #{index + 1} {asteroid.name}
                      </CardTitle>
                      {asteroid.is_potentially_hazardous && (
                        <AlertTriangle className="h-5 w-5 text-red-400" />
                      )}
                    </div>
                    <CardDescription className="text-white/70">
                      {asteroid.is_potentially_hazardous ? (
                        <span className="text-red-400 font-semibold">Potentially Hazardous</span>
                      ) : (
                        <span className="text-green-400">Safe</span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-white/80">
                        <Ruler className="h-4 w-4" />
                        <span>
                          Diameter: {asteroid.diameter_min_km.toFixed(2)} - {asteroid.diameter_max_km.toFixed(2)} km
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-white/80">
                        <Rocket className="h-4 w-4" />
                        <span>
                          Miss distance: {parseFloat(asteroid.miss_distance_km).toLocaleString()} km
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-white/80">
                        <span>🌙</span>
                        <span>
                          {parseFloat(asteroid.miss_distance_lunar).toFixed(2)} lunar distances
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-white/80">
                        <Gauge className="h-4 w-4" />
                        <span>
                          Speed: {parseFloat(asteroid.relative_velocity_kmh).toLocaleString()} km/h
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full bg-white/10 hover:bg-white/20 text-white border-white/20"
                      onClick={() => window.open(asteroid.nasa_jpl_url, '_blank')}
                    >
                      View Details →
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}