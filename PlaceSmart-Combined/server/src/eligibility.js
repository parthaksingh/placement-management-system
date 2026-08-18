export function eligibility(student, drive) {
  const reasons = [];
  if ((student.cgpa || 0) < (drive.minimumCgpa || 0))
    reasons.push(`CGPA must be at least ${drive.minimumCgpa}; yours is ${student.cgpa || 0}.`);
  if (drive.allowedBranches?.length && !drive.allowedBranches.includes(student.branch))
    reasons.push(`${student.branch || 'Your branch'} is not an eligible branch.`);
  if (drive.requiredSkills?.length) {
    const studentSkills = (student.skills || []).map(x => x.toLowerCase());
    const missing = drive.requiredSkills.filter(x => !studentSkills.includes(x.toLowerCase()));
    if (missing.length) reasons.push(`Missing required skills: ${missing.join(', ')}.`);
  }
  return { eligible: !reasons.length, reasons };
}
