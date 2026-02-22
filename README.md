# themoive - Movie Landing Page

A Netflix-style landing page with login/registration. User data is stored in **AstraDB**.

## Setup

```bash
npm install
npm start
```

Then open `http://localhost:3000`.

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
