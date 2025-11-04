// backend/src/controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);

// warn if secret not configured (development only)
if (!process.env.JWT_SECRET) {
  console.warn('Warning: JWT_SECRET not set in .env — using fallback secret (development only).');
}

function signToken(user) {
  // only include minimal info in token
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * POST /api/auth/register
 * Body: { name, email, password }
 * Response: { token, user: { id, name, email } }
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    // normalize email
    const normalizedEmail = String(email).trim().toLowerCase();

    // check existing
    const existing = await User.findOne({ where: { email: normalizedEmail } });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // hash password
    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      passwordHash,
    });

    const token = signToken(user);

    return res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error('auth.register error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * POST /api/auth/login
 * Body: { email, password }
 * Response: { token, user: { id, name, email } }
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const user = await User.findOne({ where: { email: normalizedEmail } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // user.passwordHash field name depends on your model - adjust if different
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken(user);
    return res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('auth.login error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * GET /api/auth/me
 * middleware: auth (must have set req.user)
 */
exports.me = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Not authenticated' });
    return res.json({ id: user.id, name: user.name, email: user.email });
  } catch (err) {
    console.error('auth.me error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
