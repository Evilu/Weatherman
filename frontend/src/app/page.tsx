'use client'

import { useAuth } from '@/components/providers/auth-provider'
import AuthForm from '@/components/auth/auth-form'
import Dashboard from '@/components/dashboard/dashboard'

export default function Home() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <AuthForm />
  }

  return <Dashboard />
}
