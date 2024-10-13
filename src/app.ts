import express from 'express';
import MessageService from './services/messageService';
import { errorHandler } from './middleware/errorHandler';
import { config } from './config';
import { ConsoleMessageHandler } from './utils/messageHandler';
import MessageController from './controllers/messageController';

const messageHandler = new ConsoleMessageHandler();
const messageService = new MessageService(messageHandler);
const messageController = new MessageController(messageService);

const app = express();
const router = express.Router();

router.post('/echoAtTime', messageController.echoAtTime.bind(messageController));

app.use(express.json());
app.use('/api', router);
app.use(errorHandler);

const checkMessages = async () => {
    await messageService.processMessages();
};

const interval = Number(config.messagePollingInterval);

if (!isNaN(interval)) {
    setInterval(checkMessages, interval);
} else {
    console.error('Invalid messagePollingInterval:', config.messagePollingInterval);
}

export default app;