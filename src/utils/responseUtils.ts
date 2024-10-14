import { Response } from 'express';

export const sendSuccessResponse = (res: Response, message: string) => {
    res.status(201).json({
        status: 'success',
        message: message,
        error: null,
    });
};

export const sendErrorResponse = (res: Response, statusCode: number, message: string, errorDetails: any = null) => {
    res.status(statusCode).json({
        status: 'error',
        message: message,
        error: errorDetails,
    });
};