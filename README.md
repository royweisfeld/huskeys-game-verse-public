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

---

### 🔑 Setting Up Slack Webhook Wrangler Secret

**Why:** The Slack webhook is used to send notifications (like achievements or task completions) from your backend to a Slack channel. The webhook URL is sensitive and should be stored securely as a Wrangler secret.

**How to set up:**
1. **Create a Slack Incoming Webhook:**
   - Go to your Slack workspace: [Slack API: Incoming Webhooks](https://api.slack.com/messaging/webhooks)
   - Create a new app or use an existing one, add the "Incoming Webhooks" feature, and generate a webhook URL for your desired channel.
2. **Add the webhook URL as a Wrangler secret:**
   ```sh
   cd gamification-backend
   npx wrangler secret put SLACK_WEBHOOK_URL
   ```
   Paste your webhook URL when prompted.

---

### 🗄️ Setting Up Cloudflare D1 Database

1. **Install Wrangler CLI if you haven't:**
   ```sh
   npm install -g wrangler
   ```
2. **Authenticate Wrangler with your Cloudflare account:**
   ```sh
   npx wrangler login
   ```
3. **Create a new D1 database:**
   ```sh
   npx wrangler d1 create <YOUR_DB_NAME>
   ```
   Note the returned `database_id`.
4. **Update your backend config:**
   - Edit `gamification-backend/wrangler.jsonc` and set the `database_id` to your new D1 database ID.
5. **(Optional) Run migrations:**
   ```sh
   npx wrangler d1 migrations apply <YOUR_DB_NAME>
   ```

---

### ☁️ Setting Up Cloudflare Worker (Backend)

1. Ensure your `wrangler.jsonc` is configured with your account and database info.
2. Deploy your backend:
   ```sh
   cd gamification-backend
   npx wrangler deploy
   ```
3. Note the deployed Worker URL; you’ll use this as your API base in the frontend (`src/utils/api.ts`).

---

### 🤝 Setting Up Slack and Linear Integrations

#### Slack
- See the Slack Webhook section above for webhook setup.
- Make sure the webhook is added as a Wrangler secret (`SLACK_WEBHOOK_URL`).

#### Linear
- The backend listens for Linear events via a webhook.
- **How to set up:**
  1. In your Linear workspace, go to Settings → Integrations → Webhooks.
  2. Create a new webhook and set the URL to your deployed Cloudflare Worker backend (from the deployment step above).
  3. Select the events you want to send (e.g., issue updates, comments, etc.).
  4. Save the webhook. Now, Linear will communicate directly with your backend when relevant events occur.

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
