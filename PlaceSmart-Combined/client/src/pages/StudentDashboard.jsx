import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

const Icon = ({ children }) => <span className="icon">{children}</span>;

function Stat({ label, value, sub, tone }) {
  return (
    <article className={`stat ${tone || ''}`}>
      <p>{label}</p>
      <h2>{value}</h2>
      <small>{sub}</small>
    </article>
  );
}

const navItems = ['Overview', 'Placement drives', 'My applications', 'Rounds', 'Notifications', 'My profile'];
const navIcons = ['⌂', '▦', '◫', '◷', '♧', '◎'];

function Sidebar({ tab, setTab, logout }) {
  return (
    <aside>
      <div className="brand"><b>place</b><i>smart</i></div>
      <p className="side-label">WORKSPACE</p>
      {navItems.map((n, i) => (
        <button key={n} className={`nav ${tab === n ? 'active' : ''}`} onClick={() => setTab(n)}>
          <Icon>{navIcons[i]}</Icon>{n}
        </button>
      ))}
      <div className="side-bottom">
        <button className="nav" onClick={logout}><Icon>↪</Icon>Sign out</button>
      </div>
    </aside>
  );
}

const POPULAR_SKILLS = [
  'React', 'Node.js', 'Python', 'Java', 'C++', 'JavaScript', 'TypeScript',
  'SQL', 'MongoDB', 'PostgreSQL', 'Docker', 'AWS', 'Spring Boot', 'Machine Learning', 'Data Structures', 'Git'
];

export default function StudentDashboard({ user, tab, setTab, logout }) {
  const [drives, setDrives] = useState([]);
  const [apps, setApps] = useState([]);
  const [interviewRounds, setInterviewRounds] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [notice, setNotice] = useState('');

  // Student profile state
  const [profileData, setProfileData] = useState({
    name: user.name || '',
    email: user.email || '',
    registrationNumber: '',
    branch: 'Computer Science',
    cgpa: 8.5,
    graduationYear: 2026,
    phone: '',
    skills: ['React', 'Node.js', 'MongoDB'],
    resume: ''
  });
  const [skillInput, setSkillInput] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const loadData = () => {
    Promise.all([
      api('/student/placement-drives'),
      api('/student/applications'),
      api('/student/interview-rounds'),
      api('/student/notifications'),
      api('/student/profile')
    ]).then(([d, a, rounds, n, p]) => {
      setDrives(d || []);
      setApps(a || []);
      setInterviewRounds(rounds || []);
      setNotifications(n || []);
      if (p) {
        setProfileData({
          name: p.name || user.name || '',
          email: p.email || user.email || '',
          registrationNumber: p.registrationNumber || '',
          branch: p.branch || 'Computer Science',
          cgpa: p.cgpa !== undefined ? p.cgpa : 8.5,
          graduationYear: p.graduationYear || 2026,
          phone: p.phone || '',
          skills: Array.isArray(p.skills) ? p.skills : [],
          resume: p.resume || ''
        });
      }
    }).catch(() => {});
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (tab === 'Rounds') {
      api('/student/interview-rounds').then(rounds => setInterviewRounds(rounds || [])).catch(() => {});
    }
  }, [tab]);

  const apply = async id => {
    try {
      const check = await api(`/student/placement-drives/${id}/eligibility`);
      if (!check.eligible) return setNotice(check.reasons.join(' '));
      const result = await api('/student/applications', { method: 'POST', body: JSON.stringify({ driveId: id }) });
      setNotice('Application submitted — it is now awaiting review.');
      setApps(prev => [...prev, result]);
    } catch (err) {
      setNotice(err.message);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setNotice('');
    const cleanPhone = (profileData.phone || '').trim().replace(/\D/g, '');
    if (cleanPhone.length > 0 && cleanPhone.length !== 10) {
      setNotice('⚠️ Contact phone number must be exactly 10 digits (e.g. 9876543210).');
      return;
    }
    setSavingProfile(true);
    try {
      await api('/student/profile', {
        method: 'PUT',
        body: JSON.stringify({
          name: profileData.name,
          graduationYear: Number(profileData.graduationYear),
          phone: cleanPhone,
          skills: profileData.skills,
          resume: profileData.resume
        })
      });
      setNotice('Profile updated successfully!');
      loadData();
    } catch (err) {
      setNotice('Failed to update profile: ' + err.message);
    }
    setSavingProfile(false);
  };

  const addSkill = (skillToAdd) => {
    const s = (skillToAdd || skillInput).trim();
    if (s && !profileData.skills.some(x => x.toLowerCase() === s.toLowerCase())) {
      setProfileData(prev => ({ ...prev, skills: [...prev.skills, s] }));
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillToRemove)
    }));
  };

  const selected = apps.filter(a => a.status === 'SELECTED').length;
  const shortlisted = apps.filter(a => a.status === 'SHORTLISTED').length;

  const pageHeader = (eyebrow, title, description) => (
    <header>
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="muted">{description}</p>
      </div>
      <button className="bell" aria-label="Notifications">
        ♧<em>{notifications.filter(n => !n.read).length}</em>
      </button>
    </header>
  );

  const driveList = (
    <section className="panel drives">
      <div className="panel-title">
        <div><h2>Available placement drives</h2><p>Explore companies visiting your campus.</p></div>
      </div>
      {drives.length ? drives.map(d => (
        <article className="drive" key={d._id}>
          <div className="logo">{d.company?.name?.slice(0, 1)}</div>
          <div className="drive-info">
            <h3>{d.company?.name}</h3>
            <p>{d.jobTitle} <b>·</b> {d.location} <b>·</b> {d.workMode}</p>
            <div>
              <span className="chip blue">{d.package}</span>
              {d.applicationDeadline && <span className="chip">Deadline {new Date(d.applicationDeadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>}
              {d.minimumCgpa && <span className="chip">Min CGPA {d.minimumCgpa}</span>}
              {d.allowedBranches?.length ? <span className="chip">{d.allowedBranches.join(', ')}</span> : null}
            </div>
          </div>
          <button onClick={() => apply(d._id)}>Apply now</button>
        </article>
      )) : <div className="empty">There are no placement drives available right now.</div>}
    </section>
  );

  const applicationsList = (
    <section className="panel drives">
      <div className="panel-title">
        <div><h2>My applications</h2><p>Every company you have applied to and its latest status.</p></div>
      </div>
      {apps.length ? apps.map(a => (
        <article className="drive" key={a._id}>
          <div className="logo">{a.company?.name?.slice(0, 1) || 'P'}</div>
          <div className="drive-info">
            <h3>{a.company?.name || 'Company'}</h3>
            <p>{a.placementDrive?.jobTitle || 'Placement drive'} <b>·</b> {a.currentStage || 'Application'}</p>
            <div>
              <span className={`chip ${a.status === 'SELECTED' ? 'blue' : ''}`}>{a.status}</span>
            </div>
          </div>
        </article>
      )) : <div className="empty">You have not applied to any placement drives yet.</div>}
    </section>
  );

  const interviewApps = apps.filter(a => a.status === 'SHORTLISTED');
  const placementProgress = apps.filter(application =>
    application.status === 'SHORTLISTED' || interviewRounds.some(round => String(round.placementDrive?._id) === String(application.placementDrive?._id))
  ).map(application => {
    const rounds = interviewRounds.filter(round => String(round.placementDrive?._id) === String(application.placementDrive?._id));
    const nextRound = rounds.find(round => round.assignmentResult === 'PENDING' && round.status === 'SCHEDULED');
    return <article className="progress-card" key={application._id}>
      <h3>{application.company?.name || 'Company'} <span>·</span> {application.placementDrive?.jobTitle || 'Placement drive'}</h3>
      <div className="progress-steps">
        <span className="done">✓ Applied</span>
        <span className={application.status === 'SHORTLISTED' || rounds.length ? 'done' : ''}>{application.status === 'SHORTLISTED' || rounds.length ? '✓' : '○'} Shortlisted</span>
        {rounds.map(round => <span key={round._id} className={round.assignmentResult === 'PASSED' ? 'done' : round.assignmentResult === 'FAILED' ? 'failed' : 'current'}>
          {round.assignmentResult === 'PASSED' ? '✓' : round.assignmentResult === 'FAILED' ? '×' : '●'} {round.roundName}
        </span>)}
        <span className={application.status === 'SELECTED' ? 'done' : ''}>{application.status === 'SELECTED' ? '✓' : '○'} Final Result</span>
      </div>
      {nextRound && <div className="next-round">
        <b>NEXT ROUND</b><strong>{nextRound.roundName}</strong>
        <span>📅 {nextRound.date ? new Date(nextRound.date).toLocaleDateString('en-IN') : 'Date to be announced'} · 🕐 {nextRound.time || 'Time to be announced'}</span>
        {nextRound.location && <span>📍 {nextRound.location}</span>}
        <span className="chip blue">{nextRound.status}</span>
      </div>}
    </article>;
  });
  const interviews = (
    <section className="panel drives">
      <div className="panel-title">
        <div><h2>Upcoming interviews</h2><p>Your scheduled technical rounds and interviews.</p></div>
      </div>
      {placementProgress.length > 0 && <section className="placement-progress"><h3>Placement progress</h3>{placementProgress}</section>}
      {interviewRounds.length ? interviewRounds.map(round => (
        <article className="drive" key={round._id}>
          <div className="logo">{round.company?.name?.slice(0, 1) || 'I'}</div>
          <div className="drive-info">
            <h3>{round.company?.name || 'Company'}</h3>
            <p>{round.placementDrive?.jobTitle || 'Placement drive'} <b>·</b> {round.applicationStatus}</p>
            <h4 style={{ margin: '12px 0 4px' }}>{round.roundName || 'Interview round'}</h4>
            <p>{round.roundType || 'Interview'} <b>·</b> {round.date ? new Date(round.date).toLocaleDateString('en-IN') : 'Date to be announced'} <b>·</b> {round.time || 'Time to be announced'}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
              {round.location && <span className="chip">Location: {round.location}</span>}
              <span className="chip blue">{round.status}</span>
              {round.assignmentResult && <span className="chip">Result: {round.assignmentResult}</span>}
              {round.meetingLink && <a className="link" href={round.meetingLink} target="_blank" rel="noopener noreferrer">Join Interview</a>}
            </div>
            {round.description && <p style={{ marginTop: '10px' }}>{round.description}</p>}
          </div>
        </article>
      )) : interviewApps.length
        ? <div className="empty">You are shortlisted, but no interview has been scheduled yet.</div>
        : <div className="empty">No interviews are scheduled at the moment.</div>}
    </section>
  );

  const notificationList = (
    <section className="panel drives">
      <div className="panel-title">
        <div><h2>Notifications</h2><p>Placement updates, results, and deadlines.</p></div>
      </div>
      {notifications.length ? notifications.map(n => (
        <article className="drive" key={n._id}>
          <div className="logo">✦</div>
          <div className="drive-info">
            <h3>{n.title}</h3>
            <p>{n.message}</p>
            <div><span className="chip">{new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span></div>
          </div>
        </article>
      )) : <div className="empty">You have no notifications right now.</div>}
    </section>
  );

  const profileSection = (
    <div className="profile-container" style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '24px' }}>
      {/* Profile Overview Card */}
      <section className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="logo" style={{ width: '56px', height: '56px', fontSize: '24px' }}>
            {profileData.name ? profileData.name.slice(0, 1) : 'S'}
          </div>
          <div>
            <h2 style={{ fontSize: '18px', margin: 0 }}>{profileData.name || 'Student Name'}</h2>
            <p style={{ color: 'var(--muted)', fontSize: '13px', margin: '4px 0 0' }}>{profileData.email}</p>
            <span className="chip blue" style={{ marginTop: '6px', display: 'inline-block' }}>STUDENT ACCOUNT</span>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--line)', margin: '4px 0' }} />

        {/* Official Institution Records (Read-Only) */}
        <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid var(--line)', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.6px' }}>OFFICIAL ACADEMIC RECORD</span>
            <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600 }}>🔒 Admin Verified</span>
          </div>
          <div><b>Official CGPA:</b> <b style={{ color: 'var(--blue)', fontSize: '15px', marginLeft: '6px' }}>{profileData.cgpa} / 10.0</b></div>
          <div><b>Department / Branch:</b> <span style={{ color: '#334155', marginLeft: '6px' }}>{profileData.branch || 'Computer Science'}</span></div>
          <div><b>Registration Number:</b> <span style={{ color: '#334155', marginLeft: '6px' }}>{profileData.registrationNumber || 'PS2022001'}</span></div>
        </div>

        <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div><b>Graduation Year:</b> <span style={{ color: '#4b5563' }}>{profileData.graduationYear || '2026'}</span></div>
          <div><b>Contact Phone:</b> <span style={{ color: '#4b5563' }}>{profileData.phone || 'Not set'}</span></div>
          <div><b>Resume Link:</b> {profileData.resume ? <a href={profileData.resume} target="_blank" rel="noreferrer" style={{ color: 'var(--blue)' }}>View Resume ↗</a> : <span style={{ color: 'var(--muted)' }}>Not added</span>}</div>
        </div>

        <div style={{ marginTop: '8px' }}>
          <b>Active Technologies & Skills:</b>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
            {profileData.skills.length ? profileData.skills.map(s => (
              <span key={s} className="badge SELECTED" style={{ fontSize: '12px', padding: '4px 10px' }}>{s}</span>
            )) : <span style={{ color: 'var(--muted)', fontSize: '13px' }}>No skills added yet</span>}
          </div>
        </div>
      </section>

      {/* Profile Edit Form */}
      <section className="panel">
        <div className="panel-title">
          <div>
            <h2>Edit Candidate Profile</h2>
            <p>Customize your technical skills, technologies, and contact information.</p>
          </div>
        </div>

        <form className="form" onSubmit={handleProfileSave}>
          <label>
            Full Name
            <input
              type="text"
              value={profileData.name}
              onChange={e => setProfileData({ ...profileData, name: e.target.value })}
              required
            />
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <label>
              Graduation Year
              <input
                type="number"
                value={profileData.graduationYear}
                onChange={e => setProfileData({ ...profileData, graduationYear: e.target.value })}
                placeholder="e.g. 2026"
              />
            </label>

            <label>
              Contact Phone (10 digits)
              <input
                type="tel"
                maxLength={10}
                pattern="[0-9]{10}"
                value={profileData.phone}
                onChange={e => setProfileData({ ...profileData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                placeholder="e.g. 9876543210"
              />
            </label>
          </div>

          <label>
            Resume / Portfolio URL
            <input
              type="url"
              value={profileData.resume}
              onChange={e => setProfileData({ ...profileData, resume: e.target.value })}
              placeholder="https://drive.google.com/your-resume or https://github.com/profile"
            />
          </label>

          {/* Technologies & Skills Manager */}
          <div style={{ marginTop: '14px', marginBottom: '18px' }}>
            <label style={{ display: 'block', marginBottom: '6px' }}>Technologies & Skills</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                placeholder="Type a technology (e.g. React, Python, AWS, Docker) and press Enter"
                style={{ flex: 1 }}
              />
              <button
                type="button"
                onClick={() => addSkill()}
                style={{ background: '#3b4661', color: '#fff', padding: '0 16px', borderRadius: '7px', fontWeight: 600, fontSize: '13px' }}
              >
                + Add
              </button>
            </div>

            {/* Current skill tags with remove buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
              {profileData.skills.map(s => (
                <span
                  key={s}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#edf0ff',
                    color: '#4e62de',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '12px',
                    fontWeight: 600
                  }}
                >
                  {s}
                  <button
                    type="button"
                    onClick={() => removeSkill(s)}
                    style={{ background: 'transparent', color: '#8898ee', fontSize: '14px', padding: 0, lineHeight: 1 }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            {/* Quick add popular skills */}
            <div style={{ marginTop: '12px' }}>
              <small style={{ color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>Quick suggestions:</small>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {POPULAR_SKILLS.filter(s => !profileData.skills.includes(s)).slice(0, 8).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => addSkill(s)}
                    style={{ background: '#f0f2f7', color: '#555f77', border: 'none', borderRadius: '4px', padding: '3px 8px', fontSize: '11px', fontWeight: 500 }}
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: '#92400e', marginBottom: '16px' }}>
            ℹ️ <b>Academic Note:</b> Your CGPA ({profileData.cgpa}), Branch ({profileData.branch}), and Registration Number are officially managed by the Placement Cell Administrator and cannot be edited by students.
          </div>

          <div className="form-actions">
            <button
              type="submit"
              disabled={savingProfile}
              style={{ background: 'var(--blue)', color: '#fff', padding: '10px 24px', borderRadius: '7px', fontWeight: 700, fontSize: '13.5px' }}
            >
              {savingProfile ? 'Saving Changes…' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );

  const toastEl = notice && (
    <div className="toast">{notice}<button onClick={() => setNotice('')}>×</button></div>
  );

  return (
    <div className="shell">
      <Sidebar tab={tab} setTab={setTab} logout={logout} />
      <main className="workspace">
        {tab === 'Placement drives' && <>{pageHeader('PLACEMENT DRIVES', 'Find your next opportunity', 'Browse current companies and apply to roles that match your profile.')}{toastEl}{driveList}</>}
        {tab === 'My applications' && <>{pageHeader('MY APPLICATIONS', 'Your applications', 'Follow each application from submission through the final result.')}{toastEl}{applicationsList}</>}
        {tab === 'Rounds' && <>{pageHeader('ROUNDS', 'Round schedule', 'See only the aptitude, coding, technical, and HR rounds assigned to you.')}{toastEl}{interviews}</>}
        {tab === 'Notifications' && <>{pageHeader('NOTIFICATIONS', 'Your updates', 'The latest activity from the placement cell and companies.')}{toastEl}{notificationList}</>}
        {tab === 'My profile' && <>{pageHeader('MY PROFILE', 'Profile details', 'Manage your technologies, technical skills, contact info, and view verified academic records.')}{toastEl}{profileSection}</>}
        {tab === 'Overview' && (
          <>
            {pageHeader('STUDENT DASHBOARD', <>Welcome back, {profileData.name?.split(' ')[0] || user.name?.split(' ')[0]} <span>✦</span></>, `Here's a clear view of where you are in your placement journey.`)}
            {toastEl}
            <section className="stats">
              <Stat label="OPEN OPPORTUNITIES" value={drives.length} sub="Matching your profile" />
              <Stat label="MY APPLICATIONS" value={apps.length} sub="Across active drives" tone="violet" />
              <Stat label="SHORTLISTED" value={shortlisted} sub="Scheduled or upcoming" tone="gold" />
              <Stat label="SELECTED" value={selected} sub={selected ? 'Congratulations!' : 'Keep going — you\'re close'} tone="green" />
            </section>
            <div className="content-grid">
              {driveList}
              <section className="panel journey">
                <div className="panel-title">
                  <div><h2>Your journey</h2><p>Track progress across all applications.</p></div>
                </div>
                {apps.length ? (
                  <>
                    {['Applied', 'Admin review', 'Technical round', 'Final result'].map((x, i) => (
                      <div className={`step ${i < 2 ? 'done' : ''}`} key={x}>
                        <span>{i < 2 ? '✓' : i + 1}</span>
                        <div>
                          <b>{x}</b>
                          <small>{i === 0 ? 'Application submitted' : i === 1 ? 'Awaiting shortlist decision' : 'Pending'}</small>
                        </div>
                      </div>
                    ))}
                  </>
                ) : <div className="empty">Apply to an eligible drive to start your journey.</div>}
              </section>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
