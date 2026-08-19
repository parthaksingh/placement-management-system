import { Router } from 'express';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Company from '../models/Company.js';
import PlacementDrive from '../models/PlacementDrive.js';
import Application from '../models/Application.js';
import InterviewRound from '../models/InterviewRound.js';
import InterviewAssignment from '../models/InterviewAssignment.js';
import Notification from '../models/Notification.js';
import { assignmentResults, assignmentStudentIds, interviewNotification, roundPayload } from '../interview-rounds.js';

const router = Router();
const popApp = [{ path: 'student' }, { path: 'company' }, { path: 'placementDrive' }];

// ── Dashboard ──────────────────────────────────────────────────────────────
const recentActivity = async () => {
  const [students, companies, drives, apps] = await Promise.all([
    Student.find().sort('-createdAt').limit(3),
    Company.find().sort('-createdAt').limit(3),
    PlacementDrive.find().populate('company').sort('-createdAt').limit(3),
    Application.find().populate('student').sort('-createdAt').limit(3)
  ]);
  return [
    ...students.map(x => ({ text: `New student registered: ${x.name}`, date: x.createdAt })),
    ...companies.map(x => ({ text: `New company added: ${x.name}`, date: x.createdAt })),
    ...drives.map(x => ({ text: `Placement drive created: ${x.jobTitle} at ${x.company?.name}`, date: x.createdAt })),
    ...apps.map(x => ({ text: `New application from ${x.student?.name}`, date: x.createdAt }))
  ].sort((a, b) => b.date - a.date).slice(0, 6);
};

router.get('/dashboard', async (req, res, next) => {
  try {
    const [totalStudents, totalCompanies, activeDrives, totalApplications,
      pending, review, shortlisted, selected, activities] = await Promise.all([
      Student.countDocuments(),
      Company.countDocuments(),
      PlacementDrive.countDocuments({ status: 'ACTIVE' }),
      Application.countDocuments(),
      Application.countDocuments({ status: { $in: ['APPLIED', 'PENDING'] } }),
      Application.countDocuments({ status: 'UNDER REVIEW' }),
      Application.countDocuments({ status: 'SHORTLISTED' }),
      Application.countDocuments({ status: 'SELECTED' }),
      recentActivity()
    ]);
    res.json({
      totals: { totalStudents, totalCompanies, activeDrives, totalApplications },
      funnel: { applications: totalApplications, pending, underReview: review, shortlisted, interview: shortlisted, selected },
      activities
    });
  } catch (e) { next(e); }
});

// ── Students ───────────────────────────────────────────────────────────────
router.get('/students', async (req, res, next) => {
  try {
    const q = {};
    if (req.query.search) q.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
      { registrationNumber: { $regex: req.query.search, $options: 'i' } }
    ];
    if (req.query.branch) q.branch = req.query.branch;
    if (req.query.status) q.status = req.query.status;
    if (req.query.cgpa) q.cgpa = { $gte: Number(req.query.cgpa) };
    res.json(await Student.find(q).sort('-createdAt'));
  } catch (e) { next(e); }
});

router.get('/students/:id', async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    const applications = await Application.find({ student: student._id }).populate('company placementDrive');
    res.json({ ...student.toObject(), applications });
  } catch (e) { next(e); }
});

router.put('/students/:id', async (req, res, next) => {
  try {
    const x = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!x) return res.status(404).json({ message: 'Student not found' });
    res.json(x);
  } catch (e) { next(e); }
});

router.delete('/students/:id', async (req, res, next) => {
  try {
    const x = await Student.findByIdAndDelete(req.params.id);
    if (!x) return res.status(404).json({ message: 'Student not found' });
    // Cascade: delete user account and applications
    await Promise.all([
      User.findByIdAndDelete(x.user),
      Application.deleteMany({ student: x._id })
    ]);
    res.status(204).end();
  } catch (e) { next(e); }
});

// ── Companies ──────────────────────────────────────────────────────────────
router.get('/companies', async (req, res, next) => {
  try {
    const list = await Company.find().sort('-createdAt').lean();
    const ids = list.map(x => x._id);
    const counts = await PlacementDrive.aggregate([
      { $match: { company: { $in: ids }, status: 'ACTIVE' } },
      { $group: { _id: '$company', count: { $sum: 1 } } }
    ]);
    const map = Object.fromEntries(counts.map(x => [x._id, x.count]));
    res.json(list.map(x => ({ ...x, activeDrives: map[x._id] || 0 })));
  } catch (e) { next(e); }
});

router.post('/companies', async (req, res, next) => {
  try { res.status(201).json(await Company.create(req.body)); } catch (e) { next(e); }
});

router.get('/companies/:id', async (req, res, next) => {
  try {
    const x = await Company.findById(req.params.id);
    if (!x) return res.status(404).json({ message: 'Company not found' });
    res.json(x);
  } catch (e) { next(e); }
});

router.put('/companies/:id', async (req, res, next) => {
  try {
    const x = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!x) return res.status(404).json({ message: 'Company not found' });
    res.json(x);
  } catch (e) { next(e); }
});

router.delete('/companies/:id', async (req, res, next) => {
  try {
    const x = await Company.findByIdAndDelete(req.params.id);
    if (!x) return res.status(404).json({ message: 'Company not found' });
    res.status(204).end();
  } catch (e) { next(e); }
});

// ── Placement Drives ───────────────────────────────────────────────────────
router.get('/placement-drives', async (req, res, next) => {
  try { res.json(await PlacementDrive.find().populate('company').sort('-createdAt')); } catch (e) { next(e); }
});

router.post('/placement-drives', async (req, res, next) => {
  try { res.status(201).json(await PlacementDrive.create(req.body)); } catch (e) { next(e); }
});

router.get('/placement-drives/:id', async (req, res, next) => {
  try {
    const x = await PlacementDrive.findById(req.params.id).populate('company');
    if (!x) return res.status(404).json({ message: 'Placement drive not found' });
    const applications = await Application.find({ placementDrive: x._id }).populate(popApp);
    res.json({ ...x.toObject(), applications });
  } catch (e) { next(e); }
});

router.put('/placement-drives/:id', async (req, res, next) => {
  try {
    const x = await PlacementDrive.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('company');
    if (!x) return res.status(404).json({ message: 'Placement drive not found' });
    res.json(x);
  } catch (e) { next(e); }
});

router.delete('/placement-drives/:id', async (req, res, next) => {
  try {
    const x = await PlacementDrive.findByIdAndDelete(req.params.id);
    if (!x) return res.status(404).json({ message: 'Placement drive not found' });
    res.status(204).end();
  } catch (e) { next(e); }
});

// Candidates are deliberately restricted to shortlisted applications for this drive.
// The administrator controls progression to every individual interview round.
router.get('/placement-drives/:id/interview-candidates', async (req, res, next) => {
  try {
    const targetRound = req.query.roundId
      ? await InterviewRound.findById(req.query.roundId).select('roundType')
      : { roundType: req.query.roundType };
    const selectedAssignments = req.query.roundId
      ? await InterviewAssignment.find({ interviewRound: req.query.roundId }).select('student result').lean()
      : [];
    const selectedStudentIds = selectedAssignments.map(assignment => assignment.student);
    const selectedResults = new Map(selectedAssignments.map(assignment => [String(assignment.student), assignment.result]));
    const applications = await Application.find({
      placementDrive: req.params.id,
      $or: [{ status: 'SHORTLISTED' }, { student: { $in: selectedStudentIds } }]
    })
      .populate('student', 'name email registrationNumber branch')
      .sort('student.name')
      .lean();
    const allowedIds = await eligibleStudentIdsForRound(req.params.id, targetRound, req.query.roundId);
    res.json(applications.filter(application => application.student).map(application => ({
      applicationId: application._id,
      student: application.student,
      applicationStatus: application.status,
      result: selectedResults.get(String(application.student._id)) || 'PENDING',
      eligibleForRound: allowedIds.has(String(application.student._id))
    })).filter(candidate => candidate.eligibleForRound || selectedStudentIds.some(id => String(id) === String(candidate.student._id))));
  } catch (e) { next(e); }
});

// ── Applications ───────────────────────────────────────────────────────────
router.get('/applications', async (req, res, next) => {
  try {
    const apps = await Application.find().populate(popApp).sort('-createdAt');
    const search = String(req.query.search || '').toLowerCase();
    res.json(apps.filter(a =>
      (!search || a.student?.name?.toLowerCase().includes(search)) &&
      (!req.query.company || String(a.company?._id) === req.query.company) &&
      (!req.query.drive || String(a.placementDrive?._id) === req.query.drive) &&
      (!req.query.status || a.status === req.query.status) &&
      (!req.query.branch || a.student?.branch === req.query.branch)
    ));
  } catch (e) { next(e); }
});

router.get('/applications/:id', async (req, res, next) => {
  try {
    const x = await Application.findById(req.params.id).populate(popApp);
    if (!x) return res.status(404).json({ message: 'Application not found' });
    res.json(x);
  } catch (e) { next(e); }
});

router.put('/applications/:id/status', async (req, res, next) => {
  try {
    const { status, currentStage } = req.body;
    const x = await Application.findByIdAndUpdate(
      req.params.id,
      { status, currentStage: currentStage || status },
      { new: true, runValidators: true }
    ).populate(popApp);
    if (!x) return res.status(404).json({ message: 'Application not found' });
    // Notify the student
    await Notification.create({
      title: status === 'SELECTED' ? 'Congratulations — You are selected!' : `Application status: ${status}`,
      message: `Your application for ${x.placementDrive?.jobTitle} at ${x.company?.name} is now ${status}.`,
      targetAudience: 'INDIVIDUAL',
      student: x.student._id,
      placementDrive: x.placementDrive?._id
    });
    res.json(x);
  } catch (e) { next(e); }
});

// ── Interview Rounds ───────────────────────────────────────────────────────
router.get('/interview-rounds', async (req, res, next) => {
  try {
    const rounds = await InterviewRound.find().populate('company placementDrive').sort('date').lean();
    const counts = await InterviewAssignment.aggregate([
      { $group: { _id: '$interviewRound', count: { $sum: 1 } } }
    ]);
    const countByRound = new Map(counts.map(item => [String(item._id), item.count]));
    res.json(rounds.map(round => ({ ...round, assignedStudentCount: countByRound.get(String(round._id)) || 0 })));
  } catch (e) { next(e); }
});

router.get('/interview-rounds/:id', async (req, res, next) => {
  try {
    const round = await InterviewRound.findById(req.params.id).populate('company placementDrive').lean();
    if (!round) return res.status(404).json({ message: 'Interview round not found' });
    const assignments = await InterviewAssignment.find({ interviewRound: round._id }).select('student result').lean();
    res.json({
      ...round,
      studentIds: assignments.map(assignment => String(assignment.student)),
      studentResults: Object.fromEntries(assignments.map(assignment => [String(assignment.student), assignment.result]))
    });
  } catch (e) { next(e); }
});

const shortlistedStudentIds = async placementDrive => {
  const applications = await Application.find({ placementDrive, status: 'SHORTLISTED' }).select('student').lean();
  return new Set(applications.map(application => String(application.student)));
};

const roundOrder = { Aptitude: 1, Coding: 2, Technical: 3, HR: 4, 'Final Interview': 5 };

const eligibleStudentIdsForRound = async (placementDrive, round, roundId) => {
  const shortlisted = await shortlistedStudentIds(placementDrive);
  const targetOrder = roundOrder[round?.roundType] || 1;
  if (targetOrder === 1) return shortlisted;
  const priorRounds = await InterviewRound.find({
    placementDrive,
    _id: roundId ? { $ne: roundId } : { $exists: true },
    status: { $ne: 'CANCELLED' }
  }).select('_id status roundType').lean();
  const priorRound = priorRounds
    .filter(candidate => (roundOrder[candidate.roundType] || 1) < targetOrder)
    .sort((left, right) => (roundOrder[right.roundType] || 1) - (roundOrder[left.roundType] || 1))[0];
  if (!priorRound) return shortlisted;
  if (priorRound.status !== 'COMPLETED') return new Set();
  const passed = await InterviewAssignment.find({ interviewRound: priorRound._id, result: 'PASSED' }).select('student').lean();
  return new Set(passed.map(assignment => String(assignment.student)).filter(studentId => shortlisted.has(studentId)));
};

const saveAssignments = async ({ round, drive, studentIds, studentResults, previousStudentIds = [], scheduleUpdated = false }) => {
  const requestedIds = assignmentStudentIds(studentIds);
  const allowedIds = await eligibleStudentIdsForRound(drive._id, round, round._id);
  if (requestedIds.some(id => !allowedIds.has(id))) {
    const error = new Error('Only shortlisted students who passed the previous completed round can be assigned to this interview round.');
    error.status = 400;
    throw error;
  }
  const results = assignmentResults(requestedIds, studentResults);

  await InterviewAssignment.deleteMany({ interviewRound: round._id, student: { $nin: requestedIds } });
  if (requestedIds.length) {
    await InterviewAssignment.bulkWrite(requestedIds.map(student => ({
      updateOne: {
        filter: { student, interviewRound: round._id },
        update: { $set: { placementDrive: drive._id, result: results[student] } },
        upsert: true
      }
    })));
  }

  const recipients = scheduleUpdated
    ? requestedIds
    : requestedIds.filter(id => !previousStudentIds.includes(id));
  if (!recipients.length) return;

  const company = await Company.findById(drive.company).select('name').lean();
  const notification = interviewNotification(round, drive, company, scheduleUpdated);
  await Notification.insertMany(recipients.map(student => ({
    ...notification,
    targetAudience: 'INDIVIDUAL',
    student,
    placementDrive: drive._id
  })));
};

router.post('/interview-rounds', async (req, res, next) => {
  try {
    const payload = roundPayload(req.body);
    const drive = await PlacementDrive.findById(payload.placementDrive).select('company');
    if (!drive) return res.status(400).json({ message: 'A valid placement drive is required.' });
    if (String(drive.company) !== String(payload.company)) {
      return res.status(400).json({ message: 'The interview round company must match its placement drive.' });
    }
    const requestedIds = assignmentStudentIds(req.body.studentIds);
    const allowedIds = await eligibleStudentIdsForRound(drive._id, payload, null);
    if (requestedIds.some(id => !allowedIds.has(id))) {
      return res.status(400).json({ message: 'Only shortlisted students who passed the previous completed round can be assigned to an interview round.' });
    }
    const round = await InterviewRound.create(payload);
    await saveAssignments({ round, drive, studentIds: requestedIds, studentResults: req.body.studentResults });
    res.status(201).json(round);
  } catch (e) { next(e); }
});

router.put('/interview-rounds/:id', async (req, res, next) => {
  try {
    const existing = await InterviewRound.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Interview round not found' });
    const payload = roundPayload(req.body);
    const drive = await PlacementDrive.findById(payload.placementDrive || existing.placementDrive).select('company');
    const company = payload.company || existing.company;
    if (!drive) return res.status(400).json({ message: 'A valid placement drive is required.' });
    if (String(drive.company) !== String(company)) {
      return res.status(400).json({ message: 'The interview round company must match its placement drive.' });
    }
    const previousAssignments = await InterviewAssignment.find({ interviewRound: existing._id }).select('student result').lean();
    const scheduleUpdated = ['roundName', 'roundType', 'date', 'time', 'location', 'meetingLink', 'description', 'status']
      .some(key => String(existing[key] ?? '') !== String(payload[key] ?? existing[key] ?? ''));
    const x = await InterviewRound.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    await saveAssignments({
      round: x,
      drive,
      studentIds: req.body.studentIds ?? previousAssignments.map(assignment => String(assignment.student)),
      studentResults: req.body.studentResults ?? Object.fromEntries(previousAssignments.map(assignment => [String(assignment.student), assignment.result])),
      previousStudentIds: previousAssignments.map(assignment => String(assignment.student)),
      scheduleUpdated
    });
    res.json(x);
  } catch (e) { next(e); }
});

router.delete('/interview-rounds/:id', async (req, res, next) => {
  try {
    const x = await InterviewRound.findByIdAndDelete(req.params.id);
    if (!x) return res.status(404).json({ message: 'Interview round not found' });
    await InterviewAssignment.deleteMany({ interviewRound: x._id });
    res.status(204).end();
  } catch (e) { next(e); }
});

// ── Reports ────────────────────────────────────────────────────────────────
router.get('/reports', async (req, res, next) => {
  try {
    const [students, companies, drives, apps, groups] = await Promise.all([
      Student.countDocuments(),
      Company.countDocuments(),
      PlacementDrive.countDocuments(),
      Application.countDocuments(),
      Application.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }])
    ]);
    const statuses = Object.fromEntries(groups.map(x => [x._id, x.count]));
    const companyStats = await Application.aggregate([
      { $group: { _id: '$company', applications: { $sum: 1 }, selected: { $sum: { $cond: [{ $eq: ['$status', 'SELECTED'] }, 1, 0] } } } },
      { $lookup: { from: 'companies', localField: '_id', foreignField: '_id', as: 'company' } },
      { $unwind: '$company' },
      { $project: { name: '$company.name', applications: 1, selected: 1 } }
    ]);
    res.json({
      totals: { students, companies, drives, applications: apps },
      statuses,
      placementRate: students ? Math.round(((statuses.SELECTED || 0) / students) * 100) : 0,
      companyStats
    });
  } catch (e) { next(e); }
});

// ── Notifications ──────────────────────────────────────────────────────────
router.get('/notifications', async (req, res, next) => {
  try { res.json(await Notification.find().populate('placementDrive student').sort('-createdAt')); } catch (e) { next(e); }
});

router.post('/notifications', async (req, res, next) => {
  try { res.status(201).json(await Notification.create(req.body)); } catch (e) { next(e); }
});

router.delete('/notifications/:id', async (req, res, next) => {
  try {
    const x = await Notification.findByIdAndDelete(req.params.id);
    if (!x) return res.status(404).json({ message: 'Notification not found' });
    res.status(204).end();
  } catch (e) { next(e); }
});

export default router;
