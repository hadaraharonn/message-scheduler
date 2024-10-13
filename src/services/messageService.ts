import RedisApi from '../repositories/redisApi';
import MessageDTO from '../models/messageDTO';

class MessageService {
    private redisApi: RedisApi;

    constructor() {
        this.redisApi = new RedisApi();
    }

    public async scheduleMessage(message: string, time: string): Promise<void> {
        const timestamp = new Date(time);
        const messageDTO = new MessageDTO(message, timestamp);
        await this.redisApi.addMessageToSortedSet(messageDTO);
    }

    public async processMessages(): Promise<void> {
        const messageDTO = await this.redisApi.popMessage();
        if (messageDTO) {
            const lockAcquired = await this.redisApi.acquireLock(messageDTO.message);
            if (lockAcquired) {
                console.log(`Message: ${messageDTO.message}`);
                await this.redisApi.releaseLock(messageDTO.message);
                await this.redisApi.deleteMessage(messageDTO.message);
            }
        }
    }
}

export default MessageService;