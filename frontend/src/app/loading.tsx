import { CloudDrizzle } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="text-center">
        {/* Animated Icon */}
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" />
            <div className="relative p-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-emerald-500/20 border border-blue-500/30">
              <CloudDrizzle className="h-12 w-12 text-blue-400 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Loading Text */}
        <h2 className="text-xl font-bold text-slate-200 mb-2">
          Loading Weatherman
        </h2>
        <p className="text-sm text-slate-400">
          Please wait a moment...
        </p>

        {/* Loading Dots */}
        <div className="flex justify-center gap-2 mt-6">
          <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}
