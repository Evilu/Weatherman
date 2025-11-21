'use client'

import { useRouter } from 'next/navigation'
import { FileQuestion, Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* 404 Card */}
        <div className="weather-card border-slate-800 bg-slate-900/50 backdrop-blur-xl p-8 text-center">
          {/* 404 Icon */}
          <div className="mb-6 flex justify-center">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30">
              <FileQuestion className="h-12 w-12 text-blue-400" />
            </div>
          </div>

          {/* 404 Title */}
          <div className="mb-2">
            <span className="text-6xl font-bold text-slate-700">404</span>
          </div>
          
          <h1 className="text-2xl font-bold text-slate-100 mb-2">
            Page Not Found
          </h1>

          {/* Error Message */}
          <p className="text-slate-400 text-sm mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => router.back()}
              className="w-full h-11 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-semibold border-0 shadow-lg"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
            
            <Button
              onClick={() => router.push('/')}
              variant="outline"
              className="w-full h-11 bg-slate-800/30 backdrop-blur-sm border-slate-700 hover:bg-slate-700/50 hover:border-slate-600 font-semibold text-slate-200"
            >
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
