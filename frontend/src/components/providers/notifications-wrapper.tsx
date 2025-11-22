'use client'

import { useAuth } from './auth-provider'
import { useNotifications } from './notifications-provider'

export function NotificationsWrapper({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()

  // Hook is called to initialize the notification connection when user is logged in
  useNotifications()

  return <>{children}</>
}
