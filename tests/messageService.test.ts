import MessageService from '../src/services/messageService';
import RedisApi from '../src/repositories/redisApi';
import { ConsoleMessageHandler, MessageHandler } from '../src/utils/messageHandler';

jest.mock('../src/repositories/redisApi');
jest.mock('../src/utils/messageHandler');

describe('MessageService', () => {
  let messageService: MessageService;
  let redisApi: jest.Mocked<RedisApi>;
  let messageHandler: jest.Mocked<MessageHandler>;

  beforeEach(() => {
    redisApi = new RedisApi() as jest.Mocked<RedisApi>;
    messageHandler = new ConsoleMessageHandler() as jest.Mocked<MessageHandler>;
    messageService = new MessageService(redisApi, messageHandler);
  });

  it('should schedule a message', async () => {
    await messageService.scheduleMessage('Hello, World!', '2023-10-10T10:00:00Z');
    expect(redisApi.addMessageToSortedSet).toHaveBeenCalled();
  });

  it('should process messages', async () => {
    redisApi.popMessage.mockResolvedValue({ id: '1', message: 'Hello, World!', timestamp: new Date() });
    redisApi.acquireLock.mockResolvedValue('lockValue');
    await messageService.processMessages();
    expect(messageHandler.handleMessage).toHaveBeenCalledWith('Hello, World!');
    expect(redisApi.releaseLock).toHaveBeenCalledWith('1', 'lockValue');
    expect(redisApi.deleteMessage).toHaveBeenCalledWith('1');
  });
});