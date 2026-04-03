import express from 'express';
import { generateComponent, getJobStatus } from '../controllers/generateController.js';
import { getHistory, deleteComponent } from '../controllers/historyController.js';

const router = express.Router();

router.post('/generate', generateComponent);
router.get('/generate/status/:jobId', getJobStatus);
router.get('/history/:userId', getHistory);
router.delete('/component/:id', deleteComponent);

export default router;
