import React, { useEffect, useState } from 'react';
import { api } from '../../api.js';
import { Loading, PageHeader, Table, Badge, Actions, Modal, Form, Detail } from './shared.jsx';

export default function Companies() {
  const [items, setItems] = useState();
  const [modal, setModal] = useState();
  const load = () => api('/admin/companies').then(setItems).catch(() => {});
  useEffect(() => { load(); }, []);

  const fields = [
    { key: 'name', label: 'Company Name', required: true },
    { key: 'industry', label: 'Industry' },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'location', label: 'Location' },
    { key: 'website', label: 'Website' },
    { key: 'recruiterName', label: 'Recruiter Name' },
    { key: 'recruiterEmail', label: 'Recruiter Email' },
    { key: 'recruiterPhone', label: 'Recruiter Phone' },
    { key: 'status', label: 'Status', type: 'select', options: ['ACTIVE', 'INACTIVE'] }
  ];

  const save = async x => {
    await api('/admin/companies' + (modal?.x ? '/' + modal.x._id : ''), {
      method: modal?.x ? 'PUT' : 'POST', body: JSON.stringify(x)
    });
    setModal(null); load();
  };

  const del = async x => {
    if (confirm(`Delete ${x.name}?`)) { await api('/admin/companies/' + x._id, { method: 'DELETE' }); load(); }
  };

  return (
    <>
      <PageHeader
        eyebrow="COMPANY MANAGEMENT" title="Companies"
        copy="Manage companies participating in campus placements."
        action={<button id="add-company-btn" onClick={() => setModal({})}>+ Add Company</button>}
      />
      {!items ? <Loading /> : (
        <Table heads={['Company','Industry','Location','Recruiter','Recruiter Email','Active Drives','Status','Actions']}>
          {items.map(x => (
            <tr key={x._id}>
              <td><b>{x.name}</b></td><td>{x.industry}</td><td>{x.location}</td>
              <td>{x.recruiterName}</td><td>{x.recruiterEmail}</td>
              <td>{x.activeDrives}</td>
              <td><Badge text={x.status} /></td>
              <td><Actions view={() => setModal({ x, view: true })} edit={() => setModal({ x })} del={() => del(x)} /></td>
            </tr>
          ))}
        </Table>
      )}
      {modal && (
        <Modal title={modal.view ? 'Company details' : modal.x ? 'Edit company' : 'Create company'} onClose={() => setModal(null)}>
          {modal.view ? <Detail x={modal.x} /> : <Form fields={fields} value={modal.x} onClose={() => setModal(null)} onSave={save} />}
        </Modal>
      )}
    </>
  );
}
