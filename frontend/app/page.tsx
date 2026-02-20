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

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8000/auth/google/login';
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

                {/* Divider */}
                <div className="flex items-center my-6">
                  {/* Left Line */}
                  <div className="flex-grow border-t border-white/30"></div>
                    <span className="flex-shrink mx-4 text-xs uppercase font-medium text-white/70 tracking-wider">
                      Or
                    </span>                 
                  {/* Right Line */}
                  <div className="flex-grow border-t border-white/30"></div>
                </div>

                {/* Google Button */}
                <Button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="
                    w-full 
                    bg-white/10               /* Semi-transparent background */
                    hover:bg-white/20          /* Slightly brighter on hover */
                    text-white                /* White text to match UI */
                    border-white/20           /* Subtle border */
                    backdrop-blur-md           /* Frosted glass effect */
                    transition-all duration-300
                    font-medium 
                    h-11                       /* Taller, more modern height */
                    shadow-lg
                  "
                  variant="outline"
                >
                  <div className="bg-white p-1 rounded mr-3"> 
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                  </div>
                  <span className="text-sm">Continue with Google</span>
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

                {/* Divider */}
                <div className="flex items-center my-6">
                  {/* Left Line */}
                  <div className="flex-grow border-t border-white/30"></div>
                    <span className="flex-shrink mx-4 text-xs uppercase font-medium text-white/70 tracking-wider">
                      Or
                    </span>                 
                  {/* Right Line */}
                  <div className="flex-grow border-t border-white/30"></div>
                </div>

                {/* Google Button */}
                <Button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="
                    w-full 
                    bg-white/10               /* Semi-transparent background */
                    hover:bg-white/20          /* Slightly brighter on hover */
                    text-white                /* White text to match UI */
                    border-white/20           /* Subtle border */
                    backdrop-blur-md           /* Frosted glass effect */
                    transition-all duration-300
                    font-medium 
                    h-11                       /* Taller, more modern height */
                    shadow-lg
                  "
                  variant="outline"
                >
                  <div className="bg-white p-1 rounded mr-3"> 
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                  </div>
                  <span className="text-sm">Continue with Google</span>
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}