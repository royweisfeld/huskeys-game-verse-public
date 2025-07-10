# 🐾 Huskeys Game Verse 🕹️

Welcome to **Huskeys Game Verse** – where gamification meets productivity, and every day is a new quest! 🚀

---

## 🎮 What is Huskeys Game Verse?

Huskeys Game Verse is a playful, interactive platform that transforms your daily grind into an epic adventure. Earn XP, level up, unlock achievements, and climb the leaderboard – all while getting real work done! Whether you’re a lone wolf or part of a pack, there’s always a new challenge waiting for you.

---

## ✨ Features

- **Gamified Experience:** Complete tasks, earn XP, and unlock cool achievements.
- **Leaderboard:** Compete with your friends and colleagues for the top spot.
- **Streaks & Levels:** Keep your momentum going and watch your Huskeys grow stronger!
- **Beautiful UI:** Powered by shadcn-ui and Tailwind CSS for a sleek, modern look.

---

## 🛠️ Tech Stack

- **Frontend:** React + Vite + TypeScript
- **UI:** shadcn-ui, Tailwind CSS
- **Backend:** Node.js (Bun), Cloudflare Workers (Wrangler), Cloudflare D1 Database (Wrangler)
- **Testing:** Vitest

---

## 🚀 Getting Started


Clone the repo and unleash your inner Huskey:

Before running make sure to create a DB, and upload your backend then edit these params:
gamification-backend/wrangler.jsonc - database_id
src/utils/api.ts - API_BASE

```sh
git clone <YOUR_GIT_URL>
cd Huskeys-game-verse
npm install
npm run dev
```

### Backend Setup

```sh
cd gamification-backend
npx deploy wrangler
```

---

## 🏆 How to Play

1. **Log in** and start completing tasks.
2. **Earn XP** for every completed quest.
3. **Unlock achievements** and show off your progress.
4. **Check the leaderboard** to see who’s top dog!

---


## 🌐 Deployment

Deploy with your favorite platform, I used Cloudflare Workers (Backend) and Cloudflare D1 (Database) and Hosted Locally (For now)
Also a Webhook for Linear, and Slack is required for this to work.

---

## 📚 Learn More

- [shadcn-ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)
- [React](https://react.dev/)

---

## 🐾 Join the Adventure!

Ready to turn your workday into a game? Let’s go, Huskeys hero! 🌟
