import express from 'express';
import messageRoutes from './routes/messageRoutes';
import MessageService from './services/messageService';

const app = express();
const messageService = new MessageService();

app.use(express.json());
app.use('/api', messageRoutes);

const checkMessages = async () => {
    await messageService.processMessages();
};

setInterval(checkMessages, 1000);

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});