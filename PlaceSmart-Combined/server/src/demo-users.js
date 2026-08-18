import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Student from './models/Student.js';

/**
 * Creates or refreshes the two presentation accounts using normal MongoDB
 * records and bcrypt hashes. It does not remove any other database data.
 */
export async function ensureDemoAccounts() {
  const password = await bcrypt.hash('Password123!', 10);

  const admin = await User.findOneAndUpdate(
    { email: 'admin@placesmart.edu' },
    {
      name: 'Placement Cell Administrator',
      email: 'admin@placesmart.edu',
      registrationNumber: 'ADMIN001',
      password,
      role: 'ADMIN',
      active: true
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const studentUser = await User.findOneAndUpdate(
    { email: 'aarav.sharma@college.edu' },
    {
      name: 'Aarav Sharma',
      email: 'aarav.sharma@college.edu',
      registrationNumber: 'PS2022001',
      password,
      role: 'STUDENT',
      active: true
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await Student.findOneAndUpdate(
    { registrationNumber: 'PS2022001' },
    {
      user: studentUser._id,
      name: 'Aarav Sharma',
      email: 'aarav.sharma@college.edu',
      registrationNumber: 'PS2022001',
      branch: 'Computer Science',
      cgpa: 8.7,
      graduationYear: 2026,
      phone: '9876543210',
      skills: ['React', 'Node.js', 'MongoDB'],
      status: 'ACTIVE'
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return { admin, student: studentUser };
}
