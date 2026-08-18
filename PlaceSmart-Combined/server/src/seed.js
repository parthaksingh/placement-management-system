import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Student from './models/Student.js';
import Company from './models/Company.js';
import PlacementDrive from './models/PlacementDrive.js';
import Application from './models/Application.js';
import InterviewRound from './models/InterviewRound.js';
import Notification from './models/Notification.js';

if (!process.env.MONGODB_URI) { console.error('Set MONGODB_URI in server/.env'); process.exit(1); }

await mongoose.connect(process.env.MONGODB_URI);
console.log('Connected to MongoDB. Clearing existing data…');
await Promise.all([
  User.deleteMany({}), Student.deleteMany({}), Company.deleteMany({}),
  PlacementDrive.deleteMany({}), Application.deleteMany({}),
  InterviewRound.deleteMany({}), Notification.deleteMany({})
]);

// Admin user
await User.create({
  name: 'Placement Cell Administrator',
  email: 'admin@placesmart.edu',
  registrationNumber: 'ADMIN001',
  password: await bcrypt.hash('Password123!', 10),
  role: 'ADMIN'
});

// Student users + profiles
const studentData = [
  { name: 'Aarav Sharma', email: 'aarav.sharma@college.edu', reg: 'PS2022001', branch: 'Computer Science', cgpa: 8.7, year: 2026, phone: '9876543210', skills: ['React', 'Node.js', 'MongoDB'] },
  { name: 'Diya Patel', email: 'diya.patel@college.edu', reg: 'PS2022002', branch: 'Information Technology', cgpa: 9.1, year: 2026, phone: '9876543211', skills: ['Java', 'SQL', 'Spring Boot'] },
  { name: 'Rohan Mehta', email: 'rohan.mehta@college.edu', reg: 'PS2022003', branch: 'Electronics', cgpa: 7.9, year: 2026, phone: '9876543212', skills: ['Python', 'C++', 'IoT'] },
  { name: 'Meera Nair', email: 'meera.nair@college.edu', reg: 'PS2022004', branch: 'Computer Science', cgpa: 8.3, year: 2026, phone: '9876543213', skills: ['Figma', 'JavaScript', 'UI Design'] }
];

const hash = await bcrypt.hash('Password123!', 10);
const students = [];
for (const d of studentData) {
  const user = await User.create({ name: d.name, email: d.email, registrationNumber: d.reg, password: hash, role: 'STUDENT' });
  const student = await Student.create({
    user: user._id, name: d.name, email: d.email,
    registrationNumber: d.reg, branch: d.branch, cgpa: d.cgpa,
    graduationYear: d.year, phone: d.phone, skills: d.skills, status: 'ACTIVE'
  });
  students.push(student);
}

// Companies
const companies = await Company.create([
  { name: 'Infosys', industry: 'Information Technology', description: 'Global digital services and consulting.', location: 'Bengaluru', website: 'https://www.infosys.com', recruiterName: 'Anita Rao', recruiterEmail: 'anita.rao@infosys.com', recruiterPhone: '9000000001' },
  { name: 'Deloitte', industry: 'Consulting', description: 'Professional services and technology consulting.', location: 'Hyderabad', website: 'https://www.deloitte.com', recruiterName: 'Karan Shah', recruiterEmail: 'karan.shah@deloitte.com', recruiterPhone: '9000000002' },
  { name: 'Zoho', industry: 'Software', description: 'Cloud software company.', location: 'Chennai', website: 'https://www.zoho.com', recruiterName: 'Priya Iyer', recruiterEmail: 'priya.iyer@zoho.com', recruiterPhone: '9000000003' }
]);

// Drives
const drives = await PlacementDrive.create([
  { company: companies[0]._id, jobTitle: 'Systems Engineer', description: 'Build and support enterprise software.', location: 'Bengaluru', workMode: 'Hybrid', package: '₹7.2 LPA', applicationDeadline: new Date('2026-12-15'), minimumCgpa: 7, allowedBranches: ['Computer Science', 'Information Technology'], requiredSkills: ['Java', 'SQL'], status: 'ACTIVE' },
  { company: companies[1]._id, jobTitle: 'Technology Analyst', description: 'Technology consulting graduate role.', location: 'Hyderabad', workMode: 'On-site', package: '₹9 LPA', applicationDeadline: new Date('2026-12-20'), minimumCgpa: 7.5, allowedBranches: ['Computer Science', 'Information Technology', 'Electronics'], requiredSkills: ['Python'], status: 'ACTIVE' },
  { company: companies[2]._id, jobTitle: 'Software Developer', description: 'Product engineering role.', location: 'Chennai', workMode: 'On-site', package: '₹8 LPA', applicationDeadline: new Date('2026-12-10'), minimumCgpa: 8, allowedBranches: ['Computer Science'], requiredSkills: ['JavaScript', 'Java'], status: 'ACTIVE' }
]);

// Applications
await Application.create([
  { student: students[0]._id, company: companies[0]._id, placementDrive: drives[0]._id, status: 'SHORTLISTED', currentStage: 'Technical Interview' },
  { student: students[1]._id, company: companies[1]._id, placementDrive: drives[1]._id, status: 'UNDER REVIEW', currentStage: 'Application Review' },
  { student: students[2]._id, company: companies[1]._id, placementDrive: drives[1]._id, status: 'PENDING', currentStage: 'Application' },
  { student: students[3]._id, company: companies[2]._id, placementDrive: drives[2]._id, status: 'SELECTED', currentStage: 'Offer Extended' }
]);

// Interview Rounds
await InterviewRound.create([
  { company: companies[0]._id, placementDrive: drives[0]._id, roundName: 'Technical Discussion', roundType: 'Technical', date: new Date('2026-12-18'), time: '10:00 AM', location: 'Seminar Hall A', description: 'Technical interview for shortlisted candidates.', status: 'SCHEDULED' },
  { company: companies[1]._id, placementDrive: drives[1]._id, roundName: 'Aptitude Assessment', roundType: 'Aptitude', date: new Date('2026-12-22'), time: '02:00 PM', location: 'Computer Lab 2', description: 'Online aptitude assessment.', status: 'SCHEDULED' }
]);

// Notifications
await Notification.create([
  { title: 'Placement season is open!', message: 'Review active opportunities and keep your profile up to date. Good luck!', targetAudience: 'ALL_STUDENTS' },
  { title: 'Infosys interview scheduled', message: 'Technical round for Infosys Systems Engineer is on 18 December at Seminar Hall A.', targetAudience: 'ALL_STUDENTS', placementDrive: drives[0]._id },
  { title: 'Application shortlisted!', message: 'Congratulations! Your application for Systems Engineer at Infosys has been shortlisted.', targetAudience: 'INDIVIDUAL', student: students[0]._id, placementDrive: drives[0]._id },
  { title: 'Congratulations — You are selected!', message: 'Your application for Software Developer at Zoho has been accepted. Welcome aboard!', targetAudience: 'INDIVIDUAL', student: students[3]._id, placementDrive: drives[2]._id }
]);

console.log('✅ Seed complete!');
console.log('   Admin login: admin@placesmart.edu / Password123!');
console.log('   Student login: aarav.sharma@college.edu / Password123!');
console.log('   Student login: diya.patel@college.edu / Password123!');
await mongoose.disconnect();
