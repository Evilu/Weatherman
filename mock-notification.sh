#!/bin/bash

# Mock Notification Test for Weatherman
# This script sends a webhook to trigger real-time notifications

echo "🎯 Weatherman Notification Mock Test"
echo "===================================="

# Backend webhook endpoint
WEBHOOK_URL="http://localhost:3535/api/webhooks/tomorrow-io"

echo ""
echo "📍 Testing Location: Holon"
echo "🌡️  Mock Temperature: 15°C (should trigger alerts with threshold > 15°C)"
echo "🔗 Webhook URL: $WEBHOOK_URL"
echo ""

# Create mock webhook payload that simulates Tomorrow.io sending weather data
# This should trigger any alerts for Holon with temperature thresholds
WEBHOOK_PAYLOAD=$(cat <<EOF
{
  "eventType": "weather_update",
  "location": {
    "city": "Holon",
    "lat": 32.0192,
    "lon": 34.7712
  },
  "data": {
    "temperature": 15,
    "humidity": 65,
    "windSpeed": 20,
    "precipitationIntensity": 0,
    "cloudCover": 30,
    "visibility": 10
  },
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%S.000Z)"
}
EOF
)

echo "📦 Payload:"
echo "$WEBHOOK_PAYLOAD" | jq '.'
echo ""

echo "🚀 Sending webhook..."

# Send the webhook request
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "$WEBHOOK_PAYLOAD")

# Extract HTTP status code
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | sed '$d')

echo ""
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
    echo "✅ Webhook sent successfully!"
    echo "📊 Response: $RESPONSE_BODY"
    echo "🔔 Check your frontend for real-time notifications!"
else
    echo "❌ Webhook failed (HTTP $HTTP_CODE)"
    echo "📊 Response: $RESPONSE_BODY"
fi

echo ""
echo "🎯 EXPECTED RESULTS:"
echo "1. Backend logs should show webhook processing"
echo "2. Alerts matching Holon location will be evaluated"
echo "3. If temperature threshold is met, you'll see:"
echo "   - Real-time notification in frontend notifications panel"
echo "   - Browser notification popup (if permissions granted)"
echo "   - Red badge on notification bell icon"
echo ""
echo "💡 TESTING TIPS:"
echo "• Create an alert for Holon with temperature < 20°C to trigger"
echo "• Watch the notification bell in the top-right corner"
echo "• Check browser console for SSE connection logs"
echo "• Verify alert status updates in the alerts list"
EOF
