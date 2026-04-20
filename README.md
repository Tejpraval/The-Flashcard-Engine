# 🧠 FlashMind

**FlashMind** is an intelligent, AI-powered spaced repetition learning engine built with the MERN stack. Wait no longer to memorize dense textbooks and notes; simply upload a PDF, and FlashMind will parse the contents and use **Google Gemini 2.5 Flash** to automatically generate high-yield, smart concept flashcards. 

To ensure optimal retention, FlashMind tracks your progress using the industry-proven **SM-2 Spaced Repetition Algorithm**, ensuring you only review cards precisely when you are about to forget them.

---

## ✨ Key Features
- **AI-Powered Card Generation**: Instantly parses PDF pages and uses generative AI to contextually group and generate Q&A flashcards.
- **Adaptive Spaced Repetition (SM-2)**: Dynamically adjusts flashcard review schedules based on your memory retention responses (Again, Hard, Good, Easy).
- **Custom-Built Premium UI**: A highly responsive, glassmorphism-inspired dark mode UI written purely in Vanilla CSS (no Tailwind dependency), complete with micro-animations and 3D card flips.
- **Analytics & Tracking**: Tracks daily streaks and aggregates the number of upcoming reviews right on your dashboard to encourage daily mastery.
- **Secure Authentication**: Built-in backend JWT and hashed-password user system.

---

## 🛠️ Technology Stack
- **Frontend**: React (18), Vite, TypeScript, `wouter` for routing, Vanilla CSS.
- **Backend**: Node.js, Express, TypeScript, `bcryptjs` & `jsonwebtoken` for auth, `multer` for memory file parsing.
- **Database**: MongoDB (Mongoose ODM).
- **AI Processing**: Google Gemini API (`@google/genai`), `pdf-parse`.

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have the following installed on your local machine:
- Node.js (v18 or higher)
- A MongoDB cluster URL (Atlas or local)
- A [Google Gemini API Key](https://aistudio.google.com/app/apikey)

### 2. Clone the Repository
\`\`\`bash
git clone <your-repo-link-here>
cd "The Flashcard Engine"
\`\`\`

### 3. Backend Setup
Navigate to the `Backend` directory, install dependencies, and configure environment variables.
\`\`\`bash
cd Backend
npm install
\`\`\`

Create a `.env` file in the `Backend` directory:
\`\`\`env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
GEMINI_API_KEY=your_gemini_api_key
\`\`\`

### 4. Frontend Setup
Navigate into the `Frontend` directory and install dependencies.
\`\`\`bash
cd ../Frontend
npm install
\`\`\`

### 5. Running the Engine Locally
Run the development servers. Both will boot and hot-reload.

**In Terminal 1 (Backend):**
\`\`\`bash
cd Backend
npm run dev
# Server boots on http://localhost:5000
\`\`\`

**In Terminal 2 (Frontend):**
\`\`\`bash
cd Frontend
npm run dev
# Client boots on http://localhost:5173
\`\`\`

Navigate to `http://localhost:5173` in your browser.

---

## 💡 How to Use
1. **Sign up**: Create a quick user account to hold your secure decks securely.
2. **Create a Deck**: Supply a deck topic (e.g. "Biology 101").
3. **Upload PDF**: Click `Upload PDF & Generate Cards`, wait a few seconds, and watch the AI populate the deck.
4. **Study**: Click `Start Study Session` and use your keyboard shortcuts.
   * `Space`: Reveal Answer
   * `1`: Again
   * `2`: Hard
   * `3`: Good
   * `4`: Easy

---

## 📝 License
This project is open-source and available under the [MIT License](LICENSE).
