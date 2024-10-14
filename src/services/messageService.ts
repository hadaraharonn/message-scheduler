import RedisApi from '../repositories/redisApi';
import MessageDTO from '../models/messageDTO';
import { MessageHandler } from '../utils/messageHandler';
import { config } from '../config';

class MessageService {
  private redisApi: RedisApi;
  private messageHandler: MessageHandler;

  private readonly maxMessageDeletionRetries =
    config.maxMessageDeletionRetries as number;
  private readonly messageProcessingBatchSize =
    config.messageProcessingBatchSize as number;

  constructor(redisApi: RedisApi, messageHandler: MessageHandler) {
    this.redisApi = redisApi;
    this.messageHandler = messageHandler;
  }

  public async scheduleMessage(message: string, time: string): Promise<void> {
    const timestamp = new Date(time);
    const messageDTO = new MessageDTO(message, timestamp);
    try {
      await this.redisApi.addMessageToSortedSet(messageDTO);
    } catch (error) {
      console.error('Failed to schedule message', error);
      throw error;
    }
  }

  public async processMessages(): Promise<void> {
    try {
      const now = Date.now();
      let start = 0;
      let messages: MessageDTO[];

      do {
        messages = await this.redisApi.getMessagesToProcess(
          now,
          this.messageProcessingBatchSize,
          start,
        );
        start += this.messageProcessingBatchSize;
        for (const messageDTO of messages) {
          const lockKey = `lock:${messageDTO.id}`;
          const lockValue = `${Date.now()}:${Math.random()}`;

          const lockAcquired = await this.redisApi.acquireLock(
            lockKey,
            lockValue,
          );
          if (lockAcquired) {
            try {
              await this.messageHandler.handleMessage(messageDTO.message);
              await this.deleteMessageWithRetries(
                messageDTO,
                this.maxMessageDeletionRetries,
              );
            } finally {
              await this.redisApi.releaseLock(lockKey, lockValue);
            }
          }
        }
      } while (messages.length === this.messageProcessingBatchSize);
    } catch (error) {
      console.error('Error processing messages', error);
    }
  }

  private async deleteMessageWithRetries(
    messageDTO: MessageDTO,
    retries: number,
  ): Promise<void> {
    for (let attempt = 1; attempt <= retries; ++attempt) {
      try {
        await this.redisApi.deleteMessage(messageDTO);
        return;
      } catch (error) {
        console.error(
          `Attempt ${attempt} to delete messageId ${messageDTO.id} failed`,
          error,
        );
        if (attempt === retries) throw error;
      }
    }
  }
}

export default MessageService;
