'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Moon, Calendar, TrendingUp, TrendingDown } from 'lucide-react';

interface MoonData {
  phase_name: string;
  emoji: string;
  illumination: number;
  phase_value: number;
  days_to_full_moon: number;
  days_to_new_moon: number;
  date: string;
  is_waxing: boolean;
}

export default function MoonPhasePage() {
  const [moonData, setMoonData] = useState<MoonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchMoonData = async () => {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        router.push('/');
        return;
      }

      try {
        const response = await fetch('http://localhost:8000/moon/current', {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch moon data');
        }

        const data = await response.json();
        setMoonData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMoonData();
  }, [router]);

  const getMoonSizeClass = (illumination: number) => {
    // Scale moon size based on illumination
    const scale = 0.7 + (illumination / 100) * 0.3; // 0.7 to 1.0
    return `scale-${Math.round(scale * 100)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
        <Card className="w-96 backdrop-blur-xl bg-white/10 border-white/20">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              <p className="text-white">Loading moon data...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !moonData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4">
        <Card className="w-full max-w-md backdrop-blur-xl bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-white/80">{error || 'Failed to load moon data'}</p>
            <Button onClick={() => router.push('/dashboard')} className="mt-4 w-full">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
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
            <Moon className="h-8 w-8" />
            Moon Phase
          </h1>
        </div>

        {/* Main Moon Display */}
        <Card className="backdrop-blur-xl bg-white/10 border-white/20">
          <CardContent className="pt-8">
            <div className="flex flex-col items-center space-y-6">
              {/* Moon Emoji */}
              <div className="text-9xl animate-pulse">
                {moonData.emoji}
              </div>
              
              {/* Phase Name */}
              <h2 className="text-4xl font-bold text-white text-center">
                {moonData.phase_name}
              </h2>
              
              {/* Illumination Percentage */}
              <div className="text-center">
                <div className="text-6xl font-bold text-amber-400">
                  {moonData.illumination}%
                </div>
                <p className="text-white/70 mt-2">Illuminated</p>
              </div>

              {/* Waxing/Waning Indicator */}
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full">
                {moonData.is_waxing ? (
                  <>
                    <TrendingUp className="h-5 w-5 text-green-400" />
                    <span className="text-white font-semibold">Waxing</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-5 w-5 text-blue-400" />
                    <span className="text-white font-semibold">Waning</span>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Days to Full Moon */}
          <Card className="backdrop-blur-xl bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                🌕 Next Full Moon
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {moonData.days_to_full_moon < 1 
                  ? 'Today!' 
                  : `${Math.ceil(moonData.days_to_full_moon)} days`
                }
              </div>
              <p className="text-white/70 text-sm mt-1">
                {moonData.days_to_full_moon < 1 
                  ? 'The moon is full tonight' 
                  : 'Time until full moon'
                }
              </p>
            </CardContent>
          </Card>

          {/* Days to New Moon */}
          <Card className="backdrop-blur-xl bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                🌑 Next New Moon
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {moonData.days_to_new_moon < 1 
                  ? 'Today!' 
                  : `${Math.ceil(moonData.days_to_new_moon)} days`
                }
              </div>
              <p className="text-white/70 text-sm mt-1">
                {moonData.days_to_new_moon < 1 
                  ? 'The moon is new tonight' 
                  : 'Time until new moon'
                }
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Moon Phase Information */}
        <Card className="backdrop-blur-xl bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="text-white">About This Moon Phase</CardTitle>
          </CardHeader>
          <CardContent className="text-white/80 space-y-3">
            {moonData.phase_name === 'New Moon' && (
              <p>The moon is positioned between Earth and the Sun, making it invisible from Earth. Perfect time for stargazing as there's minimal moonlight!</p>
            )}
            {moonData.phase_name === 'Waxing Crescent' && (
              <p>The moon is beginning to show. A thin crescent is visible in the western sky after sunset. Great for photographing the crescent moon!</p>
            )}
            {moonData.phase_name === 'First Quarter' && (
              <p>Half of the moon's face is illuminated. This is an excellent time to observe lunar craters and mountains along the terminator line.</p>
            )}
            {moonData.phase_name === 'Waxing Gibbous' && (
              <p>More than half the moon is illuminated and growing. The moon rises in the afternoon and sets after midnight. Good visibility for moon watching!</p>
            )}
            {moonData.phase_name === 'Full Moon' && (
              <p>The entire face of the moon is illuminated. While beautiful, the bright moonlight makes it harder to see faint stars and deep-sky objects.</p>
            )}
            {moonData.phase_name === 'Waning Gibbous' && (
              <p>The moon is still mostly illuminated but decreasing. It rises later in the evening. Still provides good light for nighttime activities.</p>
            )}
            {moonData.phase_name === 'Last Quarter' && (
              <p>Half the moon is illuminated on the opposite side from First Quarter. Rises around midnight and sets around noon. Great for early morning observations!</p>
            )}
            {moonData.phase_name === 'Waning Crescent' && (
              <p>A thin crescent is visible in the eastern sky before sunrise. The moon is nearly returning to its new phase. Excellent for stargazing!</p>
            )}
            
            <div className="mt-4 p-3 bg-white/5 rounded-lg">
              <p className="text-sm">
                <strong className="text-white">Stargazing Tip:</strong> {' '}
                {moonData.illumination < 30 
                  ? 'Excellent conditions for stargazing! Low moonlight means darker skies and better visibility of stars and galaxies.'
                  : moonData.illumination < 70
                  ? 'Moderate moonlight. You can still see bright stars and planets, but fainter objects may be harder to spot.'
                  : 'Bright moonlight may wash out fainter stars. Best time to observe the moon itself and bright planets!'
                }
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Current Date */}
        <Card className="backdrop-blur-xl bg-white/10 border-white/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-center gap-2 text-white/70">
              <Calendar className="h-4 w-4" />
              <span>{new Date(moonData.date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}