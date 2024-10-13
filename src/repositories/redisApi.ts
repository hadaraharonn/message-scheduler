import Redis from 'ioredis';
import { config } from '../config';
import MessageDTO from '../models/messageDTO';

class RedisApi {
  private redisClient: Redis.Redis;
  private readonly scheduledMessages = 'scheduledMessages';

  constructor() {
    this.redisClient = new Redis(config.redisUrl);

    this.redisClient.on('error', (err) => {
      console.error('Redis connection error:', err);
    });
  }

  public async addMessageToSortedSet(messageDTO: MessageDTO): Promise<void> {
    try {
      const messageJson = JSON.stringify(messageDTO);
      await this.redisClient.zadd(
        this.scheduledMessages,
        messageDTO.timestamp.getTime().toString(),
        messageJson,
      );
    } catch (error) {
      console.error('Error adding message to sorted set:', error);
      throw error;
    }
  }

  public async popMessage(): Promise<MessageDTO | null> {
    try {
      const now = Date.now();
      const messages = await this.redisClient.zrangebyscore(
        this.scheduledMessages,
        0,
        now,
        'LIMIT',
        0,
        1,
      );

      if (messages.length === 0) {
        return null;
      }

      const messageDTO = JSON.parse(messages[0]) as MessageDTO;
      await this.redisClient.lpush('messageQueue', messages[0]);
      await this.redisClient.zrem(this.scheduledMessages, messages[0]);

      return messageDTO;
    } catch (error) {
      console.error('Error popping message:', error);
      throw error;
    }
  }

  public async acquireLock(message: string): Promise<boolean> {
    try {
      const lockKey = `lock:${message}`;
      const lockAcquired = await this.redisClient.set(
        lockKey,
        'locked',
        'NX',
        'EX',
        60,
      );
      return lockAcquired !== null;
    } catch (error) {
      console.error('Error acquiring lock:', error);
      throw error;
    }
  }

  public async releaseLock(message: string): Promise<void> {
    try {
      const lockKey = `lock:${message}`;
      await this.redisClient.del(lockKey);
    } catch (error) {
      console.error('Error releasing lock:', error);
      throw error;
    }
  }

  public async deleteMessage(message: string): Promise<void> {
    try {
      await this.redisClient.lrem('messageQueue', 1, message);
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }
}

export default RedisApi;
