'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { authApi } from '@/lib/api'
import { useAuth } from '@/components/providers/auth-provider'
import { LogIn, UserPlus, Cloud } from 'lucide-react'

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  })
  const { login } = useAuth()

  const authMutation = useMutation({
    mutationFn: async () => {
      if (isLogin) {
        const response = await authApi.login(formData.email, formData.password)
        return response.data
      } else {
        const response = await authApi.register(formData.email, formData.name, formData.password)
        return response.data
      }
    },
    onSuccess: (data) => {
      if (data.access_token && data.user) {
        login(data.user, data.access_token)
      }
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    authMutation.mutate()
  }

  // Quick login for demo purposes
  const handleQuickLogin = () => {
    setFormData({
      email: 'admin@email.com',
      password: 'passowrd', // Note: this matches the seeded user password
      name: '',
    })
    setIsLogin(true)
    // Auto-submit after setting values
    setTimeout(() => {
      authMutation.mutate()
    }, 100)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Decorative atmospheric elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-white/20 rounded-full blur-3xl animate-float-bob" style={{ animationDelay: '0s' }} />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-sky-200/30 rounded-full blur-3xl animate-float-bob" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-36 h-36 bg-blue-200/20 rounded-full blur-3xl animate-float-bob" style={{ animationDelay: '2s' }} />
      </div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center space-y-4 stagger-fade-in">
          <div className="flex items-center justify-center gap-4">
            <div className="relative">
              <Cloud className="h-14 w-14 text-sky-500 weather-icon" />
              <div className="absolute -top-2 -right-2 h-4 w-4 bg-amber-400 rounded-full animate-pulse shadow-lg shadow-amber-400/50" />
            </div>
            <h1 className="text-5xl font-bold text-slate-800 tracking-tighter">
              Weatherman
            </h1>
          </div>
          <p className="text-slate-600 text-lg font-medium">
            Your personal weather intelligence platform
          </p>
        </div>

        {/* Auth Form */}
        <Card className="weather-card border-0 overflow-hidden stagger-fade-in" style={{ animationDelay: '0.1s' }}>
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-slate-800 tracking-tight">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </CardTitle>
            <CardDescription className="text-slate-600 font-medium">
              {isLogin
                ? 'Sign in to manage your weather alerts'
                : 'Join to start monitoring weather conditions'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Name</label>
                  <Input
                    type="text"
                    placeholder="Your full name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required={!isLogin}
                    className="weather-input h-12 text-base font-medium"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Email</label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  className="weather-input h-12 text-base font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                  className="weather-input h-12 text-base font-medium"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 weather-button text-base"
                disabled={authMutation.isPending}
              >
                {authMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <>
                    {isLogin ? (
                      <><LogIn className="h-5 w-5 mr-2" /> Sign In</>
                    ) : (
                      <><UserPlus className="h-5 w-5 mr-2" /> Create Account</>
                    )}
                  </>
                )}
              </Button>

              {authMutation.error && (
                <div className="bg-red-50/80 backdrop-blur-sm border-2 border-red-300 rounded-lg p-3 animate-stagger-fade-in">
                  <p className="text-sm text-red-700 font-semibold text-center">
                    {authMutation.error.message || 'Authentication failed'}
                  </p>
                </div>
              )}
            </form>

            <div className="mt-6 space-y-4">
              {/* Quick Demo Login */}
              <Button
                variant="outline"
                className="w-full h-12 bg-white/40 backdrop-blur-sm border-2 border-white/50 hover:bg-white/60 font-bold text-slate-700"
                onClick={handleQuickLogin}
                disabled={authMutation.isPending}
              >
                <span className="mr-2">🚀</span> Quick Demo Login
              </Button>

              {/* Toggle Form Type */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  className="text-sm text-sky-600 hover:text-sky-700 font-bold underline-offset-4 hover:underline transition-all"
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin
                    ? "Don't have an account? Sign up"
                    : "Already have an account? Sign in"
                  }
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer note */}
        <p className="text-center text-sm text-slate-600 font-medium stagger-fade-in" style={{ animationDelay: '0.2s' }}>
          Powered by Tomorrow.io Weather API
        </p>
      </div>
    </div>
  )
}
