import { hasRequiredSkill, normalizeBranch } from '../../../shared/eligibility-normalization.mjs';

export function eligibility(student, drive) {
  const reasons = [];
  if ((student.cgpa || 0) < (drive.minCgpa || 0)) reasons.push(`CGPA must be at least ${drive.minCgpa}; yours is ${student.cgpa || 0}.`);
  if ((student.tenthPercentage || 0) < (drive.minTenth || 0)) reasons.push(`10th percentage must be at least ${drive.minTenth}%.`);
  if ((student.twelfthPercentage || 0) < (drive.minTwelfth || 0)) reasons.push(`12th percentage must be at least ${drive.minTwelfth}%.`);
  const studentBranch = normalizeBranch(student.branch);
  const isBranchEligible = (drive.eligibleBranches ?? []).some(
    branch => normalizeBranch(branch) === studentBranch
  );
  if (drive.eligibleBranches?.length && !isBranchEligible) reasons.push(`${student.branch || 'Your branch'} is not an eligible branch.`);
  if (drive.eligibleYears?.length && !drive.eligibleYears.includes(student.graduationYear)) reasons.push(`${student.graduationYear || 'Your graduation year'} is not eligible.`);
  const missing = (drive.requiredSkills || []).filter(skill => !hasRequiredSkill(student.skills, skill));
  if (missing.length) reasons.push(`Missing required skills: ${missing.join(', ')}.`);
  return { eligible: !reasons.length, reasons };
}
