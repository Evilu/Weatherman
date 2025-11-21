# Alert Triggering System - Implementation Guide

## Overview

The alert triggering system has been fully implemented with the following components:

### 1. **Alert Queue Service** (`alert-queue.service.ts`)
- Uses **BullMQ** for robust, Redis-backed job queue
- Processes alerts asynchronously in the background
- Handles two types of jobs:
  - `process-all-alerts`: Evaluates all active alerts
  - `evaluate-single-alert`: Evaluates a specific alert
- Includes automatic job retry and error handling
- Provides queue statistics endpoint

### 2. **Alert Scheduler Service** (`alert-scheduler.service.ts`)
- Uses **NestJS Schedule** module with cron jobs
- **Automatically runs every 5 minutes** to check all active alerts
- Can be configured for more frequent checks during business hours
- Queues alert processing jobs to avoid blocking

### 3. **Enhanced Alert Controller** (`alert.controller.ts`)
New endpoints added:
- `POST /api/alerts/process` - Manually trigger alert processing for all active alerts
- `POST /api/alerts/:id/evaluate` - Queue immediate evaluation of a specific alert
- `GET /api/alerts/queue/stats` - Get queue processing statistics

### 4. **Updated Webhook Controller** (`webhook.controller.ts`)
- Now uses the queue service to process webhook events
- Prevents blocking on webhook requests from Tomorrow.io

## How Alerts Are Triggered

### Automatic (Scheduled)
1. **Every 5 minutes**, the scheduler triggers `scheduleAlertProcessing()`
2. This queues a job to process all active alerts
3. The queue worker picks up the job and calls `alertService.processAlerts()`
4. The service:
   - Fetches all active alerts from the database
   - Groups them by location for efficient batch processing
   - Fetches current weather data for each location
   - Evaluates each alert's condition
   - Updates alert status and creates history entries when triggered

### Manual Triggers

#### Via API Endpoints
```bash
# Trigger processing of all alerts
curl -X POST http://localhost:3535/api/alerts/process \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Trigger evaluation of a specific alert
curl -X POST http://localhost:3535/api/alerts/{alertId}/evaluate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Check queue statistics
curl http://localhost:3535/api/alerts/queue/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Via Webhooks
When Tomorrow.io sends a webhook (weather update or alert trigger):
1. The webhook controller validates the signature
2. Finds all matching alerts for that location
3. Queues individual evaluation jobs for each matching alert
4. Returns immediately (non-blocking)

### Alert Evaluation Logic

Each alert is evaluated using the `evaluateCondition()` method:
- Compares the current weather parameter value against the threshold
- Supports operators: `gt` (>), `gte` (≥), `lt` (<), `lte` (≤), `eq` (=)
- Examples:
  - Temperature > 30°C
  - Wind Speed < 10 km/h
  - Humidity ≥ 80%

### Status Transitions

Alerts can have three statuses:
- **NOT_TRIGGERED**: Condition is not met
- **TRIGGERED**: Condition is currently met
- **ERROR**: Error occurred during evaluation

When an alert status changes:
1. The alert's `status` field is updated
2. The `lastChecked` timestamp is set
3. An entry is created in `AlertHistory` table
4. When resolved, the history entry's `resolvedAt` is set

## Configuration

### Environment Variables

Add to `/backend/application/.env`:
```env
REDIS_URL=redis://localhost:6379
```

### Scheduler Frequency

To change how often alerts are checked, edit `alert-scheduler.service.ts`:

```typescript
// Current: Every 5 minutes
@Cron(CronExpression.EVERY_5_MINUTES)

// Other options:
@Cron(CronExpression.EVERY_MINUTE)           // Every minute
@Cron(CronExpression.EVERY_10_MINUTES)        // Every 10 minutes
@Cron('*/2 * * * *')                          // Every 2 minutes
@Cron('*/2 6-22 * * *')                       // Every 2 min, 6 AM - 10 PM only
```

## Testing

### 1. Start Required Services

Make sure Docker services are running:
```bash
docker-compose up redis db -d
```

### 2. Start the Backend

```bash
cd backend/application
npm run dev
```

You should see logs indicating:
- Alert queue service initialized
- Scheduler starting periodic checks

### 3. Create a Test Alert

Use the frontend or API:
```bash
curl -X POST http://localhost:3535/api/alerts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "userId": "your-user-id",
    "name": "High Temperature Alert",
    "location": { "city": "San Francisco" },
    "parameter": "temperature",
    "operator": "gt",
    "threshold": 20,
    "isActive": true
  }'
```

### 4. Monitor Alert Processing

Watch the backend logs for:
```
[AlertSchedulerService] Scheduled alert processing triggered
[AlertQueueService] Queued job to process all alerts
[AlertQueueService] Processing job 1: process-all-alerts
[AlertService] Processing all active alerts...
[AlertService] Found 1 active alerts to process
[AlertService] Alert {id} TRIGGERED (or not triggered based on weather)
```

### 5. Check Alert Status

```bash
# Get alert details including status
curl http://localhost:3535/api/alerts/{alertId} \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Manually evaluate an alert
curl http://localhost:3535/api/alerts/{alertId}/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 6. View Queue Statistics

```bash
curl http://localhost:3535/api/alerts/queue/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Frontend Integration

The frontend components are already set up to display alert statuses:

- `alerts-list.tsx` - Shows alerts with their current status (TRIGGERED/NOT_TRIGGERED)
- Status icons and colors automatically update
- History entries show when alerts were triggered and resolved

## Troubleshooting

### Alerts Not Being Processed

1. **Check Redis is running**:
   ```bash
   docker ps | grep redis
   redis-cli ping  # Should return PONG
   ```

2. **Check scheduler logs**:
   Look for `[AlertSchedulerService] Scheduled alert processing triggered` every 5 minutes

3. **Check queue stats**:
   ```bash
   curl http://localhost:3535/api/alerts/queue/stats -H "Authorization: Bearer YOUR_JWT"
   ```

4. **Manually trigger processing**:
   ```bash
   curl -X POST http://localhost:3535/api/alerts/process -H "Authorization: Bearer YOUR_JWT"
   ```

### Alerts Stuck in Queue

Check queue stats - if `failed` count is high:
1. Check backend logs for error messages
2. Verify weather API key is valid
3. Check database connectivity

### Alert Status Not Updating

1. Verify the alert is `isActive: true`
2. Check that the weather parameter name matches what the API returns
3. Manually evaluate: `GET /api/alerts/{id}/status`
4. Check alert history: alerts include `history` array showing all triggers

## Next Steps / Enhancements

### Potential Improvements:
1. **Real-time notifications**: Add WebSocket support to push alerts to connected clients
2. **Email/SMS notifications**: Integrate with SendGrid, Twilio, or similar
3. **Alert cooldown**: Prevent spam by adding cooldown periods between notifications
4. **Forecast-based pre-alerts**: Warn users before conditions are expected
5. **Alert analytics**: Dashboard showing trigger frequency, patterns, etc.

## Architecture Summary

```
┌─────────────────────────────────────────────────────────┐
│                   Alert Triggering Flow                  │
└─────────────────────────────────────────────────────────┘

  ┌──────────────┐         Every 5 min
  │  Scheduler   │─────────────────────┐
  └──────────────┘                     │
                                       ▼
  ┌──────────────┐              ┌──────────┐
  │  Webhooks    │─────────────>│  Queue   │
  └──────────────┘              └──────────┘
                                      │
  ┌──────────────┐                    │
  │ Manual API   │────────────────────┘
  └──────────────┘                    │
                                      ▼
                              ┌───────────────┐
                              │ Queue Worker  │
                              └───────────────┘
                                      │
                                      ▼
                          ┌────────────────────────┐
                          │  Alert Service         │
                          │  - Fetch weather data  │
                          │  - Evaluate conditions │
                          │  - Update statuses     │
                          │  - Create history      │
                          └────────────────────────┘
                                      │
                          ┌───────────┴───────────┐
                          ▼                       ▼
                    ┌──────────┐          ┌──────────────┐
                    │ Database │          │ Weather API  │
                    └──────────┘          └──────────────┘
```

## Summary

✅ **Alert processing now works automatically** - alerts are checked every 5 minutes
✅ **Queue-based system** - robust, scalable, with retry logic
✅ **Multiple trigger methods** - scheduled, webhooks, manual API calls
✅ **Status tracking** - alerts update status and maintain history
✅ **No code changes needed in frontend** - already displaying statuses correctly

The `processAlerts()` method is now being called regularly by the scheduler, and alerts will trigger based on actual weather conditions!

