import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './db';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

import authRoutes from './routes/authRoutes';
import deckRoutes from './routes/deckRoutes';
import studyRoutes from './routes/studyRoutes';

// ...
app.use('/api/auth', authRoutes);
app.use('/api/decks', deckRoutes);
app.use('/api/study', studyRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
