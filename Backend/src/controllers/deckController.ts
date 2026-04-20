import { Response } from 'express';
import Deck from '../models/Deck';
import Card from '../models/Card';
import { AuthRequest } from '../middleware/auth';
import { parsePdfBuffer, generateFlashcardsFromText } from '../services/aiService';

export const createDeck = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, tags } = req.body;
    const deck = await Deck.create({
      userId: req.user?.id,
      name,
      description,
      tags
    });
    res.status(201).json(deck);
  } catch (error) {
    res.status(500).json({ message: 'Error creating deck' });
  }
};

export const getDecks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const decks = await Deck.find({ userId: req.user?.id }).sort({ createdAt: -1 });
    res.json(decks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching decks' });
  }
};

export const getDeckById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const deck = await Deck.findOne({ _id: req.params.id, userId: req.user?.id });
    if (!deck) {
      res.status(404).json({ message: 'Deck not found' });
      return;
    }
    const cards = await Card.find({ deckId: deck._id });
    res.json({ deck, cards });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching deck Details' });
  }
};

export const uploadPdfForDeck = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const deckId = req.params.id;
    const deck = await Deck.findOne({ _id: deckId, userId: req.user?.id });
    
    if (!deck) {
      res.status(404).json({ message: 'Deck not found' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ message: 'No PDF file attached' });
      return;
    }

    // Process PDF and generate cards
    const text = await parsePdfBuffer(req.file.buffer);
    const generatedCardsData = await generateFlashcardsFromText(text, deck.name);

    // Prepare and insert cards
    const cardsToInsert = generatedCardsData.map((card: any) => ({
      deckId: deck._id,
      userId: req.user?.id,
      question: card.question,
      answer: card.answer,
      difficulty: card.difficulty || 1,
      topic: card.topic || deck.name,
      tags: card.tags || deck.tags || [],
      easeFactor: 2.5,
      interval: 0,
      repetitions: 0,
      nextReviewDate: new Date()
    }));

    const insertedCards = await Card.insertMany(cardsToInsert);

    res.status(201).json({
      message: 'Cards successfully generated',
      cardsCount: insertedCards.length,
      cards: insertedCards
    });

  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Error processing PDF' });
  }
};
