export const config = {
  redisUrl: process.env.REDIS_URL || 'localhost',
  redisPort: process.env.REDIS_PORT || 6379,
  port: process.env.PORT || 3000,
  messagePollingIntervalMs: process.env.MESSAGE_POLLING_INTERVAL || 1000,
  redisLockExpirationMs: process.env.LOCK_EXPIRATION || 60000,
  maxMessageDeletionRetries: process.env.MAX_MESSAGE_DELETION_RETRIES || 3,
  messageProcessingBatchSize: process.env.MESSAGE_PROCESSING_BATCH_SIZE || 10,
};
