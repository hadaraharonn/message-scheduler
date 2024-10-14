import { Request, Response } from 'express';
import MessageService from '../services/messageService';
import { validateRequest } from '../utils/requestValidation';
import { sendErrorResponse, sendSuccessResponse } from '../utils/responseUtils';

class MessageController {
  private messageService: MessageService;

  constructor(messageService: MessageService) {
    this.messageService = messageService;
  }

  public async echoAtTime(req: Request, res: Response): Promise<void> {
    const { time, message } = req.body;
    const { isValid, errors } = validateRequest(time, message);

    if (!isValid) {
      sendErrorResponse(res, 400, 'Validation Error', errors);
      return;
    }

    try {
      await this.messageService.scheduleMessage(message, time);
      sendSuccessResponse(res, 'Message scheduled successfully');
    } catch (error) {
      console.error('Error scheduling message', error);
      sendErrorResponse(res, 500, 'Internal Server Error', (error as Error).message || 'An unexpected error occurred.');
    }
  }
}

export default MessageController;
