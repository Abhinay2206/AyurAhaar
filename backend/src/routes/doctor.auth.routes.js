const express = require('express');
const { register, login } = require('../controllers/auth.controller');
const router = express.Router();

router.post('/register', (req, res, next) => {
  req.body.role = 'doctor';
  next();
}, register);

router.post('/login', (req, res, next) => {
  req.body.role = 'doctor';
  next();
}, login);

module.exports = router;
