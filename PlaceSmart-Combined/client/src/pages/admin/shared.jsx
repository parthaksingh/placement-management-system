import React, { Component } from 'react';

// ── Shared helpers ────────────────────────────────────────────────────────
export const label = x => x?.replaceAll('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
export const fmtDate = x => x ? new Date(x).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

// ── Loading ───────────────────────────────────────────────────────────────
export function Loading() {
  return <div className="loading">Loading placement data…</div>;
}

// ── Modal ─────────────────────────────────────────────────────────────────
export function Modal({ title, children, onClose }) {
  return (
    <div className="overlay">
      <section className="modal">
        <button className="close" onClick={onClose}>×</button>
        <h2>{title}</h2>
        {children}
      </section>
    </div>
  );
}

// ── Form ──────────────────────────────────────────────────────────────────
export function Form({ fields, value = {}, onSave, onClose, submit = 'Save' }) {
  const [data, setData] = React.useState(value);
  const set = (k, v) => setData({ ...data, [k]: v });
  return (
    <form className="form" onSubmit={e => { e.preventDefault(); onSave(data); }}>
      {fields.map(f => (
        <label key={f.key}>
          {f.label}
          {f.type === 'select' ? (
            <select value={data[f.key] || ''} onChange={e => set(f.key, e.target.value)} required={f.required}>
              <option value="">Select</option>
              {f.options.map(x => (
                <option key={typeof x === 'string' ? x : x._id} value={typeof x === 'string' ? x : x._id}>
                  {typeof x === 'string' ? label(x) : x.name || x.jobTitle}
                </option>
              ))}
            </select>
          ) : f.type === 'textarea' ? (
            <textarea value={data[f.key] || ''} onChange={e => set(f.key, e.target.value)} />
          ) : (
            <input
              type={f.type || 'text'}
              step={f.type === 'number' ? '0.1' : undefined}
              value={data[f.key] || ''}
              onChange={e => set(f.key, f.type === 'number' ? Number(e.target.value) : e.target.value)}
              required={f.required}
            />
          )}
        </label>
      ))}
      <div className="form-actions">
        <button type="button" className="ghost" onClick={onClose}>Cancel</button>
        <button type="submit">{submit}</button>
      </div>
    </form>
  );
}

// ── PageHeader ────────────────────────────────────────────────────────────
export function PageHeader({ eyebrow, title, copy, action }) {
  return (
    <header className="page-header">
      <div>
        <small>{eyebrow}</small>
        <h1>{title}</h1>
        <p className="muted">{copy}</p>
      </div>
      {action}
    </header>
  );
}

// ── Table ─────────────────────────────────────────────────────────────────
export function Table({ heads, children }) {
  return (
    <div className="table-wrap">
      <table>
        <thead><tr>{heads.map(x => <th key={x}>{x}</th>)}</tr></thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────
export function Badge({ text }) {
  return <span className={`badge ${String(text).replace(' ', '-')}`}>{label(text)}</span>;
}

// ── Actions ───────────────────────────────────────────────────────────────
export function Actions({ view, edit, del }) {
  return (
    <span className="actions">
      {view && <button onClick={view}>View</button>}
      {edit && <button onClick={edit}>Edit</button>}
      {del && <button className="danger" onClick={del}>Delete</button>}
    </span>
  );
}

// ── Detail view ───────────────────────────────────────────────────────────
export function Detail({ x }) {
  return (
    <div className="detail">
      {Object.entries(x)
        .filter(([k, v]) => !['_id', '__v', 'createdAt', 'updatedAt', 'description', 'password', 'applications'].includes(k) && typeof v !== 'object')
        .map(([k, v]) => <p key={k}><b>{label(k)}:</b> {String(v)}</p>)
      }
      {x.description && <p><b>Description:</b> {x.description}</p>}
    </div>
  );
}

// ── Funnel ────────────────────────────────────────────────────────────────
export function Funnel({ data }) {
  const steps = [
    ['Applications', data.applications],
    ['Under Review', data.underReview],
    ['Shortlisted', data.shortlisted],
    ['Interview', data.interview],
    ['Selected', data.selected]
  ];
  return (
    <div className="funnel">
      {steps.map(([x, n], i) => (
        <React.Fragment key={x}>
          <div><span>{x}</span><b>{n}</b></div>
          {i < 4 && <em>↓</em>}
        </React.Fragment>
      ))}
    </div>
  );
}

// ── Error boundary ────────────────────────────────────────────────────────
function PageError() {
  return (
    <section className="not-found">
      <small>PAGE ERROR</small>
      <h1>This page could not be displayed.</h1>
      <p>Use the sidebar to continue to another administrator page.</p>
    </section>
  );
}

export class PageErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: false }; }
  static getDerivedStateFromError() { return { error: true }; }
  render() { return this.state.error ? <PageError /> : this.props.children; }
}
