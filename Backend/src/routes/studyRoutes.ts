import express from 'express';
import { protect } from '../middleware/auth';
import { getDueCards, submitReview, getProgress } from '../controllers/studyController';

const router = express.Router();

router.get('/progress', protect, getProgress);
router.get('/:deckId', protect, getDueCards);
router.post('/review', protect, submitReview);

export default router;
