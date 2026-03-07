'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, User, Rocket, CloudMoon, Moon } from 'lucide-react';
import Image from 'next/image';

export default function Dashboard() {
    const [user, setUser] = useState<{ username: string; user_id: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchProtectedData = async () => {
            const token = localStorage.getItem('access_token');

            if (!token) {
                router.push('/');
                return;
            }

            try {
                const response = await fetch('http://localhost:8000/protected', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Unauthorized');
                }
                
                const data = await response.json();
                const username = data.message.match(/Hello, (.+)!/)?.[1] || 'User';
                setUser({ username, user_id: data.user_id }); 
            } catch (err) {
                localStorage.removeItem('access_token');
                router.push('/');
            } finally {
                setLoading(false);
            }
        };

        fetchProtectedData();
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        router.push('/');
    };

    const navigateToNasa = () => {
      router.push('/dashboard/nasa');
    };

    const navigateToWeather = () => {
      router.push('/dashboard/weather');
    };

    const navigateToMoon = () => {
      router.push('/dashboard/moon');
    };

    if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen p-8 overflow-hidden">
      <div className="absolute inset-0 z-0">
          <Image
            src="/photo-blue.avif"
            alt="Dashboard background"
            fill
            className="object-cover"
            priority
            quality={100}
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
      <div className="relative z-10 max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-white drop-shadow-lg">Dashboard</h1>
          <Button onClick={handleLogout} variant="destructive" className="bg-red-500/80 hover:bg-red-600/80 backdrop-blur-sm">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        {user && (
          <Card >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Welcome back! {user.username}
              </CardTitle>
              <CardDescription>
                You are successfully authenticated
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <span className="text-sm font-medium text-muted-foreground">Username:</span>
                  <span className="font-semibold">{user.username}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* NASA Dashboard Card */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow duration-300 hover:scale-105 transform"
            onClick={navigateToNasa}
          >
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="p-4 bg-blue-500/10 rounded-full">
                  <Rocket className="h-12 w-12 text-blue-500" />
                </div>
              </div>
              <CardTitle className="text-center">NASA Data</CardTitle>
              <CardDescription className="text-center">
                View today's astronomy picture and nearby asteroids
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button variant="outline" className="w-full">
                Explore Space →
              </Button>
            </CardContent>
          </Card>

          {/* Stargazing Weather Card */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 transform"
            onClick={navigateToWeather}
          >
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="p-4 bg-indigo-500/10 rounded-full">
                  <CloudMoon className="h-12 w-12 text-indigo-500" />
                </div>
              </div>
              <CardTitle className="text-center">Stargazing Weather</CardTitle>
              <CardDescription className="text-center">
                Check tonight's conditions for optimal stargazing
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button variant="outline" className="w-full">
                Check Weather →
              </Button>
            </CardContent>
          </Card>

          {/* Moon Phase Card */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 transform"
            onClick={navigateToMoon}
          >
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="p-4 bg-amber-500/10 rounded-full">
                  <Moon className="h-12 w-12 text-amber-500" />
                </div>
              </div>
              <CardTitle className="text-center">Moon Phase</CardTitle>
              <CardDescription className="text-center">
                View current moon phase and illumination
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button variant="outline" className="w-full">
                View Moon →
              </Button>
            </CardContent>
          </Card>           
        </div>
      </div>
    </div>
  );
}