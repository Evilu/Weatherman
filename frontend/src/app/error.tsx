'use client'

import { useEffect } from 'react'
import { AlertCircle, RefreshCcw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Error Card */}
        <div className="weather-card border-slate-800 bg-slate-900/50 backdrop-blur-xl p-8 text-center">
          {/* Error Icon */}
          <div className="mb-6 flex justify-center">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30">
              <AlertCircle className="h-12 w-12 text-red-400" />
            </div>
          </div>

          {/* Error Title */}
          <h1 className="text-2xl font-bold text-slate-100 mb-2">
            Something went wrong
          </h1>

          {/* Error Message */}
          <p className="text-slate-400 text-sm mb-6">
            {error.message || 'A client-side exception has occurred. Please try again.'}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={reset}
              className="w-full h-11 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-semibold border-0 shadow-lg"
            >
              <RefreshCcw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            
            <Button
              onClick={() => window.location.href = '/'}
              variant="outline"
              className="w-full h-11 bg-slate-800/30 backdrop-blur-sm border-slate-700 hover:bg-slate-700/50 hover:border-slate-600 font-semibold text-slate-200"
            >
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </div>

          {/* Error Details (Development Only) */}
          {process.env.NODE_ENV === 'development' && error.digest && (
            <div className="mt-6 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <p className="text-xs text-slate-500 font-mono">
                Error ID: {error.digest}
              </p>
            </div>
          )}
        </div>

        {/* Help Text */}
        <p className="text-center text-xs text-slate-500 mt-4">
          If the problem persists, please contact support
        </p>
      </div>
    </div>
  )
}
