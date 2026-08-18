import React, { useEffect, useState } from 'react';
import { api } from '../../api.js';
import { Loading, PageHeader, Table, Badge, Actions, Modal, Form, fmtDate } from './shared.jsx';

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

  const fields = [
    { key: 'company', label: 'Company', type: 'select', options: companies, required: true },
    { key: 'placementDrive', label: 'Placement Drive', type: 'select', options: drives, required: true },
    { key: 'roundName', label: 'Round Name' },
    { key: 'roundType', label: 'Round Type', type: 'select', options: ['Aptitude', 'Technical', 'Coding', 'HR', 'Final Interview'] },
    { key: 'date', label: 'Date', type: 'date' },
    { key: 'time', label: 'Time' },
    { key: 'location', label: 'Location' },
    { key: 'meetingLink', label: 'Meeting Link' },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'status', label: 'Status', type: 'select', options: ['SCHEDULED', 'COMPLETED', 'CANCELLED'] },
    { key: 'result', label: 'Result / Notes' }
  ];

  const save = async x => {
    await api('/admin/interview-rounds' + (modal?.x ? '/' + modal.x._id : ''), {
      method: modal?.x ? 'PUT' : 'POST', body: JSON.stringify(x)
    });
    setModal(null); load();
  };

  const del = async x => {
    if (confirm(`Cancel and delete ${x.roundName}?`)) {
      await api('/admin/interview-rounds/' + x._id, { method: 'DELETE' }); load();
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="INTERVIEW MANAGEMENT" title="Interview Rounds"
        copy="Schedule and manage placement interview rounds."
        action={<button id="create-interview-btn" onClick={() => setModal({})}>+ Create Interview Round</button>}
      />
      {!items ? <Loading /> : (
        <Table heads={['Company','Drive','Round','Date','Time','Location','Status','Actions']}>
          {items.map(x => (
            <tr key={x._id}>
              <td>{x.company?.name}</td>
              <td>{x.placementDrive?.jobTitle}</td>
              <td>{x.roundName}<small className="sub">{x.roundType}</small></td>
              <td>{fmtDate(x.date)}</td><td>{x.time}</td><td>{x.location}</td>
              <td><Badge text={x.status} /></td>
              <td><Actions edit={() => setModal({ x })} del={() => del(x)} /></td>
            </tr>
          ))}
        </Table>
      )}
      {modal && (
        <Modal title={modal.x ? 'Edit interview round' : 'Create interview round'} onClose={() => setModal(null)}>
          <Form
            fields={fields}
            value={{
              ...modal.x,
              company: modal.x?.company?._id || modal.x?.company,
              placementDrive: modal.x?.placementDrive?._id || modal.x?.placementDrive,
              date: modal.x?.date?.slice(0, 10)
            }}
            onClose={() => setModal(null)}
            onSave={save}
          />
        </Modal>
      )}
    </>
  );
}
