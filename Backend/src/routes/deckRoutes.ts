import express from 'express';
import multer from 'multer';
import { protect } from '../middleware/auth';
import { createDeck, getDecks, getDeckById, uploadPdfForDeck } from '../controllers/deckController';

const router = express.Router();

// Setup multer for in-memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.route('/')
  .post(protect, createDeck)
  .get(protect, getDecks);

router.route('/:id')
  .get(protect, getDeckById);

router.post('/:id/upload', protect, upload.single('document'), uploadPdfForDeck);

export default router;
