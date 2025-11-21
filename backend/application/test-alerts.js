#!/usr/bin/env node

/**
 * Alert System Test Script
 *
 * This script tests the alert triggering system by:
 * 1. Creating a test alert
 * 2. Manually triggering alert processing
 * 3. Checking the alert status
 * 4. Viewing queue statistics
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3535/api';
const TEST_USER = {
  email: "test@test.com",
  password: '6511665',
};

let authToken = '';
let userId = '';
let testAlertId = '';

async function login() {
  console.log('🔐 Logging in...');
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, TEST_USER);
    authToken = response.data.access_token;
    userId = response.data.user.id;
    console.log('✅ Logged in successfully');
    console.log(`   User ID: ${userId}`);
    return true;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    return false;
  }
}

async function createTestAlert() {
  console.log('\n📝 Creating test alert...');
  try {
    const alertData = {
      userId: userId,
      name: 'Test Temperature Alert',
      location: { city: 'San Francisco' },
      parameter: 'temperature',
      operator: 'gt',
      threshold: 15, // Low threshold so it will likely trigger
      isActive: true,
    };

    const response = await axios.post(`${BASE_URL}/alerts`, alertData, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    testAlertId = response.data.id;
    console.log('✅ Alert created successfully');
    console.log(`   Alert ID: ${testAlertId}`);
    console.log(`   Name: ${response.data.name}`);
    console.log(`   Location: ${response.data.location.city}`);
    console.log(`   Condition: ${response.data.parameter} ${response.data.operator} ${response.data.threshold}`);
    return true;
  } catch (error) {
    console.error('❌ Alert creation failed:', error.response?.data || error.message);
    return false;
  }
}

async function triggerAlertProcessing() {
  console.log('\n⚙️  Triggering alert processing...');
  try {
    const response = await axios.post(`${BASE_URL}/alerts/process`, {}, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    console.log('✅ Alert processing triggered');
    console.log(`   ${response.data.message}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to trigger processing:', error.response?.data || error.message);
    return false;
  }
}

async function checkAlertStatus() {
  console.log('\n🔍 Checking alert status...');
  try {
    // Wait a bit for the queue to process
    await new Promise(resolve => setTimeout(resolve, 2000));

    const response = await axios.get(`${BASE_URL}/alerts/${testAlertId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    const alert = response.data;
    console.log('✅ Alert status retrieved');
    console.log(`   Status: ${alert.status}`);
    console.log(`   Last Checked: ${alert.lastChecked || 'Never'}`);
    console.log(`   History Entries: ${alert.history?.length || 0}`);

    if (alert.history && alert.history.length > 0) {
      console.log('\n   Recent History:');
      alert.history.slice(0, 3).forEach((entry, i) => {
        console.log(`   ${i + 1}. ${entry.status} at ${new Date(entry.triggeredAt).toLocaleString()}`);
      });
    }

    return true;
  } catch (error) {
    console.error('❌ Failed to check status:', error.response?.data || error.message);
    return false;
  }
}

async function getQueueStats() {
  console.log('\n📊 Queue Statistics:');
  try {
    const response = await axios.get(`${BASE_URL}/alerts/queue/stats`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    const stats = response.data;
    console.log(`   Waiting: ${stats.waiting}`);
    console.log(`   Active: ${stats.active}`);
    console.log(`   Completed: ${stats.completed}`);
    console.log(`   Failed: ${stats.failed}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to get queue stats:', error.response?.data || error.message);
    return false;
  }
}

async function evaluateAlertDirectly() {
  console.log('\n🎯 Directly evaluating alert (immediate)...');
  try {
    const response = await axios.get(`${BASE_URL}/alerts/${testAlertId}/status`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    console.log('✅ Alert evaluated');
    console.log(`   Triggered: ${response.data.triggered}`);
    console.log(`   Current Value: ${response.data.value}`);
    console.log(`   Threshold: ${response.data.threshold}`);
    console.log(`   Parameter: ${response.data.parameter}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to evaluate alert:', error.response?.data || error.message);
    return false;
  }
}

async function checkUserAlerts() {
  console.log('\n📋 Checking your existing alerts...');
  try {
    const response = await axios.get(`${BASE_URL}/alerts?userId=${userId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    const alerts = response.data;
    console.log(`\n✅ Found ${alerts.length} alert(s)\n`);

    for (const alert of alerts) {
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`📍 ${alert.name}`);
      console.log(`   Location: ${alert.location.city || `${alert.location.lat}, ${alert.location.lon}`}`);
      console.log(`   Condition: ${alert.parameter} ${alert.operator} ${alert.threshold}`);
      console.log(`   Status: ${alert.status || 'NOT_TRIGGERED'}`);
      console.log(`   Active: ${alert.isActive ? 'Yes' : 'No'}`);
      console.log(`   Last Checked: ${alert.lastChecked ? new Date(alert.lastChecked).toLocaleString() : 'Never'}`);

      // Get forecast analysis
      try {
        const forecastResponse = await axios.get(`${BASE_URL}/alerts/${alert.id}/forecast-analysis`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        const forecast = forecastResponse.data;
        console.log(`\n   📊 3-Day Forecast Analysis:`);

        const triggeredTimes = forecast.filter(f => f.willTrigger);
        if (triggeredTimes.length > 0) {
          console.log(`   ⚠️  Alert will trigger ${triggeredTimes.length} time(s):`);
          triggeredTimes.slice(0, 5).forEach(f => {
            console.log(`      • ${new Date(f.time).toLocaleString()} - ${f.parameter}: ${f.value.toFixed(1)}`);
          });
        } else {
          console.log(`   ✅ Alert will NOT trigger in the next 3 days`);
        }
      } catch (error) {
        console.log(`   ⚠️  Could not fetch forecast analysis`);
      }

      console.log('');
    }

    return alerts;
  } catch (error) {
    console.error('❌ Failed to check user alerts:', error.response?.data || error.message);
    return [];
  }
}

async function cleanUp() {
  console.log('\n🧹 Cleaning up test alert...');
  try {
    await axios.delete(`${BASE_URL}/alerts/${testAlertId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    console.log('✅ Test alert deleted');
    return true;
  } catch (error) {
    console.error('❌ Failed to delete alert:', error.response?.data || error.message);
    return false;
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════');
  console.log('   🌤️  ALERT SYSTEM TEST SCRIPT  🌤️');
  console.log('═══════════════════════════════════════════════\n');

  // Check if backend is running by trying to connect to the base URL
  try {
    // Try to access the API - any endpoint will do, just checking connectivity
    await axios.get(`${BASE_URL.replace('/api', '')}/api/docs-json`, { timeout: 3000 });
  } catch (error) {
    // If we get a timeout or connection refused, backend is definitely not running
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      console.error('❌ Backend is not running at', BASE_URL);
      console.error('   Please start the backend first: npm run dev');
      process.exit(1);
    }
    // Other errors (like 404) are fine - it means the server is running
  }

  // Run tests
  if (!await login()) return;

  // Show existing alerts first
  await checkUserAlerts();

  console.log('\n═══════════════════════════════════════════════');
  console.log('   ✅ Alert check completed!');
  console.log('═══════════════════════════════════════════════\n');
}

main().catch(console.error);

