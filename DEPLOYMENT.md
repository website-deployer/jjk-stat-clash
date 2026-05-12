# JJK Stat Clash - Deployment Guide

This document outlines the steps required to get **JJK Stat Clash** into production.

## 1. Prerequisites
- **Node.js**: Ensure you have Node.js 18+ installed.
- **PartyKit Account**: Required for real-time multiplayer. [Sign up here](https://partykit.io).
- **Vercel Account**: Recommended for hosting the frontend (or any static host).

## 2. Multiplayer Infrastructure (PartyKit)
The multiplayer mode relies on a PartyKit server. 

### Step 1: Deploy the PartyKit Server
1. Open a terminal in the project root.
2. Run the deployment command:
   ```bash
   npx partykit deploy
   ```
3. Follow the prompts to log in. Once finished, you will receive a URL (e.g., `jjk-stat-clash.your-username.partykit.dev`).

### Step 2: Configure the Frontend
Update the socket connection logic in `src/pages/MultiplayerDraft.tsx` if you want to hardcode the production URL, or ensure the environment handles it automatically.
> [!NOTE]
> The current code uses `window.location.host` for the socket connection, which works if your frontend and backend share the same domain or if you are using relative routing. For standard PartyKit setups, you may need to set an environment variable.

## 3. Frontend Deployment (Vercel)
The easiest way to deploy the frontend is via Vercel.

1. Install the Vercel CLI: `npm install -g vercel`
2. Run:
   ```bash
   vercel
   ```
3. When asked for build commands, use the defaults:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Once deployed, add **Vercel Analytics** in the Vercel dashboard to enable the built-in tracking.

## 4. Environment Variables
If you use any external APIs or custom PartyKit URLs, create a `.env` file in the root:
```env
VITE_PARTYKIT_HOST=your-partykit-url.partykit.dev
```

## 5. Peak Update Checklist
To ensure your app is at its absolute peak:
- [ ] **Custom Favicon**: Replace `public/favicon.ico` with a stylized "Sukuna Finger" or "Gojo Eye" icon.
- [ ] **OG Metadata**: Update `public/index.html` or the `Helmet` tags in `Home.tsx` with a high-quality preview image for social media sharing.
- [ ] **Analytics**: Confirm that the Vercel Analytics package is tracking page views correctly.
- [ ] **Mobile Optimization**: Test the "Gamble Mode" on a real mobile device; the spin animations should be buttery smooth.

---
© 2026 Jujutsu Intelligence Systems
