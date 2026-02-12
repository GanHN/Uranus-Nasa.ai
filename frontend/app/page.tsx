'use client';

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LoginPage() {
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [signupData, setSignupData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append('username', loginData.username);
      formData.append('password', loginData.password);

      const response = await fetch('http://localhost:8000/auth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Invalid username or password');
      }

      const data = await response.json();
      localStorage.setItem('access_token', data.access_token);
      
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: signupData.username,
          password: signupData.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Signup failed');
      }

      setSuccess('Account created successfully! Please login.');
      setSignupData({ username: '', password: '' });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="/uranusaiback.jpg"
          alt="Uranus background"
          fill
          className="object-cover"
          priority
          quality={100}
        />
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      <Card className="w-full max-w-md relative z-10 backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-white drop-shadow-lg">
            Welcome To Uranus-NASA!
          </CardTitle>
          <CardDescription className="text-center text-white">
            Login to your account or create a new one
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/20 backdrop-blur-sm">
              <TabsTrigger 
                value="login"
                className="data-[state=active]:bg-white/30 data-[state=active]:text-white text-white/70"
              >
                Login
              </TabsTrigger>
              <TabsTrigger 
                value="signup"
                className="data-[state=active]:bg-white/30 data-[state=active]:text-white text-white/70"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-username" className="text-white">
                    Username
                  </Label>
                  <Input
                    id="login-username"
                    type="text"
                    placeholder="Enter your username"
                    value={loginData.username}
                    onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                    required
                    className="bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder:text-white/50 focus:bg-white/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-white">
                    Password
                  </Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                    className="bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder:text-white/50 focus:bg-white/30"
                  />
                </div>

                {error && (
                  <div className="bg-red-500/40 backdrop-blur-sm text-white text-sm p-3 rounded-md border border-red-500/60">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="bg-green-500/20 backdrop-blur-sm text-white text-sm p-3 rounded-md border border-green-500/30">
                    {success}
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border border-white/30" 
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Login'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-username" className="text-white">
                    Username
                  </Label>
                  <Input
                    id="signup-username"
                    type="text"
                    placeholder="Choose a username"
                    value={signupData.username}
                    onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
                    required
                    className="bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder:text-white/50 focus:bg-white/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-white">
                    Password
                  </Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Choose a password"
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    required
                    className="bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder:text-white/50 focus:bg-white/30"
                  />
                </div>

                {error && (
                  <div className="bg-red-500/20 backdrop-blur-sm text-white text-sm p-3 rounded-md border border-red-500/30">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="bg-green-500/20 backdrop-blur-sm text-white text-sm p-3 rounded-md border border-green-500/30">
                    {success}
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border border-white/30" 
                  disabled={loading}
                >
                  {loading ? 'Creating account...' : 'Sign Up'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}