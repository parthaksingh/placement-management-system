import React, { useEffect, useState } from 'react';
import { api } from '../../api.js';
import { Loading, PageHeader, Table, Badge, fmtDate } from './shared.jsx';

const STATUSES = ['PENDING', 'UNDER REVIEW', 'SHORTLISTED', 'REJECTED', 'SELECTED'];

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
        <Table heads={['Student','Company','Job Title','Applied','Current Stage','Status','Update Status']}>
          {items.map(x => (
            <tr key={x._id}>
              <td><b>{x.student?.name}</b></td>
              <td>{x.company?.name}</td>
              <td>{x.placementDrive?.jobTitle}</td>
              <td>{fmtDate(x.createdAt)}</td>
              <td>{x.currentStage}</td>
              <td><Badge text={x.status} /></td>
              <td>
                <select
                  className="status-select"
                  value={x.status}
                  onChange={e => change(x, e.target.value)}
                >
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </Table>
      )}
      <p className="hint">Every status change is persisted and automatically creates a notification for the affected student.</p>
    </>
  );
}
