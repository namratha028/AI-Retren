
# RETVR: AI-Powered Voice Analysis Platform for Spiral Dynamics

RETVR is an AI-powered voice and text analysis platform that helps users track their spiritual and emotional development based on Spiral Dynamics theory.

## 🌟 Features

- 🎤 Voice Recording and Real-time Transcription
- 🧠 NLP-based Text Analysis (Spiral Dynamics)
- 📊 Results Visualization with Spiral Dynamics Levels
- 🗂️ Recording History and Transcript Storage
- 🗺️ Transformation Mapping and Progress Tracking
- 🧘 Practice Library with Personalized Exercises
- 🔐 Secure User Authentication

---

## 🧰 Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI**: React 18 + Tailwind CSS + shadcn/ui
- **State**: React Hooks
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js with Next.js API Routes
- **Authentication**: NextAuth.js (Credentials)
- **Database**: MongoDB (via MongoDB Atlas)

### APIs & Tools
- **Speech Recognition**: Web Speech API
- **Password Encryption**: bcryptjs
- **Date Utilities**: date-fns

---

## 🧱 Architecture Overview

- **Client**: Handles voice recording, text input, real-time transcription, and visualization.
- **Server**: Manages authentication, analysis, storage, and API routing.
- **Database**: Stores users, recordings, analysis results, practices, and transformation goals.

### 🔁 Data Flow

1. Voice/text is recorded or entered
2. Text is sent to backend API for analysis
3. Spiral Dynamics levels are computed
4. Results are stored and returned
5. Users can track historical data

---

## 🔐 Authentication

- **User Auth**: Email + Password with NextAuth.js
- **Security**: bcryptjs password hashing, JWT sessions, CSRF protection, secure cookies

---

## 🔍 Core Features Explained

### 🎤 Voice Recorder
- Records up to 30s of speech
- Real-time transcription (Web Speech API)
- Timer, error handling, visual feedback

### 🧠 Text Analysis
- NLP-based stage detection
- Keyword + contextual matching
- Scores and insights for each Spiral Dynamics level

### 📊 Results Visualization
- Color-coded level breakdown
- Personal feedback & insights
- Save and share results

### 🗂️ Recording History
- View past recordings + transcripts
- Delete, play, and retrieve analyses

### 🗺️ Transformation Map
- Current and target stage mapping
- Progress tracking over time

### 🧘 Practice Library
- Curated practices for each stage
- Completion tracking + notes

---

## 📦 API Endpoints

### Auth
- `POST /api/auth/register` - Register user
- `POST /api/auth/[...nextauth]` - Auth routes

### Analysis
- `POST /api/analyze-text` - Analyze input
- `POST /api/analysis/save` - Save result

### Recordings
- `POST /api/recordings/save` - Save recording
- `GET /api/recordings/get` - Get recordings

### Reflections
- `POST /api/reflection/save` - Save reflection
- `GET /api/reflection/get` - Get reflections

---

## 🧩 Database Collections

- **Users**: name, email, hashed password, current/target stage
- **Recordings**: transcript, timestamp, duration, audio
- **Analyses**: Spiral levels, dominant color, summary
- **Practices**: stage, completed, notes
- **Transformation Goals**: progress between stages

---

## 🚀 Deployment

- **Platform**: Vercel (Frontend + Backend)
- **Database**: MongoDB Atlas
- **Secrets**: Stored in environment variables

---

## 🌱 Future Plans

- Voice tone/emotion analysis
- Comparative progress insights
- PDF report export
- Community sharing & feedback
- Mobile App + Wearables Integration
- Multi-language support

---

## 🤝 Contributing
Sri Namratha Maddineni
