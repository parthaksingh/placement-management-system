import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../../api.js';
import { Loading, PageHeader, Table, Badge, Actions, Modal, fmtDate } from './shared.jsx';

const types = ['Aptitude', 'Technical', 'Coding', 'HR', 'Final Interview'];
const statuses = ['SCHEDULED', 'COMPLETED', 'CANCELLED'];

function InterviewRoundForm({ value = {}, companies, drives, onClose, onSave }) {
  const [data, setData] = useState({
    status: 'SCHEDULED',
    studentIds: [],
    studentResults: {},
    ...value,
    company: value.company?._id || value.company || '',
    placementDrive: value.placementDrive?._id || value.placementDrive || ''
  });
  const [candidates, setCandidates] = useState([]);
  const [search, setSearch] = useState('');
  const set = (key, next) => setData(current => ({ ...current, [key]: next }));
  const availableDrives = useMemo(() => drives.filter(d => !data.company || String(d.company?._id || d.company) === String(data.company)), [drives, data.company]);

  useEffect(() => {
    if (!data.placementDrive) { setCandidates([]); return; }
    const query = new URLSearchParams({ ...(value._id ? { roundId: value._id } : {}), roundType: data.roundType || '' });
    const suffix = `?${query}`;
    api(`/admin/placement-drives/${data.placementDrive}/interview-candidates${suffix}`)
      .then(setCandidates)
      .catch(() => setCandidates([]));
  }, [data.placementDrive, data.roundType, value._id]);

  const filteredCandidates = candidates.filter(({ student }) => {
    const text = `${student.name} ${student.email} ${student.registrationNumber || ''} ${student.branch || ''}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });
  const toggleStudent = id => setData(current => ({
    ...current,
    studentIds: current.studentIds.includes(id)
      ? current.studentIds.filter(studentId => studentId !== id)
      : [...current.studentIds, id],
    studentResults: current.studentIds.includes(id)
      ? Object.fromEntries(Object.entries(current.studentResults).filter(([studentId]) => studentId !== id))
      : { ...current.studentResults, [id]: 'PENDING' }
  }));

  return (
    <form className="form" onSubmit={event => { event.preventDefault(); onSave(data); }}>
      <label>Company
        <select value={data.company || ''} onChange={event => setData(current => ({ ...current, company: event.target.value, placementDrive: '' }))} required>
          <option value="">Select</option>
          {companies.map(company => <option key={company._id} value={company._id}>{company.name}</option>)}
        </select>
      </label>
      <label>Placement Drive
        <select value={data.placementDrive || ''} onChange={event => {
          const drive = drives.find(item => String(item._id) === event.target.value);
          setData(current => ({ ...current, placementDrive: event.target.value, company: drive?.company?._id || drive?.company || current.company }));
        }} required>
          <option value="">Select</option>
          {availableDrives.map(drive => <option key={drive._id} value={drive._id}>{drive.jobTitle}</option>)}
        </select>
      </label>
      <label>Round Name<input value={data.roundName || ''} onChange={event => set('roundName', event.target.value)} required /></label>
      <label>Round Type
        <select value={data.roundType || ''} onChange={event => set('roundType', event.target.value)} required>
          <option value="">Select</option>{types.map(type => <option key={type}>{type}</option>)}
        </select>
      </label>
      <label>Date<input type="date" value={data.date?.slice?.(0, 10) || data.date || ''} onChange={event => set('date', event.target.value)} required /></label>
      <label>Time<input type="time" value={data.time || ''} onChange={event => set('time', event.target.value)} required /></label>
      <label>Location<input value={data.location || ''} onChange={event => set('location', event.target.value)} /></label>
      <label>Meeting Link<input type="url" value={data.meetingLink || ''} onChange={event => set('meetingLink', event.target.value)} /></label>
      <label>Description<textarea value={data.description || ''} onChange={event => set('description', event.target.value)} /></label>
      <label>Status
        <select value={data.status || 'SCHEDULED'} onChange={event => set('status', event.target.value)} required>
          {statuses.map(status => <option key={status}>{status}</option>)}
        </select>
      </label>
      <label>Result / Notes<input value={data.result || ''} onChange={event => set('result', event.target.value)} /></label>
      <div className="candidate-select">
        <b>Students / Candidates</b>
        <small>Only shortlisted candidates who passed the previous completed round can be assigned.</small>
        <input aria-label="Search candidates" placeholder="Search by name, email, ID, or branch" value={search} onChange={event => setSearch(event.target.value)} disabled={!data.placementDrive} />
        {!data.placementDrive ? <p className="muted">Select a placement drive to choose candidates.</p>
          : <div className="candidate-list">
            {filteredCandidates.length ? filteredCandidates.map(({ student, applicationStatus, eligibleForRound }) => <label className="candidate" key={student._id}>
              <input type="checkbox" checked={data.studentIds.includes(String(student._id))} onChange={() => toggleStudent(String(student._id))} />
              <span><b>{student.name}</b><small>{student.registrationNumber || student.email}{student.branch ? ` · ${student.branch}` : ''} · {applicationStatus} · {eligibleForRound ? 'Eligible' : 'Previously assigned'}</small></span>
              {data.studentIds.includes(String(student._id)) && <select aria-label={`Result for ${student.name}`} value={data.studentResults[String(student._id)] || 'PENDING'} onChange={event => set('studentResults', { ...data.studentResults, [String(student._id)]: event.target.value })}>
                <option>PENDING</option><option>PASSED</option><option>FAILED</option>
              </select>}
            </label>) : <p className="muted">No shortlisted candidates found for this drive.</p>}
          </div>}
        <small>{data.studentIds.length} student{data.studentIds.length === 1 ? '' : 's'} assigned</small>
      </div>
      <div className="form-actions"><button type="button" className="ghost" onClick={onClose}>Cancel</button><button type="submit">Save</button></div>
    </form>
  );
}

export default function Interviews() {
  const [items, setItems] = useState();
  const [companies, setCompanies] = useState([]);
  const [drives, setDrives] = useState([]);
  const [modal, setModal] = useState();
  const load = () => api('/admin/interview-rounds').then(setItems).catch(() => {});
  useEffect(() => {
    load();
    api('/admin/companies').then(setCompanies).catch(() => {});
    api('/admin/placement-drives').then(setDrives).catch(() => {});
  }, []);
  const save = async data => {
    await api('/admin/interview-rounds' + (modal?.x ? '/' + modal.x._id : ''), {
      method: modal?.x ? 'PUT' : 'POST', body: JSON.stringify(data)
    });
    setModal(null); load();
  };
  const edit = async item => setModal({ x: await api('/admin/interview-rounds/' + item._id) });
  const del = async item => {
    if (confirm(`Cancel and delete ${item.roundName}?`)) {
      await api('/admin/interview-rounds/' + item._id, { method: 'DELETE' }); load();
    }
  };
  return <>
    <PageHeader eyebrow="ROUND MANAGEMENT" title="Rounds" copy="Schedule aptitude, coding, technical, and HR rounds. Select candidates one by one; students who pass a completed round become eligible for the next round."
      action={<button id="create-interview-btn" onClick={() => setModal({})}>+ Schedule Round</button>} />
    {!items ? <Loading /> : <Table heads={['Company', 'Drive', 'Round', 'Date', 'Time', 'Location', 'Students', 'Status', 'Actions']}>
      {items.map(item => <tr key={item._id}>
        <td>{item.company?.name}</td><td>{item.placementDrive?.jobTitle}</td>
        <td>{item.roundName}<small className="sub">{item.roundType}</small></td>
        <td>{fmtDate(item.date)}</td><td>{item.time}</td><td>{item.location || '—'}</td>
        <td>{item.assignedStudentCount} Student{item.assignedStudentCount === 1 ? '' : 's'}</td>
        <td><Badge text={item.status} /></td><td><Actions edit={() => edit(item)} del={() => del(item)} /></td>
      </tr>)}
    </Table>}
    {modal && <Modal title={modal.x ? 'Edit round and candidates' : 'Schedule round'} onClose={() => setModal(null)}>
      <InterviewRoundForm key={modal.x?._id || 'new'} value={modal.x} companies={companies} drives={drives} onClose={() => setModal(null)} onSave={save} />
    </Modal>}
  </>;
}
