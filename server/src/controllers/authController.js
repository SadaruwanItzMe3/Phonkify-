const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const generateTokens = require('../utils/generateTokens');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};

// @route  POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    res.status(400);
    throw new Error('Username, email, and password are all required');
  }

  const existing = await User.findOne({ $or: [{ email }, { username }] });
  if (existing) {
    res.status(409);
    throw new Error('An account with that email or username already exists');
  }

  const user = await User.create({ username, email, password, provider: 'local' });
  const { accessToken, refreshToken } = generateTokens(user._id);

  user.refreshTokens.push(refreshToken);
  await user.save();

  res.cookie('refreshToken', refreshToken, cookieOptions);
  res.status(201).json({ success: true, user: user.toSafeObject(), accessToken });
});

// @route  POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const { accessToken, refreshToken } = generateTokens(user._id);
  user.refreshTokens.push(refreshToken);
  await user.save();

  res.cookie('refreshToken', refreshToken, cookieOptions);
  res.status(200).json({ success: true, user: user.toSafeObject(), accessToken });
});

// @route  POST /api/auth/google
// Verifies a Google ID token from the client-side "Sign in with Google" flow
const googleSignIn = asyncHandler(async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) {
    res.status(400);
    throw new Error('idToken is required');
  }

  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();

  let user = await User.findOne({ email: payload.email });

  if (!user) {
    user = await User.create({
      username: payload.email.split('@')[0] + Math.floor(Math.random() * 1000),
      email: payload.email,
      avatarUrl: payload.picture,
      provider: 'google',
      googleId: payload.sub,
    });
  }

  const { accessToken, refreshToken } = generateTokens(user._id);
  user.refreshTokens.push(refreshToken);
  await user.save();

  res.cookie('refreshToken', refreshToken, cookieOptions);
  res.status(200).json({ success: true, user: user.toSafeObject(), accessToken });
});

// @route  POST /api/auth/refresh
const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    res.status(401);
    throw new Error('No refresh token provided');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    res.status(401);
    throw new Error('Invalid or expired refresh token');
  }

  const user = await User.findById(decoded.id).select('+refreshTokens');
  if (!user || !user.refreshTokens.includes(token)) {
    res.status(401);
    throw new Error('Refresh token not recognized');
  }

  const tokens = generateTokens(user._id);
  user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
  user.refreshTokens.push(tokens.refreshToken);
  await user.save();

  res.cookie('refreshToken', tokens.refreshToken, cookieOptions);
  res.status(200).json({ success: true, accessToken: tokens.accessToken });
});

// @route  POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (token) {
    await User.updateOne({ refreshTokens: token }, { $pull: { refreshTokens: token } });
  }
  res.clearCookie('refreshToken', cookieOptions);
  res.status(200).json({ success: true, message: 'Logged out' });
});

module.exports = { register, login, googleSignIn, refresh, logout };
