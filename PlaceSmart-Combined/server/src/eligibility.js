import { hasRequiredSkill, normalizeBranch } from '../../../shared/eligibility-normalization.mjs';

export function eligibility(student, drive) {
  const reasons = [];
  if ((student.cgpa || 0) < (drive.minimumCgpa || 0))
    reasons.push(`CGPA must be at least ${drive.minimumCgpa}; yours is ${student.cgpa || 0}.`);
  const studentBranch = normalizeBranch(student.branch);
  const isBranchEligible = (drive.allowedBranches ?? []).some(
    branch => normalizeBranch(branch) === studentBranch
  );
  if (drive.allowedBranches?.length && !isBranchEligible)
    reasons.push(`${student.branch || 'Your branch'} is not an eligible branch.`);
  if (drive.requiredSkills?.length) {
    const missing = drive.requiredSkills.filter(skill => !hasRequiredSkill(student.skills, skill));
    if (missing.length) reasons.push(`Missing required skills: ${missing.join(', ')}.`);
  }
  return { eligible: !reasons.length, reasons };
}
