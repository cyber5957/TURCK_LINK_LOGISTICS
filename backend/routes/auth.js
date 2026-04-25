const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const User = require('../models/User');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const ACCESS_TOKEN_EXPIRES = '15m';
const REFRESH_TOKEN_EXPIRES = '7d';
const MFA_TOKEN_EXPIRES = '5m';
const isProduction = process.env.NODE_ENV === 'production';

const createToken = (payload, expiresIn) => jwt.sign(payload, JWT_SECRET, { expiresIn });
const createAccessToken = (user) => createToken({ id: user._id, role: user.role, type: 'access' }, ACCESS_TOKEN_EXPIRES);
const createRefreshToken = (user) => createToken({ id: user._id, type: 'refresh' }, REFRESH_TOKEN_EXPIRES);
const createMfaToken = (user) => createToken({ id: user._id, type: 'mfa' }, MFA_TOKEN_EXPIRES);

const saveRefreshToken = async (user, token) => {
  const hashed = await bcrypt.hash(token, 10);
  user.refreshTokens = user.refreshTokens || [];
  user.refreshTokens = user.refreshTokens.filter((entry) => {
    return !entry.createdAt || (Date.now() - new Date(entry.createdAt)) < 7 * 24 * 60 * 60 * 1000;
  });
  user.refreshTokens.push({ token: hashed, createdAt: new Date() });
  await user.save();
};

const verifyRefreshToken = async (user, token) => {
  if (!user.refreshTokens || !user.refreshTokens.length) return false;
  for (const entry of user.refreshTokens) {
    if (await bcrypt.compare(token, entry.token)) {
      return true;
    }
  }
  return false;
};

const removeRefreshToken = async (user, token) => {
  if (!user.refreshTokens) return;
  const remaining = [];
  for (const entry of user.refreshTokens) {
    if (!await bcrypt.compare(token, entry.token)) {
      remaining.push(entry);
    }
  }
  user.refreshTokens = remaining;
  await user.save();
};

const setRefreshCookie = (res, refreshToken) => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    sameSite: isProduction ? 'none' : 'lax',
    secure: isProduction,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const userPayload = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  mfaEnabled: !!user.mfaEnabled,
});

// Signup
router.post('/signup', async (req, res) => {
  const { name, email, password, role, phone, fleetSize } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const secret = speakeasy.generateSecret({ name: `TruckLink (${email})` });
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      phone,
      fleetSize,
      mfaEnabled: true,
      mfaSecret: secret.base32,
    });
    await user.save();

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);
    await saveRefreshToken(user, refreshToken);
    setRefreshCookie(res, refreshToken);

    res.status(201).json({
      token: accessToken,
      user: userPayload(user),
      mfaSecret: secret.base32,
      mfaOtpAuthUrl: secret.otpauth_url,
      message: 'Save this MFA secret in your authenticator app for future logins.',
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    if (user.mfaEnabled) {
      const mfaToken = createMfaToken(user);
      const mfaOtpAuthUrl = speakeasy.otpauthURL({
        secret: user.mfaSecret,
        label: `TruckLink (${user.email})`,
        encoding: 'base32',
      });

      return res.status(200).json({
        mfaRequired: true,
        mfaToken,
        mfaSecret: user.mfaSecret,
        mfaOtpAuthUrl,
      });
    }

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);
    await saveRefreshToken(user, refreshToken);
    setRefreshCookie(res, refreshToken);

    res.status(200).json({ token: accessToken, user: userPayload(user) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/verify-mfa', async (req, res) => {
  const { token, code } = req.body;
  if (!token || !code) {
    return res.status(400).json({ message: 'MFA token and code are required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.type !== 'mfa') {
      return res.status(401).json({ message: 'Invalid MFA token' });
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.mfaEnabled || !user.mfaSecret) {
      return res.status(401).json({ message: 'MFA is not configured for this user' });
    }

    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token: code,
      window: 1,
    });

    if (!verified) {
      return res.status(400).json({ message: 'Invalid MFA code' });
    }

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);
    await saveRefreshToken(user, refreshToken);
    setRefreshCookie(res, refreshToken);

    res.status(200).json({ token: accessToken, user: userPayload(user) });
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired MFA token' });
  }
});

router.post('/refresh-token', async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token is missing' });
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    if (decoded.type !== 'refresh') {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const user = await User.findById(decoded.id);
    if (!user || !(await verifyRefreshToken(user, refreshToken))) {
      return res.status(401).json({ message: 'Refresh token is invalid' });
    }

    await removeRefreshToken(user, refreshToken);
    const newAccessToken = createAccessToken(user);
    const newRefreshToken = createRefreshToken(user);
    await saveRefreshToken(user, newRefreshToken);
    setRefreshCookie(res, newRefreshToken);

    res.status(200).json({ token: newAccessToken, user: userPayload(user) });
  } catch (err) {
    res.status(401).json({ message: 'Refresh token is not valid' });
  }
});

router.post('/logout', async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user) {
        await removeRefreshToken(user, refreshToken);
      }
    } catch (err) {
      // ignore invalid refresh token still clear cookie
    }
  }

  res.clearCookie('refreshToken', {
    httpOnly: true,
    sameSite: isProduction ? 'none' : 'lax',
    secure: isProduction,
  });
  res.status(200).json({ message: 'Logged out' });
});

module.exports = router;
