const express = require('express');
const { register, login } = require('../controllers/auth.controller');
const router = express.Router();

router.post('/register', (req, res, next) => {
  req.body.role = 'admin';
  next();
}, register);

router.post('/login', (req, res, next) => {
  // Don't force role - let the controller determine it automatically
  // This allows both admin and super-admin to login through this endpoint
  next();
}, login);

module.exports = router;
