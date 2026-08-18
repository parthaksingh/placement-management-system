import { Router } from 'express';
import Student from '../models/Student.js';
import PlacementDrive from '../models/PlacementDrive.js';
import Application from '../models/Application.js';
import Notification from '../models/Notification.js';
import { eligibility } from '../eligibility.js';

const router = Router();

// Helper: get the student doc for the currently logged-in user
const studentFor = userId => Student.findOne({ user: userId });

// GET /api/student/profile
router.get('/profile', async (req, res, next) => {
  try { res.json(await studentFor(req.user.id)); } catch (e) { next(e); }
});

// PUT /api/student/profile
// Note: CGPA, Branch, Registration Number, and Status are officially managed by the Administrator/Institution.
router.put('/profile', async (req, res, next) => {
  try {
    const { name, phone, skills, resume, graduationYear } = req.body;
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (phone !== undefined) {
      const cleanPhone = phone.trim().replace(/\D/g, '');
      if (cleanPhone.length > 0 && cleanPhone.length !== 10) {
        return res.status(400).json({ message: 'Contact phone number must be exactly 10 digits (e.g. 9876543210).' });
      }
      updateData.phone = cleanPhone;
    }
    if (skills !== undefined) updateData.skills = skills;
    if (resume !== undefined) updateData.resume = resume.trim();
    if (graduationYear !== undefined) updateData.graduationYear = graduationYear;

    const s = await Student.findOneAndUpdate({ user: req.user.id }, updateData, { new: true });
    res.json(s);
  } catch (e) { next(e); }
});

// GET /api/student/placement-drives — open active drives
router.get('/placement-drives', async (req, res, next) => {
  try {
    res.json(await PlacementDrive.find({ status: 'ACTIVE' }).populate('company').sort({ applicationDeadline: 1 }));
  } catch (e) { next(e); }
});

// GET /api/student/placement-drives/:id/eligibility
router.get('/placement-drives/:id/eligibility', async (req, res, next) => {
  try {
    const [student, drive] = await Promise.all([
      studentFor(req.user.id),
      PlacementDrive.findById(req.params.id)
    ]);
    if (!drive) return res.status(404).json({ message: 'Drive not found' });
    res.json(eligibility(student, drive));
  } catch (e) { next(e); }
});

// POST /api/student/applications — apply to a drive
router.post('/applications', async (req, res, next) => {
  try {
    const [student, drive] = await Promise.all([
      studentFor(req.user.id),
      PlacementDrive.findById(req.body.driveId).populate('company')
    ]);
    if (!drive || drive.status !== 'ACTIVE')
      return res.status(400).json({ message: 'Applications are closed for this drive' });
    if (drive.applicationDeadline && new Date() > drive.applicationDeadline)
      return res.status(400).json({ message: 'Application deadline has passed' });
    const check = eligibility(student, drive);
    if (!check.eligible)
      return res.status(403).json({ message: 'You are not eligible for this drive', reasons: check.reasons });
    try {
      const app = await Application.create({
        student: student._id,
        company: drive.company._id,
        placementDrive: drive._id,
        status: 'PENDING',
        currentStage: 'Application'
      });
      await Notification.create({
        title: 'Application submitted',
        message: `Your application for ${drive.jobTitle} at ${drive.company.name} is under review.`,
        targetAudience: 'INDIVIDUAL',
        student: student._id
      });
      res.status(201).json(await app.populate([{ path: 'company' }, { path: 'placementDrive', populate: { path: 'company' } }]));
    } catch (e) {
      if (e.code === 11000) return res.status(409).json({ message: 'You have already applied to this drive' });
      throw e;
    }
  } catch (e) { next(e); }
});

// GET /api/student/applications — my applications
router.get('/applications', async (req, res, next) => {
  try {
    const student = await studentFor(req.user.id);
    const apps = await Application.find({ student: student._id })
      .populate('company')
      .populate({ path: 'placementDrive', populate: { path: 'company' } })
      .sort({ createdAt: -1 });
    res.json(apps);
  } catch (e) { next(e); }
});

// PUT /api/student/applications/:id/withdraw
router.put('/applications/:id/withdraw', async (req, res, next) => {
  try {
    const student = await studentFor(req.user.id);
    const app = await Application.findOneAndUpdate(
      { _id: req.params.id, student: student._id, status: { $in: ['PENDING', 'UNDER REVIEW'] } },
      { status: 'REJECTED', currentStage: 'Withdrawn by student' },
      { new: true }
    );
    if (!app) return res.status(400).json({ message: 'This application cannot be withdrawn' });
    res.json(app);
  } catch (e) { next(e); }
});

// GET /api/student/notifications
router.get('/notifications', async (req, res, next) => {
  try {
    const student = await studentFor(req.user.id);
    // Return: notifications targeted to this student individually, or broad broadcasts
    const notifs = await Notification.find({
      $or: [
        { targetAudience: 'ALL_STUDENTS' },
        { targetAudience: 'INDIVIDUAL', student: student._id }
      ]
    }).sort({ createdAt: -1 }).limit(30);
    res.json(notifs);
  } catch (e) { next(e); }
});

export default router;
