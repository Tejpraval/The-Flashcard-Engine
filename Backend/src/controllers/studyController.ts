import { Response } from 'express';
import Card from '../models/Card';
import Review from '../models/Review';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

export const getDueCards = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { deckId } = req.params;
    const now = new Date();

    const dueCards = await Card.find({
      deckId,
      userId: req.user?.id,
      nextReviewDate: { $lte: now }
    }).limit(50); // limit to a reasonable study batch
    
    res.json(dueCards);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching study cards' });
  }
};

export const submitReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { cardId, grade } = req.body;
    // grade: 1-Again, 2-Hard, 3-Good, 4-Easy

    const card = await Card.findOne({ _id: cardId, userId: req.user?.id });
    if (!card) {
      res.status(404).json({ message: 'Card not found' });
      return;
    }

    // Adapt grade (1..4) to standard SM-2 q (0..5)
    let q = 0;
    if (grade === 1) q = 0;
    else if (grade === 2) q = 3;
    else if (grade === 3) q = 4;
    else if (grade === 4) q = 5;

    let { interval, repetitions, easeFactor } = card;

    if (q < 3) {
      repetitions = 0;
      interval = 1;
    } else {
      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      repetitions += 1;
    }

    easeFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    if (easeFactor < 1.3) easeFactor = 1.3;

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + interval);

    // Save Card updates
    card.interval = interval;
    card.repetitions = repetitions;
    card.easeFactor = easeFactor;
    card.nextReviewDate = nextReviewDate;
    await card.save();

    // Log the review
    await Review.create({
      cardId: card._id,
      userId: req.user?.id,
      grade
    });

    // Update User streak logic (simplified for demonstration)
    const user = await User.findById(req.user?.id);
    if (user) {
      const today = new Date();
      today.setHours(0,0,0,0);
      const lastStudy = user.lastStudyDate ? new Date(user.lastStudyDate) : new Date(0);
      lastStudy.setHours(0,0,0,0);
      
      const diffTime = Math.abs(today.getTime() - lastStudy.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

      if (diffDays === 1) {
        user.streak += 1;
      } else if (diffDays > 1) {
        user.streak = 1;
      } else if (diffDays === 0 && user.streak === 0) {
        user.streak = 1;
      }
      
      user.lastStudyDate = new Date();
      await user.save();
    }

    res.json({ message: 'Review recorded successfully', card });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting review' });
  }
};

export const getProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id).select('streak lastStudyDate name');
    
    // Total cards studied (at least 1 repetition)
    const studiedCardsCount = await Card.countDocuments({
      userId: req.user?.id,
      repetitions: { $gt: 0 }
    });

    const totalCards = await Card.countDocuments({ userId: req.user?.id });
    
    // Upcoming Reviews count
    const now = new Date();
    const dueReviews = await Card.countDocuments({
      userId: req.user?.id,
      nextReviewDate: { $lte: now }
    });

    res.json({
      user,
      studiedCardsCount,
      totalCards,
      dueReviews
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching progress' });
  }
};
