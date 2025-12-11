# 🍌 Banana Trivia - Math Challenge Game

A fast-paced math trivia game built with Next.js, React, and Firebase. Test your math skills under pressure with multiple difficulty levels!

## 🎮 Features

- ⚡ **Fast-paced gameplay** - Quick rounds with timed challenges
- 🔥 **Multiple difficulties** - Easy, Medium, and Hard modes
- 🏆 **Leaderboards** - Track your top scores
- 📊 **Progress tracking** - Monitor your performance
- 🎯 **Real-time feedback** - Instant results after each question
- 🔐 **Secure authentication** - Google Sign-In integration

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd banana-trivia
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up Firebase:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Copy your Firebase config to `firebase/config.ts`
   - Enable Authentication (Google Sign-In)
   - Create a Firestore database

4. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
banana-trivia/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Home page
│   ├── difficulty/        # Difficulty selection page
│   ├── game/              # Game page
│   ├── login/             # Login page
│   ├── signup/            # Signup page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── LoadingScreen.tsx
│   ├── BackgroundBlobs.tsx
│   └── PageBackground.tsx
├── constants/             # Game constants
│   └── game.ts           # Difficulty configs, API configs
├── hooks/                 # Custom React hooks
│   └── useAuth.ts        # Authentication hook
├── utils/                 # Utility functions
│   └── time.ts           # Time formatting utilities
└── firebase/             # Firebase configuration
    └── config.ts
```

## 🎯 Game Modes

- **Easy**: 5 questions, 2-minute timer
- **Medium**: 10 questions, 1-minute timer  
- **Hard**: 15 questions, 40-second timer

## 🛠️ Tech Stack

- **Framework**: Next.js 16
- **UI**: React 19, Tailwind CSS 4
- **Authentication**: Firebase Auth
- **Database**: Cloud Firestore
- **HTTP Client**: Axios
- **Language**: TypeScript

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🚀 Deploy

The easiest way to deploy is using [Vercel](https://vercel.com):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

## 📄 License

This project is private and proprietary.
