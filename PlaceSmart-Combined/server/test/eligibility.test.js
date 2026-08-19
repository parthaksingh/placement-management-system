import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeBranch, normalizeSkill } from '../../../shared/eligibility-normalization.mjs';
import { eligibility } from '../src/eligibility.js';
import { assignmentResults, assignmentStudentIds, interviewNotification, roundPayload, roundsForShortlistedApplications, sortInterviewRounds } from '../src/interview-rounds.js';

const equivalent = (normalizer, left, right) =>
  assert.equal(normalizer(left), normalizer(right), `${left} should equal ${right}`);

test('normalizes equivalent placement branch names', () => {
  equivalent(normalizeBranch, 'CSE', 'Computer Science');
  equivalent(normalizeBranch, 'CSE', 'Computer Science Engineering');
  equivalent(normalizeBranch, 'IT', 'Information Technology');
  equivalent(normalizeBranch, 'ECE', 'Electronics and Communication Engineering');
  equivalent(normalizeBranch, 'EEE', 'Electrical & Electronics Engineering');
  equivalent(normalizeBranch, 'ME', 'Mechanical');
  equivalent(normalizeBranch, 'CE', 'Civil Engineering');
  equivalent(normalizeBranch, 'AI', 'Artificial Intelligence');
  equivalent(normalizeBranch, 'AIML', 'Artificial Intelligence and Machine Learning');
  equivalent(normalizeBranch, 'DS', 'Data Science');
  equivalent(normalizeBranch, 'CSE-DS', 'Computer Science and Engineering - Data Science');
  equivalent(normalizeBranch, 'CSE-AIML', 'Computer Science Engineering - Artificial Intelligence and Machine Learning');
});

test('normalizes equivalent skill names without broad cloud aliases', () => {
  equivalent(normalizeSkill, 'JS', 'JavaScript');
  equivalent(normalizeSkill, 'CPP', 'C++');
  equivalent(normalizeSkill, 'DSA', 'Data Structures and Algorithms');
  equivalent(normalizeSkill, 'SQL', 'Structured Query Language');
  assert.notEqual(normalizeSkill('AWS'), normalizeSkill('Cloud Computing'));
});

test('eligibility accepts aliases and DSA represented as two student skills', () => {
  const result = eligibility(
    {
      branch: 'Computer Science', cgpa: 8,
      skills: ['C++', 'Java', 'Python', 'Data Structures', 'Algorithms', 'SQL', 'AWS']
    },
    {
      minimumCgpa: 7, allowedBranches: ['CSE', 'IT'],
      requiredSkills: ['CPP', 'Java', 'Python', 'DSA', 'Structured Query Language']
    }
  );
  assert.deepEqual(result, { eligible: true, reasons: [] });
});

test('eligibility does not treat AWS as Cloud Computing', () => {
  const result = eligibility(
    { branch: 'CSE', cgpa: 8, skills: ['AWS'] },
    { minimumCgpa: 7, allowedBranches: ['Computer Science'], requiredSkills: ['Cloud Computing'] }
  );
  assert.equal(result.eligible, false);
  assert.deepEqual(result.reasons, ['Missing required skills: Cloud Computing.']);
});

test('interview rounds use drive ids and are returned chronologically', () => {
  assert.deepEqual(roundPayload({ companyId: 'company-1', placementDriveId: 'drive-1', roundName: 'Coding' }), {
    company: 'company-1', placementDrive: 'drive-1', roundName: 'Coding'
  });
  const ordered = sortInterviewRounds([
    { _id: 'technical', date: '2027-10-12', time: '14:00' },
    { _id: 'coding', date: '2027-10-12', time: '12:20' },
    { _id: 'assessment', date: '2027-10-11', time: '10:00' }
  ]);
  assert.deepEqual(ordered.map(round => round._id), ['assessment', 'coding', 'technical']);
});

test('student interview flow only returns rounds for shortlisted application drive ids', () => {
  const rounds = roundsForShortlistedApplications(
    [
      { status: 'SHORTLISTED', placementDrive: 'microsoft-software-engineer' },
      { status: 'PENDING', placementDrive: 'other-microsoft-drive' }
    ],
    [
      { _id: 'coding', placementDrive: 'microsoft-software-engineer', date: '2027-10-12', time: '12:20' },
      { _id: 'unrelated', placementDrive: 'other-microsoft-drive', date: '2027-10-12', time: '10:00' }
    ]
  );
  assert.deepEqual(rounds.map(round => round._id), ['coding']);
});

test('interview assignments deduplicate students and notify with stored schedule data', () => {
  assert.deepEqual(assignmentStudentIds(['student-1', 'student-1', '', 'student-2']), ['student-1', 'student-2']);
  assert.deepEqual(assignmentResults(['student-1', 'student-2'], { 'student-1': 'PASSED', 'student-2': 'invalid' }), {
    'student-1': 'PASSED', 'student-2': 'PENDING'
  });
  const notification = interviewNotification(
    { roundName: 'Coding', date: '2027-10-12', time: '12:20', location: 'Seminar Hall A' },
    { jobTitle: 'Software Engineer' }, { name: 'Microsoft' }
  );
  assert.equal(notification.title, 'New Interview Scheduled');
  assert.match(notification.message, /Microsoft Coding/);
  assert.match(notification.message, /12:20/);
  assert.match(notification.message, /Seminar Hall A/);
});
