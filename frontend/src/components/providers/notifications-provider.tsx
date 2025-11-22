'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useAuth } from './auth-provider'

interface NotificationLocation {
  city?: string
  lat?: number
  lon?: number
}

export interface AlertNotification {
  type: 'alert_triggered' | 'alert_resolved' | 'alert_error'
  alertId: string
  alertName: string
  location: NotificationLocation
  parameter: string
  value: number
  threshold: number
  timestamp: string
}

export function useNotifications() {
  const { user, token } = useAuth()
  const [notifications, setNotifications] = useState<AlertNotification[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const previousAuthRef = useRef<{ user: typeof user, token: string | null }>({ user: null, token: null })

  const addNotification = useCallback((notification: AlertNotification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 9)]) // Keep latest 10 notifications
  }, [])

  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  const removeNotification = useCallback((alertId: string) => {
    setNotifications(prev => prev.filter(n => n.alertId !== alertId))
  }, [])

  // Clear notifications when authentication becomes invalid
  useEffect(() => {
    const wasAuthenticated = previousAuthRef.current.user && previousAuthRef.current.token
    const isAuthenticated = user && token

    if (wasAuthenticated && !isAuthenticated) {
      // Clear notifications when losing authentication
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNotifications([])
    }

    previousAuthRef.current = { user, token }
  }, [user, token])


  useEffect(() => {
    if (!user || !token) {
      return
    }

    let eventSource: EventSource

    const connectToSSE = () => {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3535/api'
      eventSource = new EventSource(`${API_BASE_URL}/notifications/stream?token=${encodeURIComponent(token)}`)

      eventSource.onopen = () => {
        console.log('SSE connection opened')
        setIsConnected(true)
      }

      eventSource.onmessage = (event) => {
        try {
          const notification: AlertNotification = JSON.parse(event.data)
          console.log('Received notification:', notification)
          addNotification(notification)
        } catch (error) {
          console.error('Error parsing notification:', error)
        }
      }

      eventSource.addEventListener('alert_triggered', (event: Event) => {
        try {
          const messageEvent = event as MessageEvent
          const notification: AlertNotification = JSON.parse(messageEvent.data)
          console.log('Alert triggered:', notification)
          addNotification(notification)

          // Show browser notification if permission granted
          if (Notification.permission === 'granted') {
            new Notification(`Alert Triggered: ${notification.alertName}`, {
              body: `${notification.parameter} is ${notification.value} (threshold: ${notification.threshold})`,
              icon: '/favicon.ico',
            })
          }
        } catch (error) {
          console.error('Error handling alert_triggered:', error)
        }
      })

      eventSource.addEventListener('alert_resolved', (event: Event) => {
        try {
          const messageEvent = event as MessageEvent
          const notification: AlertNotification = JSON.parse(messageEvent.data)
          console.log('Alert resolved:', notification)
          addNotification(notification)
        } catch (error) {
          console.error('Error handling alert_resolved:', error)
        }
      })

      eventSource.addEventListener('alert_error', (event: Event) => {
        try {
          const messageEvent = event as MessageEvent
          const notification: AlertNotification = JSON.parse(messageEvent.data)
          console.log('Alert error:', notification)
          addNotification(notification)
        } catch (error) {
          console.error('Error handling alert_error:', error)
        }
      })

      eventSource.onerror = () => {
        console.error('SSE connection error')
        setIsConnected(false)
        // Attempt to reconnect after a delay
        setTimeout(connectToSSE, 5000)
      }
    }

    connectToSSE()

    return () => {
      if (eventSource) {
        console.log('Closing SSE connection')
        eventSource.close()
        setIsConnected(false)
      }
    }
  }, [user, token, addNotification])

  // Request notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          console.log('Notification permission:', permission)
        })
      }
    }
  }, [])

  return {
    notifications,
    isConnected,
    clearNotifications,
    removeNotification,
  }
}
