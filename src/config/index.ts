export const config = {
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  port: process.env.PORT || 3000,
  messagePollingInterval: process.env.MESSAGE_POLLING_INTERVAL || 1000,
  redisLockExpiration: process.env.LOCK_EXPIRATION || 60
};