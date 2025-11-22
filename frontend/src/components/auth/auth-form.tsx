'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { authApi } from '@/lib/api'
import { useAuth } from '@/components/providers/auth-provider'
import { LogIn, UserPlus, CloudDrizzle, Zap } from 'lucide-react'

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
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Ambient background effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
                <div className="absolute bottom-20 right-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s', animationDelay: '2s' }} />
            </div>

            <div className="w-full max-w-[520px] px-6 relative z-10">
                {/* Header */}
                <div className="text-center space-y-4 mb-8">
                    <div className="flex items-center justify-center gap-3">
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl" />
                            <CloudDrizzle className="h-12 w-12 text-blue-400 relative" />
                        </div>
                        <h1 className="text-4xl font-bold text-slate-100 tracking-tight">
                            Weatherman
                        </h1>
                    </div>
                    <p className="text-slate-400 text-sm font-medium">
                        Your personal weather intelligence platform
                    </p>
                </div>

                {/* Auth Form Card */}
                <Card className="weather-card border-slate-800 bg-slate-900/50 backdrop-blur-xl overflow-hidden shadow-2xl rounded-3xl mx-auto aspect-square flex flex-col justify-center">
                    <CardHeader className="text-center pb-4 border-b border-slate-800/50 px-8">
                        <CardTitle className="text-2xl font-bold text-slate-100 tracking-tight">
                            {isLogin ? 'Welcome Back' : 'Create Account'}
                        </CardTitle>
                        <CardDescription className="text-slate-400 font-medium text-sm">
                            {isLogin
                                ? 'Sign in to manage your weather alerts'
                                : 'Join to start monitoring weather conditions'
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 px-30">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {!isLogin && (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wide">Name</label>
                                    <Input
                                        type="text"
                                        placeholder="Your full name"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        required={!isLogin}
                                        className=" h-11 text-sm font-medium text-slate-100 bg-slate-800/30 border-slate-700 focus:border-blue-500 placeholder:text-slate-500 px-6"
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-300 uppercase tracking-wide">Email</label>
                                <Input
                                    type="email"
                                    placeholder="your@email.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                    required
                                    className="h-11 text-sm font-medium text-slate-100 bg-slate-800/30 border-slate-700 focus:border-blue-500 placeholder:text-slate-500 px-6"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-300 uppercase tracking-wide">Password</label>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                    required
                                    className="h-11 text-sm font-medium text-slate-100 bg-slate-800/30 border-slate-700 focus:border-blue-500 placeholder:text-slate-500 px-6"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-11 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-semibold border-0 shadow-lg mt-6"
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
                                            <><LogIn className="h-4 w-4 mr-2" /> Sign In</>
                                        ) : (
                                            <><UserPlus className="h-4 w-4 mr-2" /> Create Account</>
                                        )}
                                    </>
                                )}
                            </Button>

                            {authMutation.error && (
                                <div className="bg-red-950/30 backdrop-blur-sm border border-red-900/50 rounded-lg p-3">
                                    <p className="text-sm text-red-300 font-semibold text-center">
                                        {authMutation.error.message || 'Authentication failed'}
                                    </p>
                                </div>
                            )}
                        </form>

                        <div className="mt-6 space-y-3">
                            {/* Quick Demo Login */}
                            <Button
                                variant="outline"
                                className="w-full h-11 bg-slate-800/30 backdrop-blur-sm border-slate-700 hover:bg-slate-700/50 hover:border-slate-600 font-semibold text-slate-200"
                                onClick={handleQuickLogin}
                                disabled={authMutation.isPending}
                            >
                                <Zap className="h-4 w-4 mr-2 text-yellow-400" />
                                Quick Demo Login
                            </Button>

                            {/* Toggle Form Type */}
                            <div className="text-center pt-2">
                                <button
                                    type="button"
                                    className="text-sm text-blue-400 hover:text-blue-300 font-semibold transition-colors"
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
                <p className="text-center text-xs text-slate-500 font-medium mt-6">
                    Powered by Tomorrow.io Weather API
                </p>
            </div>
        </div>
    )
}
