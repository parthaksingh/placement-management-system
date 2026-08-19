/**
 * Canonical values used only while evaluating placement eligibility.  The
 * original branch and skill strings remain untouched in MongoDB and the UI.
 */
function comparableValue(value) {
  return String(value ?? '')
    .normalize('NFKD')
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/\+/g, ' plus ')
    .replace(/[\/_-]+/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function aliases(entries) {
  return new Map(entries.flatMap(([canonical, values]) =>
    values.map(value => [comparableValue(value), canonical])
  ));
}

const branchAliases = aliases([
  ['computer science', ['cs', 'cse', 'computer science', 'computer science engineering', 'computer science and engineering']],
  ['information technology', ['it', 'information technology', 'information technology engineering']],
  ['electronics and communication engineering', ['ece', 'electronics and communication engineering', 'electronics communication engineering']],
  ['electrical and electronics engineering', ['eee', 'electrical and electronics engineering']],
  ['mechanical engineering', ['me', 'mechanical', 'mechanical engineering']],
  ['civil engineering', ['ce', 'civil', 'civil engineering']],
  ['artificial intelligence', ['ai', 'artificial intelligence']],
  ['artificial intelligence and machine learning', ['aiml', 'ai ml', 'ai and ml', 'artificial intelligence and machine learning']],
  ['data science', ['ds', 'data science']],
  ['computer science engineering data science', ['cse ds', 'computer science engineering data science', 'computer science and engineering data science']],
  ['computer science engineering artificial intelligence and machine learning', [
    'cse aiml',
    'computer science engineering artificial intelligence and machine learning',
    'computer science and engineering artificial intelligence and machine learning'
  ]]
]);

const skillAliases = aliases([
  ['javascript', ['javascript', 'js']],
  ['typescript', ['typescript', 'ts']],
  ['c++', ['c++', 'cpp', 'c plus plus']],
  ['c', ['c', 'c language']],
  ['python', ['python', 'python programming']],
  ['sql', ['sql', 'structured query language']],
  ['database management system', ['dbms', 'database management system', 'database systems']],
  ['data structures and algorithms', ['dsa', 'data structures and algorithms']],
  ['data structures', ['data structures']],
  ['algorithm', ['algorithm', 'algorithms']],
  ['object oriented programming', ['oop', 'object oriented programming']],
  ['node.js', ['node.js', 'nodejs', 'node']],
  ['react', ['react', 'react.js', 'reactjs']],
  ['express', ['express', 'express.js', 'expressjs']],
  ['mongodb', ['mongodb', 'mongo db']],
  ['postgresql', ['postgresql', 'postgres']],
  ['amazon web services', ['aws', 'amazon web services']],
  ['microsoft azure', ['azure', 'microsoft azure']],
  ['google cloud platform', ['gcp', 'google cloud platform']],
  ['cloud computing', ['cloud computing', 'cloud']],
  ['machine learning', ['machine learning', 'ml']],
  ['artificial intelligence', ['artificial intelligence', 'ai']],
  ['deep learning', ['deep learning', 'dl']]
]);

export function normalizeBranch(branch) {
  const normalized = comparableValue(branch);
  return branchAliases.get(normalized) ?? normalized;
}

export function normalizeSkill(skill) {
  const normalized = comparableValue(skill);
  return skillAliases.get(normalized) ?? normalized;
}

/**
 * Tests a drive requirement against normalized student skills.  DSA is a
 * composite requirement, so separate "Data Structures" and "Algorithms"
 * entries satisfy it without making unrelated skills (such as AWS and Cloud)
 * interchangeable.
 */
export function hasRequiredSkill(studentSkills, requiredSkill) {
  const skills = new Set((studentSkills ?? []).map(normalizeSkill).filter(Boolean));
  const required = normalizeSkill(requiredSkill);

  if (skills.has(required)) return true;
  if (required === 'data structures and algorithms') {
    return skills.has('data structures') && skills.has('algorithm');
  }
  return false;
}
