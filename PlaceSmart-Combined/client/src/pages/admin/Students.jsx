import React, { useEffect, useState } from 'react';
import { api } from '../../api.js';
import { Loading, PageHeader, Table, Badge, Actions, Modal, Form, Detail } from './shared.jsx';

export default function Students() {
  const [items, setItems] = useState();
  const [query, setQuery] = useState('');
  const [modal, setModal] = useState();

  const load = () => api('/admin/students?search=' + encodeURIComponent(query)).then(setItems).catch(() => {});
  useEffect(() => { load(); }, [query]);

  const remove = async x => {
    if (confirm(`Delete ${x.name}? This also removes their applications.`)) {
      await api('/admin/students/' + x._id, { method: 'DELETE' });
      load();
    }
  };

  const fields = [
    ['name','Name','text',true],['email','Email','email',true],
    ['registrationNumber','Registration Number','text',true],['branch','Branch'],
    ['cgpa','CGPA','number'],['graduationYear','Graduation Year','number'],
    ['phone','Phone'],['skills','Skills (comma separated)'],
    ['resume','Resume URL'],
    ['status','Status','select',false,['ACTIVE','PLACED','INACTIVE']]
  ].map(([key, label, type, required, options]) => ({ key, label, type, required, options }));

  return (
    <>
      <PageHeader eyebrow="STUDENT MANAGEMENT" title="Students" copy="Manage all students registered for placement." />
      <div className="toolbar">
        <input id="student-search" placeholder="Search students…" value={query} onChange={e => setQuery(e.target.value)} />
        <span>Search by name, email, or registration number.</span>
      </div>
      {!items ? <Loading /> : (
        <Table heads={['Name','Email','Reg. No.','Branch','CGPA','Grad Year','Status','Actions']}>
          {items.map(x => (
            <tr key={x._id}>
              <td><b>{x.name}</b></td><td>{x.email}</td>
              <td>{x.registrationNumber}</td><td>{x.branch}</td>
              <td>{x.cgpa}</td><td>{x.graduationYear}</td>
              <td><Badge text={x.status} /></td>
              <td>
                <Actions
                  view={() => setModal({ type: 'view', x })}
                  edit={() => setModal({ type: 'edit', x })}
                  del={() => remove(x)}
                />
              </td>
            </tr>
          ))}
        </Table>
      )}
      {modal && (
        modal.type === 'view'
          ? <Modal title="Student details" onClose={() => setModal(null)}>
              <Detail x={modal.x} />
              <p><b>Skills:</b> {modal.x.skills?.join(', ') || '—'}</p>
              <p><b>Resume:</b> {modal.x.resume || 'Not uploaded'}</p>
            </Modal>
          : <Modal title="Edit student" onClose={() => setModal(null)}>
              <Form
                fields={fields}
                value={{ ...modal.x, skills: modal.x.skills?.join(', ') }}
                onClose={() => setModal(null)}
                onSave={async x => {
                  x.skills = x.skills?.split(',').map(s => s.trim()).filter(Boolean) || [];
                  await api('/admin/students/' + modal.x._id, { method: 'PUT', body: JSON.stringify(x) });
                  setModal(null); load();
                }}
              />
            </Modal>
      )}
    </>
  );
}
