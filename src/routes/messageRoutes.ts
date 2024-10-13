import { Router } from 'express';
import { echoAtTime } from '../controllers/messageController';

const router = Router();

router.post('/echoAtTime', echoAtTime);

export default router;