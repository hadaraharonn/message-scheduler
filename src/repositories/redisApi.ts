import Redis from 'ioredis';
import { config } from '../config';
import MessageDTO from '../models/messageDTO';

class RedisApi {
  private redisClient: Redis.Redis;
  private readonly sortedScheduledMessages = 'scheduledMessages';
  private readonly inProcessMessageQueue = 'messageQueue';

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
        this.sortedScheduledMessages,
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
        this.sortedScheduledMessages,
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

      const transaction = this.redisClient.multi();
      transaction.lpush(this.inProcessMessageQueue, messages[0]);
      transaction.zrem(this.sortedScheduledMessages, messages[0]);

      await transaction.exec();

      return messageDTO;
    } catch (error) {
      console.error('Error popping message:', error);
      throw error;
    }
  }

  public async acquireLock(id: string): Promise<string | null> {
    try {
      const lockKey = `lock:${id}`;
      const lockValue = `${Date.now()}-${Math.random()}`;
      const lockAcquired = await this.redisClient.set(
        lockKey,
        lockValue,
        'NX',
        'EX',
        config.redisLockExpiration,
      );
      return lockAcquired ? lockValue : null;
    } catch (error) {
      console.error('Error acquiring lock:', error);
      throw error;
    }
  }

  public async releaseLock(id: string, lockValue: string): Promise<void> {
    try {
      const lockKey = `lock:${id}`;
      const currentValue = await this.redisClient.get(lockKey);
      if (currentValue === lockValue) {
        await this.redisClient.del(lockKey);
      }
    } catch (error) {
      console.error('Error releasing lock:', error);
      throw error;
    }
  }

  public async deleteMessage(id: string): Promise<void> {
    try {
      await this.redisClient.lrem(this.inProcessMessageQueue, 1, id);
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }
}

export default RedisApi;
