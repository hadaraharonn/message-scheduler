import express from 'express';
import MessageController from './src/controllers/messageController';
import MessageService from './src/services/messageService';
import RedisApi from './src/repositories/redisApi';
import { errorHandler } from './src/middleware/errorHandler';
import { config } from './src/config';
import { ConsoleMessageHandler } from './src/utils/messageHandler';

const redisApi = new RedisApi();
const messageHandler = new ConsoleMessageHandler();
const messageService = new MessageService(redisApi, messageHandler);
const messageController = new MessageController(messageService);

const app = express();
const router = express.Router();

router.post(
  '/echoAtTime',
  messageController.echoAtTime.bind(messageController),
);

app.use(express.json());
app.use('/api', router);
app.use(errorHandler);

const checkMessages = async () => {
  await messageService.processMessages();
};

const interval = config.messagePollingIntervalMs as number;

if (!isNaN(interval)) {
  setInterval(checkMessages, interval);
} else {
  console.error(
    'Invalid messagePollingInterval:',
    config.messagePollingIntervalMs,
  );
}

app.listen(config.port, () => {
  console.log(`Server is running on http://localhost:${config.port}`);
});

export default app;