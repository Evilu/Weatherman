/**
 * JWT Token Generator for Testing Notifications
 *
 * This script generates a valid JWT token for testing the SSE notifications endpoint
 */

const jwt = require('jsonwebtoken');

// Default JWT secret (should match backend configuration)
const JWT_SECRET = process.env.JWT_SECRET || 'weatherman-secret';

// Mock user data
const mockUser = {
  id: 'test-user-123',
  sub: 'test-user-123', // Some JWT libraries use 'sub' for user ID
  email: 'test@example.com',
  name: 'Test User',
};

// Generate token
const token = jwt.sign(mockUser, JWT_SECRET, {
  expiresIn: '1h'
});

console.log('🎫 Generated JWT Token for Testing:');
console.log('=====================================');
console.log(token);
console.log('');
console.log('🔧 Test SSE Connection:');
console.log(`curl -v "http://localhost:3535/api/notifications/stream?token=${token}"`);
console.log('');
console.log('👤 Mock User Data:');
console.log(JSON.stringify(mockUser, null, 2));
console.log('');
console.log('⏰ Token expires in 1 hour');
