#!/bin/bash

# Real-time Notification Test Script
# Tests the complete webhook -> backend -> frontend notification flow

echo "🔧 Testing Weatherman Real-time Notification System"
echo "=================================================="

# Backend URL
BACKEND_URL="http://localhost:3535"
WEBHOOK_URL="$BACKEND_URL/api/webhooks/tomorrow-io"

# Test webhook payload for Holon
WEBHOOK_PAYLOAD='{
  "eventType": "weather_update",
  "location": {
    "lat": 32.0192,
    "lon": 34.7712,
    "city": "Holon"
  },
  "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'",
  "data": {
    "temperature": 15,
    "humidity": 65,
    "windSpeed": 20,
    "precipitationIntensity": 0,
    "cloudCover": 30,
    "visibility": 10
  }
}'

echo ""
echo "1️⃣  Testing Backend Health..."
health_response=$(curl -s "$BACKEND_URL/api/health")
if echo "$health_response" | grep -q "ok"; then
    echo "✅ Backend is running"
else
    echo "❌ Backend is not responding. Start with: npm run dev"
    exit 1
fi

echo ""
echo "2️⃣  Sending test webhook to trigger alert evaluation..."
echo "Webhook URL: $WEBHOOK_URL"
echo "Payload: $WEBHOOK_PAYLOAD"
echo ""

webhook_response=$(curl -s -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "$WEBHOOK_PAYLOAD")

if echo "$webhook_response" | grep -q "ok"; then
    echo "✅ Webhook accepted by backend"
    echo "Response: $webhook_response"
else
    echo "❌ Webhook failed"
    echo "Response: $webhook_response"
    exit 1
fi

echo ""
echo "3️⃣  Check queue statistics..."
# Note: This requires authentication, so we'll just show the command
echo "To check queue stats (requires login):"
echo "curl -H 'Authorization: Bearer <your-jwt-token>' $BACKEND_URL/api/alerts/queue/stats"

echo ""
echo "🎯 NEXT STEPS:"
echo "1. Open frontend: http://localhost:3000"
echo "2. Login to your account"
echo "3. Create an alert for Holon with temperature < 20°C"
echo "4. Run this script again to trigger webhook"
echo "5. Watch for real-time notification in the frontend!"

echo ""
echo "📱 FRONTEND NOTIFICATION CHECKLIST:"
echo "• Bell icon should show notification badge"
echo "• Click bell to see notification panel"
echo "• Browser notification popup (if permissions granted)"
echo "• Real-time update without page refresh"

echo ""
echo "🔍 DEBUGGING:"
echo "• Check browser console for SSE connection logs"
echo "• Verify SSE stream: http://localhost:3535/api/notifications/stream?token=<jwt>"
echo "• Check backend logs for notification service activity"
