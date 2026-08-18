import React, { useEffect, useState } from 'react';
import { api } from '../../api.js';
import { Loading, PageHeader, Table, Badge, Actions, Modal, Form, Detail, fmtDate } from './shared.jsx';

export default function Drives() {
  const [items, setItems] = useState();
  const [companies, setCompanies] = useState([]);
  const [modal, setModal] = useState();

  const load = () => api('/admin/placement-drives').then(setItems).catch(() => {});
  useEffect(() => {
    load();
    api('/admin/companies').then(setCompanies).catch(() => {});
  }, []);

  const fields = [
    { key: 'company', label: 'Company', type: 'select', options: companies, required: true },
    { key: 'jobTitle', label: 'Job Title', required: true },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'location', label: 'Location' },
    { key: 'workMode', label: 'Work Mode', type: 'select', options: ['On-site', 'Hybrid', 'Remote'] },
    { key: 'package', label: 'Package (e.g. ₹7.2 LPA)' },
    { key: 'applicationDeadline', label: 'Application Deadline', type: 'date' },
    { key: 'minimumCgpa', label: 'Minimum CGPA', type: 'number' },
    { key: 'allowedBranches', label: 'Allowed Branches (comma separated)' },
    { key: 'requiredSkills', label: 'Required Skills (comma separated)' },
    { key: 'status', label: 'Status', type: 'select', options: ['DRAFT', 'ACTIVE', 'CLOSED'] }
  ];

  const save = async x => {
    ['allowedBranches', 'requiredSkills'].forEach(k => {
      x[k] = typeof x[k] === 'string' ? x[k].split(',').map(s => s.trim()).filter(Boolean) : x[k];
    });
    await api('/admin/placement-drives' + (modal?.x ? '/' + modal.x._id : ''), {
      method: modal?.x ? 'PUT' : 'POST', body: JSON.stringify(x)
    });
    setModal(null); load();
  };

  const del = async x => {
    if (confirm(`Delete ${x.jobTitle}?`)) { await api('/admin/placement-drives/' + x._id, { method: 'DELETE' }); load(); }
  };

  return (
    <>
      <PageHeader
        eyebrow="PLACEMENT DRIVE MANAGEMENT" title="Placement Drives"
        copy="Create and manage company placement opportunities."
        action={<button id="create-drive-btn" onClick={() => setModal({})}>+ Create Drive</button>}
      />
      {!items ? <Loading /> : (
        <Table heads={['Company','Job Title','Location','Work Mode','Package','Deadline','Min CGPA','Status','Actions']}>
          {items.map(x => (
            <tr key={x._id}>
              <td>{x.company?.name}</td><td><b>{x.jobTitle}</b></td>
              <td>{x.location}</td><td>{x.workMode}</td><td>{x.package}</td>
              <td>{fmtDate(x.applicationDeadline)}</td><td>{x.minimumCgpa}</td>
              <td><Badge text={x.status} /></td>
              <td><Actions view={() => setModal({ x, view: true })} edit={() => setModal({ x })} del={() => del(x)} /></td>
            </tr>
          ))}
        </Table>
      )}
      {modal && (
        <Modal title={modal.view ? 'Drive details' : modal.x ? 'Edit drive' : 'Create drive'} onClose={() => setModal(null)}>
          {modal.view
            ? <><Detail x={modal.x} /><p><b>Allowed branches:</b> {modal.x.allowedBranches?.join(', ')}</p><p><b>Skills:</b> {modal.x.requiredSkills?.join(', ')}</p></>
            : <Form
                fields={fields}
                value={{
                  ...modal.x,
                  company: modal.x?.company?._id || modal.x?.company,
                  applicationDeadline: modal.x?.applicationDeadline?.slice(0, 10),
                  allowedBranches: modal.x?.allowedBranches?.join(', '),
                  requiredSkills: modal.x?.requiredSkills?.join(', ')
                }}
                onClose={() => setModal(null)}
                onSave={save}
              />
          }
        </Modal>
      )}
    </>
  );
}
