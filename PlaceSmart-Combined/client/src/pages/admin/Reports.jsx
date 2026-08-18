import React, { useEffect, useState } from 'react';
import { api } from '../../api.js';
import { Loading, PageHeader, Funnel, Table } from './shared.jsx';

export default function Reports() {
  const [d, setD] = useState();
  useEffect(() => {
    api('/admin/reports').then(setD).catch(() => {});
  }, []);

  if (!d) return <Loading />;

  const funnelData = {
    applications: d.totals?.applications || 0,
    underReview: d.statuses?.['UNDER REVIEW'] || 0,
    shortlisted: d.statuses?.SHORTLISTED || 0,
    interview: d.statuses?.SHORTLISTED || 0,
    selected: d.statuses?.SELECTED || 0
  };

  const statCards = [
    ['Total Students', d.totals?.students || 0],
    ['Total Companies', d.totals?.companies || 0],
    ['Total Drives', d.totals?.drives || 0],
    ['Total Applications', d.totals?.applications || 0],
    ['Under Review', d.statuses?.['UNDER REVIEW'] || 0],
    ['Shortlisted', d.statuses?.SHORTLISTED || 0],
    ['Selected', d.statuses?.SELECTED || 0],
    ['Rejected', d.statuses?.REJECTED || 0]
  ];

  return (
    <>
      <PageHeader
        eyebrow="PLACEMENT ANALYTICS"
        title="Reports"
        copy="Monitor overall campus placement performance, offer rates, and recruiter insights."
      />
      <div className="cards compact">
        {statCards.map(x => (
          <article className="card" key={x[0]}>
            <span>{x[0]}</span>
            <strong>{x[1]}</strong>
          </article>
        ))}
      </div>
      <div className="two-col">
        <section className="panel">
          <h3>Placement Funnel</h3>
          <Funnel data={funnelData} />
          <div className="rate">
            <strong>{d.placementRate || 0}%</strong>
            <span>Overall Placement Rate</span>
          </div>
        </section>
        <section className="panel">
          <h3>Company-wise Placement Statistics</h3>
          {d.companyStats && d.companyStats.length ? (
            <Table heads={['Company', 'Applications', 'Selected']}>
              {d.companyStats.map(x => (
                <tr key={x.name}>
                  <td><b>{x.name}</b></td>
                  <td>{x.applications}</td>
                  <td><span className="badge SELECTED">{x.selected}</span></td>
                </tr>
              ))}
            </Table>
          ) : (
            <p className="muted">No company statistics available yet.</p>
          )}
        </section>
      </div>
    </>
  );
}
