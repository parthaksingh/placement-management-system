import { Router } from 'express'; import bcrypt from 'bcryptjs'; import jwt from 'jsonwebtoken'; import User from '../models/User.js';
const router = Router();
router.post('/login', async (req, res, next) => { try { const { email, password } = req.body; const user = await User.findOne({ email: email?.toLowerCase() }); if (!user || user.role !== 'ADMIN' || !await bcrypt.compare(password || '', user.password)) return res.status(401).json({ message: 'Invalid administrator credentials' }); const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '8h' }); res.json({ token, user: { name: user.name, email: user.email, role: user.role } }); } catch (e) { next(e); } });
export default router;
