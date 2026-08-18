export function eligibility(student, drive) {
  const reasons = [];
  if ((student.cgpa || 0) < (drive.minCgpa || 0)) reasons.push(`CGPA must be at least ${drive.minCgpa}; yours is ${student.cgpa || 0}.`);
  if ((student.tenthPercentage || 0) < (drive.minTenth || 0)) reasons.push(`10th percentage must be at least ${drive.minTenth}%.`);
  if ((student.twelfthPercentage || 0) < (drive.minTwelfth || 0)) reasons.push(`12th percentage must be at least ${drive.minTwelfth}%.`);
  if (drive.eligibleBranches?.length && !drive.eligibleBranches.includes(student.branch)) reasons.push(`${student.branch || 'Your branch'} is not an eligible branch.`);
  if (drive.eligibleYears?.length && !drive.eligibleYears.includes(student.graduationYear)) reasons.push(`${student.graduationYear || 'Your graduation year'} is not eligible.`);
  const skills = (student.skills || []).map(x => x.toLowerCase()); const missing = (drive.requiredSkills || []).filter(x => !skills.includes(x.toLowerCase()));
  if (missing.length) reasons.push(`Missing required skills: ${missing.join(', ')}.`);
  return { eligible: !reasons.length, reasons };
}
