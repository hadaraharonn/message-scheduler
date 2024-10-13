import RedisApi from '../repositories/redisApi';
import MessageDTO from '../models/messageDTO';
import { MessageHandler } from '../utils/messageHandler';

class MessageService {
  private redisApi: RedisApi;
  private messageHandler: MessageHandler;

  constructor(redisApi: RedisApi, messageHandler: MessageHandler) {
    this.redisApi = redisApi;
    this.messageHandler = messageHandler;
  }

  public async scheduleMessage(message: string, time: string): Promise<void> {
    const timestamp = new Date(time);
    const messageDTO = new MessageDTO(message, timestamp);
    await this.redisApi.addMessageToSortedSet(messageDTO);
  }

  public async processMessages(): Promise<void> {
    const messageDTO = await this.redisApi.popMessage();
    if (messageDTO) {
      const lockAcquired = await this.redisApi.acquireLock(messageDTO.id);
      if (lockAcquired !== null) {
        await this.messageHandler.handleMessage(messageDTO.message);
        await this.redisApi.releaseLock(messageDTO.id, lockAcquired);
        await this.redisApi.deleteMessage(messageDTO.id);
      }
    }
  }
}

export default MessageService;
