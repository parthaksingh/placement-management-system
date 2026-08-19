const timeInMinutes = time => {
  const match = String(time || '').trim().match(/^(\d{1,2}):(\d{2})(?:\s*([ap]m))?$/i);
  if (!match) return 0;

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3]?.toLowerCase();
  if (meridiem === 'pm' && hours !== 12) hours += 12;
  if (meridiem === 'am' && hours === 12) hours = 0;
  return hours * 60 + minutes;
};

export function sortInterviewRounds(rounds) {
  return [...rounds].sort((left, right) => {
    const dateDifference = new Date(left.date || 0) - new Date(right.date || 0);
    return dateDifference || timeInMinutes(left.time) - timeInMinutes(right.time);
  });
}

const idKey = value => String(value?._id ?? value);

export function roundsForShortlistedApplications(applications, rounds) {
  const shortlistedDriveIds = new Set(
    (applications ?? [])
      .filter(application => application.status === 'SHORTLISTED')
      .map(application => idKey(application.placementDrive))
  );
  return sortInterviewRounds(
    (rounds ?? []).filter(round => shortlistedDriveIds.has(idKey(round.placementDrive)))
  );
}

export function roundPayload(body) {
  const { companyId, placementDriveId, studentIds, ...rest } = body;
  return {
    ...rest,
    company: rest.company || companyId,
    placementDrive: rest.placementDrive || placementDriveId
  };
}

export function assignmentStudentIds(studentIds) {
  return [...new Set((studentIds ?? []).map(String).filter(Boolean))];
}

export function assignmentResults(studentIds, results = {}) {
  return Object.fromEntries(assignmentStudentIds(studentIds).map(studentId => [
    studentId,
    ['PENDING', 'PASSED', 'FAILED'].includes(results[studentId]) ? results[studentId] : 'PENDING'
  ]));
}

export function interviewNotification(round, drive, company, updated = false) {
  const date = round.date ? new Date(round.date).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  }) : 'the scheduled date';
  const place = round.location ? ` in ${round.location}` : '';
  return {
    title: updated ? 'Interview schedule updated' : 'New Interview Scheduled',
    message: `${updated ? 'Your interview schedule has been updated.' : 'You have been selected for'} ${company.name} ${round.roundName || 'interview'} for ${drive.jobTitle} on ${date} at ${round.time || 'the scheduled time'}${place}.`
  };
}
