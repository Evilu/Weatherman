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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            <Cloud className="h-10 w-10 text-blue-600 weather-icon" />
            <h1 className="text-4xl font-bold text-gray-800 tracking-tight">Weatherman</h1>
          </div>
          <p className="text-gray-700 text-lg">Your personal weather alert system</p>
        </div>

        {/* Auth Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </CardTitle>
            <CardDescription className="text-center">
              {isLogin
                ? 'Sign in to manage your weather alerts'
                : 'Join to start monitoring weather conditions'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    type="text"
                    placeholder="Your full name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required={!isLogin}
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={authMutation.isPending}
              >
                {authMutation.isPending ? (
                  'Please wait...'
                ) : (
                  <>
                    {isLogin ? (
                      <><LogIn className="h-4 w-4 mr-2" /> Sign In</>
                    ) : (
                      <><UserPlus className="h-4 w-4 mr-2" /> Create Account</>
                    )}
                  </>
                )}
              </Button>

              {authMutation.error && (
                <p className="text-sm text-red-600 text-center">
                  {authMutation.error.message || 'Authentication failed'}
                </p>
              )}
            </form>

            <div className="mt-6 space-y-4">
              {/* Quick Demo Login */}
              <Button
                variant="outline"
                className="w-full"
                onClick={handleQuickLogin}
                disabled={authMutation.isPending}
              >
                🚀 Quick Demo Login
              </Button>

              {/* Toggle Form Type */}
              <div className="text-center">
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:underline"
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
      </div>
    </div>
  )
}
