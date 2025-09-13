const User = require('../models/UserBase');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Admin = require('../models/Admin');
const { signToken } = require('../utils/jwt');
const NotificationService = require('../services/notificationService');

const notificationService = new NotificationService();

function pickUser(u) {
  return { id: u._id, name: u.name, email: u.email, role: u.role };
}

const doctorAllowed = ['name','email','password','role','phone','specialization','licenseNumber','experience','location'];
const patientAllowed = ['name','email','password','role','phone','age','weight','height','lifestyle','allergies','healthConditions'];
const adminAllowed = ['name','email','password','role'];

function filterBody(body, allowed) {
  return Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)));
}

async function register(req, res) {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'name, email, password, role required' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already in use' });

    let user;
    switch (role) {
      case 'doctor': {
        const data = filterBody(req.body, doctorAllowed);
        user = await Doctor.create(data);
        break;
      }
      case 'patient': {
        const data = filterBody(req.body, patientAllowed);
        user = await Patient.create(data);
        break;
      }
      case 'admin': {
        const data = filterBody(req.body, adminAllowed);
        user = await Admin.create(data);
        break;
      }
      case 'super-admin': {
        const data = filterBody(req.body, adminAllowed);
        user = await Admin.create(data);
        break;
      }
      default:
        return res.status(400).json({ message: 'Invalid role' });
    }

    const token = signToken({ sub: user._id, role: user.role });
    
    // Send welcome notifications for patients
    if (role === 'patient') {
      try {
        await notificationService.sendRegistrationNotifications({
          name: user.name,
          email: user.email,
          phone: user.phone
        });
        console.log('Welcome notifications sent for patient:', user.email);
      } catch (notificationError) {
        console.error('Failed to send welcome notifications:', notificationError);
        // Don't fail the registration if notifications fail
      }
    }
    
    res.status(201).json({ user: pickUser(user), token });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Email already in use' });
    }
    res.status(500).json({ message: 'Server error' });
  }
}

async function login(req, res) {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      return res.status(400).json({ message: 'email, password, role required' });
    }

    const user = await User.findOne({ email, role });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken({ sub: user._id, role: user.role });
    
    // For patients, include survey completion status
    const response = { user: pickUser(user), token };
    if (role === 'patient') {
      response.surveyCompleted = user.surveyCompleted || false;
    }
    
    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { register, login };
