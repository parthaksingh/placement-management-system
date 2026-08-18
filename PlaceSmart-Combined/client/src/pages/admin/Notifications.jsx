import React, { useEffect, useState } from 'react';
import { api } from '../../api.js';
import { Loading, PageHeader, Table, Actions, Modal, Form, Detail, fmtDate, label } from './shared.jsx';

export default function Notifications() {
  const [items, setItems] = useState();
  const [drives, setDrives] = useState([]);
  const [modal, setModal] = useState();

  const load = () => api('/admin/notifications').then(setItems).catch(() => {});

  useEffect(() => {
    load();
    api('/admin/placement-drives').then(setDrives).catch(() => {});
  }, []);

  const fields = [
    { key: 'title', label: 'Notification Title', required: true },
    { key: 'message', label: 'Message Body', type: 'textarea', required: true },
    {
      key: 'targetAudience',
      label: 'Target Audience',
      type: 'select',
      options: ['ALL_STUDENTS', 'DRIVE_STUDENTS', 'SHORTLISTED_STUDENTS', 'SELECTED_STUDENTS'],
      required: true
    },
    {
      key: 'placementDrive',
      label: 'Associated Placement Drive (Optional)',
      type: 'select',
      options: drives
    }
  ];

  const del = async x => {
    if (confirm('Delete this notification?')) {
      await api('/admin/notifications/' + x._id, { method: 'DELETE' });
      load();
    }
  };

  const save = async x => {
    await api('/admin/notifications', { method: 'POST', body: JSON.stringify(x) });
    setModal(null);
    load();
  };

  return (
    <>
      <PageHeader
        eyebrow="NOTIFICATION MANAGEMENT"
        title="Notifications"
        copy="Broadcast important updates, drive announcements, and interview notices."
        action={<button id="add-notification-btn" onClick={() => setModal({})}>+ Create Notification</button>}
      />
      {!items ? <Loading /> : (
        <Table heads={['Title', 'Message', 'Target Audience', 'Drive', 'Date', 'Actions']}>
          {items.map(x => (
            <tr key={x._id}>
              <td><b>{x.title}</b></td>
              <td>{x.message?.slice(0, 80)}{x.message?.length > 80 ? '…' : ''}</td>
              <td><span className="badge">{label(x.targetAudience)}</span></td>
              <td>{x.placementDrive?.jobTitle || 'All / General'}</td>
              <td>{fmtDate(x.createdAt)}</td>
              <td>
                <Actions
                  view={() => setModal({ x, view: true })}
                  del={() => del(x)}
                />
              </td>
            </tr>
          ))}
        </Table>
      )}
      {modal && (
        <Modal title={modal.view ? 'Notification details' : 'Create Notification'} onClose={() => setModal(null)}>
          {modal.view ? (
            <Detail x={modal.x} />
          ) : (
            <Form
              fields={fields}
              onClose={() => setModal(null)}
              onSave={save}
              submit="Publish Notification"
            />
          )}
        </Modal>
      )}
    </>
  );
}
