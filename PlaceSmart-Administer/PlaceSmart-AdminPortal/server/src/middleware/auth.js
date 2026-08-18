import jwt from 'jsonwebtoken';
export const requireAdmin = (req, res, next) => { try { const token = req.headers.authorization?.split(' ')[1]; const user = jwt.verify(token, process.env.JWT_SECRET); if (user.role !== 'ADMIN') return res.status(403).json({ message: 'Administrator access required' }); req.user = user; next(); } catch { res.status(401).json({ message: 'Unauthorized' }); } };
