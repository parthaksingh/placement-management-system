import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Student from '../models/Student.js';

const router = Router();
const secret = () => process.env.JWT_SECRET || 'dev-secret';
const sign = u => jwt.sign({ id: u._id, role: u.role, name: u.name }, secret(), { expiresIn: '7d' });

// POST /api/auth/login — supports College Email OR Registration Number / ID for both STUDENT and ADMIN
router.post('/login', async (req, res, next) => {
  try {
    const identifier = (req.body.identifier || req.body.email || req.body.registrationNumber || '').trim();
    const password = req.body.password || '';

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Please enter your email or registration number and password.' });
    }

    let user = null;

    if (identifier.includes('@')) {
      user = await User.findOne({ email: identifier.toLowerCase(), active: true });
    } else {
      // 1. Check User model by registrationNumber
      user = await User.findOne({
        registrationNumber: new RegExp(`^${identifier}$`, 'i'),
        active: true
      });

      // 2. If not found in User, check Student model by registrationNumber
      if (!user) {
        const student = await Student.findOne({
          registrationNumber: new RegExp(`^${identifier}$`, 'i'),
          status: { $ne: 'INACTIVE' }
        });
        if (student && student.user) {
          user = await User.findById(student.user);
        }
      }
    }

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email, registration number, or password.' });
    }

    res.json({
      token: sign(user),
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        email: user.email,
        registrationNumber: user.registrationNumber
      }
    });
  } catch (e) {
    next(e);
  }
});

// POST /api/auth/register — register a new student
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, branch, cgpa, graduationYear, phone, skills, registrationNumber } = req.body;
    if (await User.exists({ email: email?.toLowerCase() })) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      registrationNumber: registrationNumber?.toUpperCase()?.trim(),
      password: hash,
      role: 'STUDENT'
    });
    const student = await Student.create({
      user: user._id,
      name,
      email,
      registrationNumber: registrationNumber?.toUpperCase()?.trim(),
      branch,
      cgpa: Number(cgpa) || undefined,
      graduationYear: Number(graduationYear) || undefined,
      phone,
      skills: skills || []
    });
    res.status(201).json({ token: sign(user), user: { id: user._id, name, role: 'STUDENT', email } });
  } catch (e) {
    next(e);
  }
});

export default router;
