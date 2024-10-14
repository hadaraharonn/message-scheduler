import Redis from 'ioredis';
import MessageDTO from '../models/messageDTO';
import { config } from '../config';

class RedisApi {
  private redisClient: Redis;
  private readonly sortedScheduledMessages = 'scheduledMessages';

  constructor() {
    this.redisClient = new Redis({
      host: config.redisUrl,
      port: config.redisPort as number,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    this.redisClient.on('error', (err: Error) => {
      console.error('Redis connection error:', err);
    });
  }

  public async addMessageToSortedSet(messageDTO: MessageDTO): Promise<void> {
    try {
      await this.redisClient.zadd(
        this.sortedScheduledMessages,
        messageDTO.timestamp.getTime(),
        JSON.stringify(messageDTO),
      );
    } catch (error) {
      console.error('Error adding message to sorted set', error);
      throw error;
    }
  }

  public async getMessagesToProcess(
    timestamp: number,
    batchSize: number,
    start: number = 0,
  ): Promise<MessageDTO[]> {
    try {
      const messages = await this.redisClient.zrangebyscore(
        this.sortedScheduledMessages,
        0,
        timestamp,
        'LIMIT',
        start,
        batchSize,
      );
      return messages.map((message) => JSON.parse(message) as MessageDTO);
    } catch (error) {
      console.error('Error getting messages to process', error);
      throw error;
    }
  }

  public async deleteMessage(messageDTO: MessageDTO): Promise<void> {
    try {
      await this.redisClient.zrem(
        this.sortedScheduledMessages,
        JSON.stringify(messageDTO),
      );
    } catch (error) {
      console.error('Error deleting message', error);
      throw error;
    }
  }

  public async acquireLock(key: string, value: string): Promise<boolean> {
    try {
      const result = await this.redisClient.set(
        key,
        value,
        'PX',
        config.redisLockExpirationMs,
        'NX',
      );

      return result === 'OK';
    } catch (error) {
      console.error('Error acquiring lock', error);
      throw error;
    }
  }

  public async releaseLock(key: string, value: string): Promise<void> {
    try {
      const currentValue = await this.redisClient.get(key);
      if (currentValue === value) await this.redisClient.del(key);
    } catch (error) {
      console.error('Error releasing lock', error);
      throw error;
    }
  }
}

export default RedisApi;
