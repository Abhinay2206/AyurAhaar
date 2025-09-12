const express = require('express');
const { register, login } = require('../controllers/auth.controller');
const router = express.Router();

router.post('/register', (req, res, next) => {
  req.body.role = 'patient';
  next();
}, register);

router.post('/login', (req, res, next) => {
  req.body.role = 'patient';
  next();
}, login);

module.exports = router;
