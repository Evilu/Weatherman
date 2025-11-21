'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCcw } from 'lucide-react'

export default function GlobalError({
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
    <html>
      <body>
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            {/* Error Icon */}
            <div className="mb-6 flex justify-center">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30">
                <AlertTriangle className="h-16 w-16 text-red-400" />
              </div>
            </div>

            {/* Error Title */}
            <h1 className="text-3xl font-bold text-slate-100 mb-3">
              Critical Error
            </h1>

            {/* Error Message */}
            <p className="text-slate-400 text-base mb-8 px-4">
              The application encountered a critical error. Please refresh the page to continue.
            </p>

            {/* Action Button */}
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              <RefreshCcw className="h-5 w-5" />
              Refresh Page
            </button>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-8 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 text-left">
                <p className="text-xs text-slate-500 font-mono break-all">
                  {error.message}
                </p>
                {error.digest && (
                  <p className="text-xs text-slate-600 font-mono mt-2">
                    Error ID: {error.digest}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </body>
    </html>
  )
}
