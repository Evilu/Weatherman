# ⚡ Alert System Quick Reference

## 🚀 Getting Started

### Start Everything
```bash
# 1. Start Docker services (Redis + PostgreSQL)
docker-compose up -d

# 2. Start backend
cd backend/application
npm install
npm run dev

# 3. Start frontend
cd frontend
npm install
npm run dev
```

### Verify Alert System is Running
Look for these log messages in the backend:
```
[AlertQueueService] Alert queue service initialized
[NestApplication] Nest application successfully started
```

Every 5 minutes you'll see:
```
[AlertSchedulerService] Scheduled alert processing triggered
[AlertQueueService] Queued job to process all alerts
```

## 📝 Quick Test

### Option 1: Use the Test Script
```bash
cd backend/application
node test-alerts.js
```

### Option 2: Manual API Test
```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:3535/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@email.com","password":"passowrd"}' \
  | jq -r '.access_token')

# 2. Create an alert
ALERT_ID=$(curl -s -X POST http://localhost:3535/api/alerts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "userId": "YOUR_USER_ID",
    "name": "Test Alert",
    "location": {"city": "San Francisco"},
    "parameter": "temperature",
    "operator": "gt",
    "threshold": 15,
    "isActive": true
  }' | jq -r '.id')

# 3. Trigger processing
curl -X POST http://localhost:3535/api/alerts/process \
  -H "Authorization: Bearer $TOKEN"

# 4. Check status (wait 2-3 seconds first)
curl http://localhost:3535/api/alerts/$ALERT_ID \
  -H "Authorization: Bearer $TOKEN" | jq

# 5. View queue stats
curl http://localhost:3535/api/alerts/queue/stats \
  -H "Authorization: Bearer $TOKEN" | jq
```

## 🎯 Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/alerts` | Create new alert |
| `GET` | `/api/alerts?userId={id}` | Get user's alerts |
| `GET` | `/api/alerts/{id}` | Get alert details + history |
| `GET` | `/api/alerts/{id}/status` | Evaluate alert now |
| `POST` | `/api/alerts/{id}/evaluate` | Queue alert evaluation |
| `GET` | `/api/alerts/{id}/forecast-analysis` | 3-day forecast check |
| `POST` | `/api/alerts/process` | Trigger all alerts |
| `GET` | `/api/alerts/queue/stats` | Queue statistics |
| `PUT` | `/api/alerts/{id}` | Update alert |
| `DELETE` | `/api/alerts/{id}` | Delete alert |

## 🔍 Monitoring

### Check if Scheduler is Running
```bash
# Backend logs should show every 5 minutes:
grep "Scheduled alert processing" backend/logs
```

### Check Queue Stats
```bash
curl http://localhost:3535/api/alerts/queue/stats \
  -H "Authorization: Bearer $TOKEN"
```

Expected response:
```json
{
  "waiting": 0,
  "active": 0,
  "completed": 5,
  "failed": 0
}
```

### Check Redis
```bash
docker exec -it weatherman-redis-1 redis-cli

# In redis-cli:
KEYS bull:alert-processing:*
LLEN bull:alert-processing:wait
LLEN bull:alert-processing:active
```

### Check Database
```bash
# View alerts and their statuses
docker exec -it weatherman-db-1 psql -U postgres -d weatherman \
  -c "SELECT id, name, status, \"lastChecked\" FROM alert;"

# View alert history
docker exec -it weatherman-db-1 psql -U postgres -d weatherman \
  -c "SELECT * FROM \"AlertHistory\" ORDER BY \"triggeredAt\" DESC LIMIT 5;"
```

## 🛠️ Configuration

### Change Scheduler Frequency
Edit `src/alert/alert-scheduler.service.ts`:
```typescript
@Cron(CronExpression.EVERY_5_MINUTES)  // Current
@Cron(CronExpression.EVERY_MINUTE)     // Every minute
@Cron('*/2 * * * *')                   // Every 2 minutes
@Cron('0 */1 * * *')                   // Every hour
```

### Adjust Queue Concurrency
Edit `src/alert/alert-queue.service.ts`:
```typescript
this.worker = new Worker(
  'alert-processing',
  async (job) => { ... },
  {
    connection: redisConfig,
    concurrency: 5,  // Change this number
  }
);
```

## 📊 Alert States

| Status | Meaning | Color |
|--------|---------|-------|
| `NOT_TRIGGERED` | Condition not met | Green |
| `TRIGGERED` | Condition currently met | Red |
| `ERROR` | Evaluation failed | Gray |

## 🐛 Troubleshooting

### Alerts Not Triggering

1. **Check Redis is running**:
   ```bash
   docker ps | grep redis
   ```

2. **Check logs for errors**:
   ```bash
   # In backend terminal, look for error messages
   ```

3. **Manually trigger processing**:
   ```bash
   curl -X POST http://localhost:3535/api/alerts/process \
     -H "Authorization: Bearer $TOKEN"
   ```

4. **Check queue stats** - look for high `failed` count

### High Queue Failures

- Check Tomorrow.io API key is valid
- Verify database connection
- Check weather service logs for errors
- Ensure location formats are correct (city or lat/lon)

### Scheduler Not Running

- Verify `ScheduleModule.forRoot()` in `alert.module.ts`
- Check for errors during app startup
- Ensure `AlertSchedulerService` is in providers array

## 📚 Documentation

- **Full Guide**: `ALERT_SYSTEM_GUIDE.md` - Comprehensive documentation
- **Implementation**: `IMPLEMENTATION_SUMMARY.md` - What was built
- **API Docs**: http://localhost:3535/api/docs - Swagger UI

## 💡 Tips

- **Testing**: Create alerts with low thresholds so they trigger easily
- **Monitoring**: Watch backend logs for processing messages
- **Performance**: Queue stats show processing health
- **Debugging**: Use `GET /alerts/{id}/status` for immediate evaluation
- **History**: Alert history shows all past triggers and resolutions

## 🎉 Success Indicators

When working correctly, you should see:

✅ Scheduler logs every 5 minutes
✅ Queue stats showing completed jobs
✅ Alerts with `lastChecked` timestamps
✅ Alert status updating (TRIGGERED/NOT_TRIGGERED)
✅ Alert history entries being created
✅ Frontend showing updated statuses

---

**Need help?** Check `ALERT_SYSTEM_GUIDE.md` for detailed information.

