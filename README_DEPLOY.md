# Deploying `ghost-house` publicly

This document explains quick options to make the app publicly accessible (so anyone can open it, not only `localhost`). Choose one of the methods below.

---

## Recommended: Deploy to Render (free hobby option)
1. Push this repository to GitHub (create new repo and push).
2. Create an account at https://render.com and connect your GitHub account.
3. Create a new **Web Service** and select this repository.
4. Configure build & start:
   - **Environment**: Docker (Render will auto-detect `Dockerfile`) or use the Node build commands below.
   - If not using Docker, set **Build Command**: `npm ci` and **Start Command**: `npm start`.
5. Deploy. Render will give you a public URL (https://your-app.onrender.com).

Notes:
- The static `current_newsparer/第一幽霊の過去.pdf` is included in the repo and will be served at `/files/第一幽霊の過去.pdf`.
- No extra changes to code are required.

---

## Alternative: Deploy to Railway
1. Push to GitHub.
2. Create an account at https://railway.app and connect GitHub.
3. New Project -> Deploy from GitHub -> select repo.
4. Use Dockerfile or set Build `npm ci` and Start `npm start`.
5. Railway provides a public URL.

---

## Quick temporary public URL: ngrok / localtunnel (not for production)
- `ngrok http 3000` will create a public HTTPS URL that tunnels to your local port 3000.
- `npx localtunnel --port 3000` also yields a temporary public URL.

Security: these tunnels expose your local app to the public internet. Use only for testing.

---

## Deploying with Docker (steps locally or CI)
1. Build image: `docker build -t ghost-house:latest .`
2. Run container: `docker run -p 3000:3000 ghost-house:latest`
3. If you have a VPS (DigitalOcean / AWS / GCP), push image to registry and run there.

---

If you want, I can:
- Create the GitHub repo and push (I will need permission or you do it and tell me the repo URL).
- Automatically deploy to Render or Railway (I can prepare instructions and the Dockerfile is already added).
- Set up an ngrok tunnel now for immediate public access (temporary).

Tell me which option you want me to perform and I'll proceed.
