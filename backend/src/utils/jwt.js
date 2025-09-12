const jwt = require('jsonwebtoken');

function signToken(payload, options = {}) {
  const secret = process.env.JWT_SECRET || 'dev_secret_change_me';
  const expiresIn = options.expiresIn || '7d';
  return jwt.sign(payload, secret, { expiresIn });
}

function verifyToken(token) {
  const secret = process.env.JWT_SECRET || 'dev_secret_change_me';
  return jwt.verify(token, secret);
}

module.exports = { signToken, verifyToken };
