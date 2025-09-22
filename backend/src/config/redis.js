const Redis = require('ioredis');
require('dotenv').config();

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true
});

redis.on('connect', () => {
  console.log('Redis connection established successfully.');
});

redis.on('error', (error) => {
  console.error('Redis connection error:', error);
});

module.exports = redis;