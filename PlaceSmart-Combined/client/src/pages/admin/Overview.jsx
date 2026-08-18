import React, { useEffect, useState } from 'react';
import { api } from '../../api.js';
import { Loading, PageHeader, Funnel } from './shared.jsx';

export default function Overview() {
  const [d, setD] = useState();
  useEffect(() => { api('/admin/dashboard').then(setD).catch(() => {}); }, []);
  if (!d) return <Loading />;

  const cards = [
    ['Total Students', d.totals.totalStudents],
    ['Total Companies', d.totals.totalCompanies],
    ['Active Drives', d.totals.activeDrives],
    ['Total Applications', d.totals.totalApplications]
  ];

  return (
    <>
      <PageHeader eyebrow="PLACEMENT CELL" title="Placement Command Center" copy="Manage the complete campus placement process." />
      <div className="cards">
        {cards.map(c => (
          <article className="card" key={c[0]}>
            <span>{c[0]}</span>
            <strong>{c[1]}</strong>
          </article>
        ))}
      </div>
      <div className="two-col">
        <section className="panel">
          <h3>Placement Funnel</h3>
          <Funnel data={d.funnel} />
        </section>
        <section className="panel">
          <h3>Recent Activity</h3>
          <div className="activity">
            {d.activities.map((x, i) => (
              <p key={i}>
                <span>{x.text}</span>
                <small>{x.date ? new Date(x.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : ''}</small>
              </p>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
