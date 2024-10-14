import MessageService from '../src/services/messageService';
import RedisApi from '../src/repositories/redisApi';
import {
    ConsoleMessageHandler,
    MessageHandler,
} from '../src/utils/messageHandler';
import MessageDTO from '../src/models/messageDTO';

jest.mock('../src/repositories/redisApi');
jest.mock('../src/utils/messageHandler');

describe('MessageService', () => {
    let messageService: MessageService;
    let redisApi: jest.Mocked<RedisApi>;
    let messageHandler: jest.Mocked<MessageHandler>;

    const mockMessage = 'Hello, World!';
    const mockTimestamp = '2023-10-10T10:00:00Z';
    const mockMessageDTO = new MessageDTO(mockMessage, new Date());
    mockMessageDTO.id = '1';
    const mockLockKey = `lock:${mockMessageDTO.id}`;
    const mockMessageDTOArray = [mockMessageDTO];

    beforeEach(() => {
        redisApi = new RedisApi() as jest.Mocked<RedisApi>;
        messageHandler = new ConsoleMessageHandler() as jest.Mocked<MessageHandler>;
        messageService = new MessageService(redisApi, messageHandler);
    });

    describe('scheduleMessage', () => {
        it('should schedule a message', async () => {
            await messageService.scheduleMessage(mockMessage, mockTimestamp);
            expect(redisApi.addMessageToSortedSet).toHaveBeenCalledWith(
                expect.any(MessageDTO),
            );
        });

        it('should handle errors during message scheduling', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            redisApi.addMessageToSortedSet.mockRejectedValue(
                new Error('Redis error'),
            );
            await expect(
                messageService.scheduleMessage(mockMessage, mockTimestamp),
            ).rejects.toThrow('Redis error');
            expect(consoleSpy).toHaveBeenCalledWith('Failed to schedule message', expect.any(Error));

            consoleSpy.mockRestore();
        });
    });

    describe('processMessages', () => {
        it('should process messages', async () => {
            redisApi.getMessagesToProcess.mockResolvedValue(mockMessageDTOArray);
            redisApi.acquireLock.mockResolvedValue(true);

            await messageService.processMessages();

            expect(redisApi.getMessagesToProcess).toHaveBeenCalled();
            expect(redisApi.acquireLock).toHaveBeenCalledWith(
                mockLockKey,
                expect.any(String),
            );
            expect(messageHandler.handleMessage).toHaveBeenCalledWith(mockMessage);
            expect(redisApi.deleteMessage).toHaveBeenCalledWith(mockMessageDTO);
        });

        it('should not process messages if no message is available', async () => {
            redisApi.getMessagesToProcess.mockResolvedValue([]);

            await messageService.processMessages();

            expect(messageHandler.handleMessage).not.toHaveBeenCalled();
        });

        it('should not process messages if lock is not acquired', async () => {
            redisApi.getMessagesToProcess.mockResolvedValue(mockMessageDTOArray);
            redisApi.acquireLock.mockResolvedValue(false);

            await messageService.processMessages();

            expect(messageHandler.handleMessage).not.toHaveBeenCalled();
            expect(redisApi.releaseLock).not.toHaveBeenCalled();
            expect(redisApi.deleteMessage).not.toHaveBeenCalled();
        });

        it('should handle errors during messages processing', async () => {
            redisApi.getMessagesToProcess.mockResolvedValue(mockMessageDTOArray);
            redisApi.acquireLock.mockResolvedValue(true);
            messageHandler.handleMessage.mockRejectedValue(
                new Error('Handler error'),
            );

            const consoleSpy = jest
                .spyOn(console, 'error')
                .mockImplementation(() => { });

            await messageService.processMessages();

            expect(consoleSpy).toHaveBeenCalledWith(
                'Error processing messages',
                expect.any(Error),
            );
            expect(redisApi.releaseLock).toHaveBeenCalledWith(
                mockLockKey,
                expect.any(String),
            );

            consoleSpy.mockRestore();
        });
    });
});