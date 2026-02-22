import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// One-time auth tokens for Google login redirect
const authTokens = new Map();

// AstraDB config - set in .env
const ASTRA_API_URL = process.env.ASTRA_API_URL || '';
const ASTRA_TOKEN = process.env.ASTRA_TOKEN || '';
const ASTRA_NAMESPACE = process.env.ASTRA_NAMESPACE || 'default_keyspace';
const ASTRA_COLLECTION = process.env.ASTRA_COLLECTION || 'users';

// In-memory fallback when AstraDB is unavailable
const memoryStore = new Map();

app.use(cors());
app.use(express.json());

const isProduction = process.env.NODE_ENV === 'production';
if (isProduction) {
  app.use(express.static(path.join(__dirname, 'dist')));
} else {
  app.use(express.static(path.join(__dirname)));
}

async function astraRequest(method, apiPath, body = null) {
  if (!ASTRA_API_URL || !ASTRA_TOKEN) return { ok: false, status: 0, data: null };
  const url = `${ASTRA_API_URL}${apiPath}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Token': ASTRA_TOKEN,
    },
  };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(url, options);
  const data = res.ok ? await res.json().catch(() => ({})) : null;
  return { ok: res.ok, status: res.status, data };
}

async function ensureCollection() {
  const res = await astraRequest('POST', `/api/json/v1/${ASTRA_NAMESPACE}`, {
    createCollection: { name: ASTRA_COLLECTION },
  });
  if (!res.ok && res.status !== 409) {
    console.warn('AstraDB collection setup:', res.status, '- using memory fallback for auth');
  }
}

async function insertUser(username, email, passwordHash) {
  const doc = {
    username: username.trim().toLowerCase(),
    email: email.trim().toLowerCase(),
    password: passwordHash,
    createdAt: new Date().toISOString(),
  };
  const res = await astraRequest('POST', `/api/json/v1/${ASTRA_NAMESPACE}/${ASTRA_COLLECTION}`, {
    insertOne: { document: doc },
  });
  return res;
}

async function findUserByEmail(email) {
  const res = await astraRequest('POST', `/api/json/v1/${ASTRA_NAMESPACE}/${ASTRA_COLLECTION}`, {
    findOne: {
      filter: { email: email.trim().toLowerCase() },
    },
  });
  return res?.data?.data?.document || null;
}

async function findUserByUsername(username) {
  const res = await astraRequest('POST', `/api/json/v1/${ASTRA_NAMESPACE}/${ASTRA_COLLECTION}`, {
    findOne: {
      filter: { username: username.trim().toLowerCase() },
    },
  });
  return res?.data?.data?.document || null;
}

// Memory fallback helpers
function memoryInsertUser(username, email, passwordHash) {
  const key = email.trim().toLowerCase();
  memoryStore.set(key, {
    username: username.trim().toLowerCase(),
    email: key,
    password: passwordHash,
    createdAt: new Date().toISOString(),
  });
  return { ok: true };
}

function memoryInsertGoogleUser(email, username, googleId) {
  const key = email.trim().toLowerCase();
  memoryStore.set(key, {
    username: (username || email.split('@')[0]).trim().toLowerCase(),
    email: key,
    password: null,
    googleId,
    createdAt: new Date().toISOString(),
  });
  return { ok: true };
}

function memoryFindByEmail(email) {
  return memoryStore.get(email.trim().toLowerCase()) || null;
}

function memoryFindByUsername(username) {
  const search = username.trim().toLowerCase();
  for (const user of memoryStore.values()) {
    if (user.username === search) return user;
  }
  return null;
}

// Create collection on startup (ignore if exists)
ensureCollection().catch(console.warn);

// Google OAuth - only if credentials are set
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  const callbackURL = process.env.GOOGLE_CALLBACK_URL || `http://localhost:${PORT}/auth/google/callback`;
  passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL,
  }, async (accessToken, refreshToken, profile, done) => {
    const email = profile.emails?.[0]?.value;
    const name = profile.displayName || profile.name?.givenName || '';
    if (!email) return done(new Error('No email from Google'));
    let user = await findUserByEmail(email);
    if (!user) user = memoryFindByEmail(email);
    if (!user) {
      memoryInsertGoogleUser(email, name, profile.id);
      user = memoryFindByEmail(email);
    }
    done(null, { username: user.username, email: user.email });
  }));

  app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
  app.get('/auth/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login?error=google' }),
    (req, res) => {
      const token = crypto.randomBytes(32).toString('hex');
      authTokens.set(token, req.user);
      setTimeout(() => authTokens.delete(token), 60000);
      res.redirect(`/?auth_token=${token}`);
    }
  );
} else {
  console.warn('Google OAuth disabled: set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env');
  app.get('/auth/google', (req, res) => res.redirect('/login?error=google_disabled'));
}

// Register
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    let existingEmail = await findUserByEmail(email);
    let existingUser = await findUserByUsername(username);
    if (!existingEmail) existingEmail = memoryFindByEmail(email);
    if (!existingUser) existingUser = memoryFindByUsername(username);

    if (existingEmail) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    if (existingUser) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    let result = await insertUser(username, email, passwordHash);

    if (!result.ok) {
      memoryInsertUser(username, email, passwordHash);
      result = { ok: true };
    }

    res.status(201).json({
      success: true,
      user: { username: username.trim(), email: email.trim() },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    let user = await findUserByEmail(email);
    if (!user) user = memoryFindByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.json({
      success: true,
      user: { username: user.username, email: user.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Verify auth token (from Google redirect)
app.get('/api/auth/verify', (req, res) => {
  const token = req.query.token;
  if (!token) return res.status(400).json({ error: 'Token required' });
  const user = authTokens.get(token);
  authTokens.delete(token);
  if (!user) return res.status(401).json({ error: 'Invalid or expired token' });
  res.json({ success: true, user });
});

// Serve React app (SPA) - catch-all for client routes (API/auth handled above)
const indexPath = isProduction
  ? path.join(__dirname, 'dist', 'index.html')
  : path.join(__dirname, 'index.html');
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/auth')) return next();
  res.sendFile(indexPath);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
