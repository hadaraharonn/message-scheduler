import { Request, Response } from 'express';
import MessageService from '../services/messageService';
import { validateRequest } from '../utils/requestValidation';

class MessageController {
  private messageService: MessageService;

  constructor(messageService: MessageService) {
    this.messageService = messageService;
  }

  public async echoAtTime(req: Request, res: Response): Promise<void> {
    const { time, message } = req.body;
    const { isValid, errors } = validateRequest(time, message);

    if (!isValid) {
      res.status(400).send(errors);
      return;
    }

    try {
      await this.messageService.scheduleMessage(message, time);
      res.status(200).send('Message scheduled successfully');
    } catch (error) {
      console.error('Error scheduling message', error);
      res.status(500).send('Internal Server Error');
    }
  }
}

export default MessageController;
