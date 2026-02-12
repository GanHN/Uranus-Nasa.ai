'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, User } from 'lucide-react';

export default function DashboardPage() {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <Button onClick={handleLogout} variant="destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        {user && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Welcome back!
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

        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              placeholder
            </CardDescription>
          </CardHeader>
          <CardContent>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}