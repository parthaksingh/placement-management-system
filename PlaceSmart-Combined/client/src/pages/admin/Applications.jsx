import React, { useEffect, useState } from 'react';
import { api } from '../../api.js';
import { Loading, PageHeader, Table, Badge, fmtDate } from './shared.jsx';

const STATUSES = ['APPLIED', 'PENDING', 'UNDER REVIEW', 'SHORTLISTED', 'NOT SHORTLISTED', 'REJECTED', 'SELECTED'];

export default function Applications() {
  const [items, setItems] = useState();
  const [search, setSearch] = useState('');

  const load = () => api('/admin/applications?search=' + encodeURIComponent(search)).then(setItems).catch(() => {});
  useEffect(() => { load(); }, [search]);

  const change = async (x, status) => {
    await api('/admin/applications/' + x._id + '/status', { method: 'PUT', body: JSON.stringify({ status }) });
    load();
  };

  return (
    <>
      <PageHeader eyebrow="APPLICATION MANAGEMENT" title="Applications" copy="Review and manage student placement applications." />
      <div className="toolbar">
        <input id="app-search" placeholder="Search student…" value={search} onChange={e => setSearch(e.target.value)} />
        <span>Filter by student name. Status changes auto-notify the student.</span>
      </div>
      {!items ? <Loading /> : (
        <Table heads={['Student','Company','Job Title','Applied','Current Stage','Status','Actions']}>
          {items.map(x => (
            <tr key={x._id}>
              <td><b>{x.student?.name}</b></td>
              <td>{x.company?.name}</td>
              <td>{x.placementDrive?.jobTitle}</td>
              <td>{fmtDate(x.createdAt)}</td>
              <td>{x.currentStage}</td>
              <td><Badge text={x.status} /></td>
              <td>
                <span className="actions">
                  {x.status !== 'SHORTLISTED' && <button onClick={() => change(x, 'SHORTLISTED')}>Shortlist</button>}
                  {x.status !== 'REJECTED' && <button className="danger" onClick={() => change(x, 'REJECTED')}>Reject</button>}
                  <select className="status-select" value={x.status} onChange={e => change(x, e.target.value)} aria-label={`Update ${x.student?.name}'s status`}>
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </span>
              </td>
            </tr>
          ))}
        </Table>
      )}
      <p className="hint">Every status change is persisted and automatically creates a notification for the affected student.</p>
    </>
  );
}
