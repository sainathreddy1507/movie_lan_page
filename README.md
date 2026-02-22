# themoive - Movie Landing Page

A Netflix-style landing page built with **React** and Vite. Login/registration with **AstraDB** and **Google Sign-In**.

## Setup

```bash
npm install
cp .env.example .env
# Edit .env with your AstraDB and Google OAuth credentials
```

## Development

Run the API server and React dev server in two terminals:

```bash
# Terminal 1 - API server
npm run server

# Terminal 2 - React dev server (Vite)
npm run dev
```

Open `http://localhost:5173` (Vite proxies API requests to port 3000).

## Production

```bash
npm run build
npm run start:prod
```

Open `http://localhost:3000`.

## Features

- **Login** – `/login`
- **Register** – `/register`
- **User storage** – Username, email, and hashed password in AstraDB
- **Movie data** – OMDB API (no key needed)

## Google Sign-In

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 Client ID (Web application)
3. Add redirect URI: `http://localhost:3000/auth/google/callback`
4. Copy `.env.example` to `.env` and add your Client ID and Secret

## AstraDB

User documents are stored in the `users` collection with:

- `username` – unique, lowercase
- `email` – unique, lowercase
- `password` – bcrypt hash
- `createdAt` – ISO timestamp
