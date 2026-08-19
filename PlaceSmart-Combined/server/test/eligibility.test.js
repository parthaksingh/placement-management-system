import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeBranch, normalizeSkill } from '../../../shared/eligibility-normalization.mjs';
import { eligibility } from '../src/eligibility.js';

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
