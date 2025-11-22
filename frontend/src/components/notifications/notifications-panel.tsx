'use client'

import { useState } from 'react'
import { Bell, BellOff, X, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useNotifications, AlertNotification } from '@/components/providers/notifications-provider'
import { cn } from '@/lib/utils'

const NOTIFICATION_ICONS = {
  alert_triggered: AlertTriangle,
  alert_resolved: CheckCircle,
  alert_error: XCircle,
}

const NOTIFICATION_COLORS = {
  alert_triggered: 'text-red-500 bg-red-50 border-red-200',
  alert_resolved: 'text-green-500 bg-green-50 border-green-200',
  alert_error: 'text-orange-500 bg-orange-50 border-orange-200',
}

function NotificationItem({
  notification,
  onRemove
}: {
  notification: AlertNotification
  onRemove: (alertId: string) => void
}) {
  const Icon = NOTIFICATION_ICONS[notification.type]
  const colorClass = NOTIFICATION_COLORS[notification.type]

  const formatTime = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString()
    } catch {
      return 'Unknown time'
    }
  }

  const getNotificationMessage = () => {
    switch (notification.type) {
      case 'alert_triggered':
        return `${notification.parameter} reached ${notification.value} (threshold: ${notification.threshold})`
      case 'alert_resolved':
        return `Conditions returned to normal: ${notification.parameter} is ${notification.value}`
      case 'alert_error':
        return 'Error occurred while checking alert conditions'
      default:
        return 'Alert status changed'
    }
  }

  const getLocationText = () => {
    if (notification.location?.city) {
      return notification.location.city
    }
    if (notification.location?.lat && notification.location?.lon) {
      return `${notification.location.lat.toFixed(2)}, ${notification.location.lon.toFixed(2)}`
    }
    return 'Unknown location'
  }

  return (
    <Card className={cn('mb-2 border transition-all duration-200 hover:shadow-md', colorClass)}>
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <h4 className="font-medium text-sm truncate">{notification.alertName}</h4>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-white/50"
                onClick={() => onRemove(notification.alertId)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-600 mb-1">{getNotificationMessage()}</p>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{getLocationText()}</span>
              <span>{formatTime(notification.timestamp)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function NotificationsPanel() {
  const { notifications, isConnected, clearNotifications, removeNotification } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)
  const [lastOpenedCount, setLastOpenedCount] = useState(0)

  // Derive hasUnread state instead of setting it in useEffect
  const hasUnread = notifications.length > lastOpenedCount

  const handleTogglePanel = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      // Mark as read when opened by updating the last opened count
      setLastOpenedCount(notifications.length)
    }
  }

  const handleClearAll = () => {
    clearNotifications()
    setLastOpenedCount(0) // Reset count when cleared
  }

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <Button
        variant="ghost"
        size="sm"
        className="relative"
        onClick={handleTogglePanel}
      >
        {isConnected ? (
          <Bell className="w-5 h-5" />
        ) : (
          <BellOff className="w-5 h-5 text-gray-400" />
        )}
        {hasUnread && notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {notifications.length > 9 ? '9+' : notifications.length}
          </span>
        )}
      </Button>

      {/* Notifications Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-96 bg-white border rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="p-3 border-b bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-sm">Notifications</h3>
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  isConnected ? "bg-green-500" : "bg-red-500"
                )} />
              </div>
              <div className="flex items-center gap-1">
                {notifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAll}
                    className="text-xs px-2 h-6"
                  >
                    Clear All
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {isConnected ? 'Connected to live alerts' : 'Disconnected from live alerts'}
            </p>
          </div>

          <div className="max-h-72 overflow-y-auto p-3">
            {notifications.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No notifications yet</p>
                <p className="text-xs">You&apos;ll see real-time alerts here</p>
              </div>
            ) : (
              <div>
                {notifications.map((notification, index) => (
                  <NotificationItem
                    key={`${notification.alertId}-${notification.timestamp}-${index}`}
                    notification={notification}
                    onRemove={removeNotification}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
