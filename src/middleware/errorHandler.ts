import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: Error, req: Request, res: Response, nextFunction: NextFunction): void => {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
};