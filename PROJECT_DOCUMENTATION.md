# 📘 FlashMind: Comprehensive Project Documentation

This document serves as the complete technical blueprint and architectural breakdown of the **FlashMind** application. 

---

## 1. Executive Summary

**FlashMind** is a modern, responsive single-page web application aimed at enhancing the studying and memorization process. By abstracting the manual labor of creating flashcards, FlashMind allows users to dynamically generate study materials straight from their textbooks and notes using Generative AI (Google Gemini). 

Beyond generation, FlashMind enforces active recall methodology through a custom-built, mathematical **Spaced Repetition System (SRS)** known as the **SM-2 Algorithm**. This ensures that learners only review topics exactly when they are on the verge of forgetting them, drastically optimizing study time.

---

## 2. Core Architecture

The platform operates on a **MERN** stack inside a pseudo-monorepo configuration.

* **Frontend**: React.js mapped with Vite build tools. Routing uses lightweight \`wouter\`.
* **Backend**: Node.js + Express.js written in strict TypeScript.
* **Database**: MongoDB hosted in the cloud (Atlas), mapped by Mongoose ODM.
* **Styling**: 100% Vanilla CSS to enforce a highly uniform, low-dependency design system, utilizing deep Glassmorphism elements and custom dark-mode variables. 

### Folder Structure
\`\`\`text
The Flashcard Engine/
├── Backend/
│   ├── src/
│   │   ├── controllers/      # Route handlers
│   │   ├── middleware/       # JWT Auth verification
│   │   ├── models/           # Mongoose schemas (User, Card, Deck, Review)
│   │   ├── routes/           # Express router endpoints
│   │   ├── services/         # Complex isolated logic (Gemini AI parsing)
│   │   └── index.ts          # Server entry point
│   ├── tsconfig.json
│   └── .env
│
├── Frontend/
│   ├── src/
│   │   ├── components/       # Reusable components (TBD)
│   │   ├── hooks/            # Custom context hooks (useAuth)
│   │   ├── pages/            # Core views (Dashboard, StudyMode, DeckView)
│   │   ├── index.css         # The Design System & utility framework
│   │   └── App.tsx           # Application router
│   ├── vite.config.ts
│   └── package.json
\`\`\`

---

## 3. Data Models (MongoDB)

The data infrastructure is heavily normalized to ensure efficient queries during rapid studying sessions.

1. **User**: Stores authentication credentials, \`streak\` (computed logic), and profile data. Passwords are mathematically hashed using \`bcryptjs\`.
2. **Deck**: Logical groupings of cards. Tracks a parent \`userId\` for security and tagging parameters.
3. **Card**: The actual flashcard object holding \`question\`, \`answer\`, \`difficulty\`, and \`topic\`. Belongs to a parent \`Deck\`.
4. **Review**: The brain of the SM-2 tracking. Maps a \`userId\` to a \`cardId\` and stores:
   - \`interval\`: Days until the next review.
   - \`repetitions\`: Number of successive times a card was answered correctly.
   - \`easeFactor\`: Float multiplier scaling the penalty/reward of future intervals.
   - \`nextReviewDate\`: The absolute timestamp determining when this card re-enters the active queue.

---

## 4. Key Algorithms & Subsystems

### A. The AI Processing Engine (\`aiService.ts\`)
1. **Extraction**: Accepts raw buffer streams of \`pdf\` files directly via \`multer\` memory storage. It utilizes \`pdf-parse\` to strip formatting and acquire plaintext.
2. **Chunking**: Protects token limits by slicing massive textbook chunks down into a stable token range (first ~30,000 chars currently).
3. **Structured Data Generation**: Connects to the **Google Gemini-2.5-Flash** model. The strict system prompt forces the Language Model to return solely valid JSON mappings of definitions, contextual questions, and edge cases natively bound to the \`Card\` schema.

### B. The SM-2 Spaced Repetition Algorithm (\`studyController.ts\`)
When a user finishes looking at a flashcard, they grade their cognitive recall from 1 to 4:
* \`1\` = Again (Forgot completely)
* \`2\` = Hard (Remembered with severe hesitation)
* \`3\` = Good (Remembered with slight hesitation)
* \`4\` = Easy (Remembered instantly)

**The Logic flow:**
- If the grade is **1 or 2**, the \`repetitions\` counter is reset to \`0\`, dropping the \`interval\` back to 1 day.
- If the grading is successful (>= 3):
    - On rep \`1\`, \`interval\` becomes \`1\` day.
    - On rep \`2\`, \`interval\` becomes \`6\` days.
    - After rep \`2\`, \`interval\` scales exponentially: \`interval = previousInterval * easeFactor\`.
- The \`easeFactor\` mutates slightly based on how harsh the grading was, expanding naturally over time if the card stays "Easy".

---

## 5. API Endpoints Reference

All requests inside \`/api/decks\` and \`/api/study\` are strictly shielded by an \`authMiddleware\` expecting a valid \`Bearer <JWT>\` header.

| HTTP Method | Endpoint | Purpose |
| ----------- | -------- | ------- |
| **POST** | \`/api/auth/register\` | Creates a new User object and returns a stateless JWT. |
| **POST** | \`/api/auth/login\` | Validates user password hashes and returns a new active JWT. |
| **GET** | \`/api/decks\` | Fetches all decks associated with the actively authenticated user. |
| **POST** | \`/api/decks\` | Instantiates a new empty Deck object. |
| **GET** | \`/api/decks/:id\` | Retrieves deck details alongside all children \`Card\` array objects. |
| **POST** | \`/api/decks/:id/upload\` | Accepts multipart/form-data. Intercepts a generic PDF, buffers it, invokes AI generation, and bulk writes hundreds of cards directly into the Deck. |
| **GET** | \`/api/study/progress\` | Polls absolute metrics determining the User's \`streak\` count and global count of cards whose \`nextReviewDate\` is currently due or overdue. |
| **GET** | \`/api/study/:deckId\` | An aggregate query that returns highly specific subset parameters of cards inside a given deck that are *currently due* for studying based on their \`Review\` dates. |
| **POST** | \`/api/study/review\` | Submits the SM-2 user grade (\`1-4\`) and mathematically recalculates and upserts the backend \`Review\` model. |

---

## 6. Frontend Architectural Flows

- **Authentication State**: Mapped globally via a custom \`useAuth()\` React Context. Protects route switching by pushing users back to \`/login\` if \`!isAuthenticated\`.
- **Theme Variables**: Relies on a unified \`index.css\` root defining semantic \`--var\` colors. The CSS uses deep layering, ensuring \`glass-panel\` classes cast ambient shadows for premium interfaces.
- **Keyboard Mappings**: Built specifically for power users. Global listeners on \`Space\` and mapping variables \`1,2,3,4\` allow the UI to physically cycle through the SM-2 algorithm without ever requiring a mouse click.
