import { Request, Response } from 'express';
import MessageService from '../services/messageService';

const messageService = new MessageService();

export const echoAtTime = async (req: Request, res: Response) => {
    const { time, message } = req.body;
    try {
        await messageService.scheduleMessage(message, time);
        res.status(200).send('Message scheduled');
    } catch (error) {
        res.status(500).send('Error scheduling message');
    }
};