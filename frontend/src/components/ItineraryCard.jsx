import React, { useState } from 'react';
import api from '../utils/api';

const TIME_OPTIONS = ['Morning', 'Midday', 'Afternoon', 'Evening', 'Night'];

export default function ItineraryCard({ day, trip, onUpdate }) {
  // ── Add Activity state ──────────────────────────
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCost, setNewCost] = useState('');
  const [newTime, setNewTime] = useState('Morning');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');

  // ── Regenerate Day state ────────────────────────
  const [showRegenForm, setShowRegenForm] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [regenLoading, setRegenLoading] = useState(false);
  const [regenError, setRegenError] = useState('');

  // ── Delete Activity state ───────────────────────
  const [deletingIndex, setDeletingIndex] = useState(null);

  // ── Helpers ─────────────────────────────────────
  const resetAddForm = () => {
    setNewTitle(''); setNewDesc(''); setNewCost(''); setNewTime('Morning');
    setAddError(''); setShowAddForm(false);
  };

  // ── Handlers ────────────────────────────────────
  const handleAddActivity = async (e) => {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;
    setAddLoading(true); setAddError('');

    const newActivity = {
      title,
      description: newDesc.trim() || 'Custom activity',
      estimatedCostUSD: Number(newCost) || 0,
      timeOfDay: newTime,
    };

    const updatedItinerary = trip.itinerary.map((d) =>
      d.dayNumber === day.dayNumber
        ? { ...d, activities: [...d.activities, newActivity] }
        : d
    );

    try {
      const res = await api.put(`/api/trips/${trip._id}`, { itinerary: updatedItinerary });
      onUpdate(res.data);
      resetAddForm();
    } catch (err) {
      setAddError('Failed to save. Please try again.');
    } finally {
      setAddLoading(false);
    }
  };

  const handleDeleteActivity = async (actIndex) => {
    setDeletingIndex(actIndex);
    const updatedItinerary = trip.itinerary.map((d) =>
      d.dayNumber === day.dayNumber
        ? { ...d, activities: d.activities.filter((_, i) => i !== actIndex) }
        : d
    );
    try {
      const res = await api.put(`/api/trips/${trip._id}`, { itinerary: updatedItinerary });
      onUpdate(res.data);
    } catch (err) {
      console.error('Failed to delete activity:', err);
    } finally {
      setDeletingIndex(null);
    }
  };

  const handleRegenerateDay = async (e) => {
    e.preventDefault();
    const fb = feedback.trim();
    if (!fb) return;
    setRegenLoading(true); setRegenError('');
    try {
      const res = await api.post(`/api/trips/${trip._id}/regenerate-day`, {
        dayNumber: day.dayNumber,
        feedback: fb,
      });
      onUpdate(res.data);
      setFeedback(''); setShowRegenForm(false);
    } catch (err) {
      setRegenError(err.response?.data?.message || 'Regeneration failed. Try again.');
    } finally {
      setRegenLoading(false);
    }
  };

  // ── Render ───────────────────────────────────────
  return (
    <div className="relative pl-6">
      {/* Timeline dot */}
      <div className="absolute left-[-9px] top-1.5 w-4 h-4 rounded-full bg-slate-950 border-2 border-indigo-500 flex items-center justify-center">
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
      </div>

      {/* Day header + Regenerate button */}
      <div className="mb-4 flex items-center justify-between">
        <h4 className="text-lg font-bold text-slate-200">Day {day.dayNumber}</h4>
        <button
          onClick={() => { setShowRegenForm(v => !v); setRegenError(''); }}
          className="text-[11px] px-3 py-1.5 rounded-lg border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 transition-all flex items-center gap-1.5"
        >
          🔄 Regenerate Day
        </button>
      </div>

      {/* ── Regenerate Day Form ───────────────────── */}
      {showRegenForm && (
        <div style={{
          background: 'linear-gradient(135deg,#0f172a,#1a2540)',
          border: '1px solid #4f46e5',
          borderRadius: '12px', padding: '16px', marginBottom: '16px',
        }}>
          <p style={{ fontSize: '12px', color: '#818cf8', fontWeight: 700, marginBottom: '10px' }}>
            🔄 What should change on Day {day.dayNumber}?
          </p>
          {regenError && (
            <div style={{ color: '#f87171', fontSize: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '8px 12px', marginBottom: '10px' }}>
              {regenError}
            </div>
          )}
          <form onSubmit={handleRegenerateDay} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <textarea
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              placeholder='e.g. "I prefer outdoor activities" or "Replace the museum visit with street food tours"'
              required
              rows={3}
              disabled={regenLoading}
              style={{
                width: '100%', background: '#0b1120', border: '1px solid #334155',
                borderRadius: '9px', padding: '10px 12px', fontSize: '13px',
                color: '#f8fafc', resize: 'vertical', outline: 'none', boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => { setShowRegenForm(false); setFeedback(''); setRegenError(''); }}
                disabled={regenLoading}
                style={{ flex: 1, padding: '8px', background: 'transparent', border: '1px solid #334155', borderRadius: '8px', color: '#64748b', fontSize: '13px', cursor: 'pointer' }}
              >Cancel</button>
              <button
                type="submit"
                disabled={regenLoading}
                style={{
                  flex: 2, padding: '8px',
                  background: regenLoading ? '#374151' : 'linear-gradient(135deg,#4f46e5,#7c3aed)',
                  border: 'none', borderRadius: '8px', color: '#fff',
                  fontSize: '13px', fontWeight: 700, cursor: regenLoading ? 'not-allowed' : 'pointer',
                }}
              >
                {regenLoading ? '⏳ Consulting Gemini AI...' : '🔄 Regenerate with AI'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Activities List ──────────────────────── */}
      <div className="space-y-3">
        {day.activities.map((act, index) => (
          <div
            key={index}
            className="bg-slate-950/60 border border-slate-800/60 p-4 rounded-xl transition-all hover:border-slate-700/60 group relative"
          >
            {/* Delete button */}
            <button
              onClick={() => handleDeleteActivity(index)}
              disabled={deletingIndex === index}
              title="Remove activity"
              className="absolute top-3 right-3 w-6 h-6 rounded-md text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs"
            >
              {deletingIndex === index ? '…' : '✕'}
            </button>

            <div className="flex justify-between gap-4 pr-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-slate-200">{act.title}</span>
                  <span className="text-[10px] bg-slate-800/60 px-2 py-0.5 rounded-md font-mono text-cyan-400 uppercase tracking-wider">
                    {act.timeOfDay}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{act.description}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-mono bg-indigo-500/10 px-2 py-1 rounded-md text-indigo-400">
                  ${act.estimatedCostUSD}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Add Activity ─────────────────────────── */}
      <div className="mt-4">
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full py-2.5 border border-dashed border-slate-700 rounded-xl text-xs text-slate-500 hover:border-indigo-500 hover:text-indigo-400 transition-all flex items-center justify-center gap-2"
          >
            <span className="text-base">＋</span> Add custom activity
          </button>
        ) : (
          <div style={{
            background: 'linear-gradient(135deg,#0f172a,#1e293b)',
            border: '1px solid #334155', borderRadius: '14px', padding: '18px',
          }}>
            <p style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px' }}>
              ＋ Add to Day {day.dayNumber}
            </p>
            {addError && (
              <div style={{ color: '#f87171', fontSize: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '8px 12px', marginBottom: '12px' }}>
                {addError}
              </div>
            )}
            <form onSubmit={handleAddActivity} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Title */}
              <div>
                <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '5px' }}>Activity Name *</label>
                <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Visit Eiffel Tower" required disabled={addLoading}
                  style={{ width: '100%', background: '#0b1120', border: '1px solid #334155', borderRadius: '9px', padding: '9px 12px', fontSize: '13px', color: '#f8fafc', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              {/* Cost + Time row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '5px' }}>💵 Cost (USD)</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: '13px' }}>$</span>
                    <input type="number" min="0" step="0.01" value={newCost} onChange={e => setNewCost(e.target.value)}
                      placeholder="0" disabled={addLoading}
                      style={{ width: '100%', background: '#0b1120', border: '1px solid #334155', borderRadius: '9px', padding: '9px 12px 9px 22px', fontSize: '13px', color: '#f8fafc', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '5px' }}>🕐 Time of Day</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {TIME_OPTIONS.map(t => (
                      <button key={t} type="button" onClick={() => setNewTime(t)}
                        style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '10px', cursor: 'pointer', border: newTime === t ? '1px solid #6366f1' : '1px solid #334155', background: newTime === t ? 'rgba(99,102,241,0.2)' : '#0b1120', color: newTime === t ? '#a5b4fc' : '#64748b', fontWeight: newTime === t ? 700 : 400 }}
                      >{t}</button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '5px' }}>📝 Description (optional)</label>
                <input type="text" value={newDesc} onChange={e => setNewDesc(e.target.value)}
                  placeholder="Short description" disabled={addLoading}
                  style={{ width: '100%', background: '#0b1120', border: '1px solid #334155', borderRadius: '9px', padding: '9px 12px', fontSize: '13px', color: '#f8fafc', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button type="button" onClick={resetAddForm} disabled={addLoading}
                  style={{ flex: 1, padding: '9px', background: 'transparent', border: '1px solid #334155', borderRadius: '9px', color: '#64748b', fontSize: '13px', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={addLoading}
                  style={{ flex: 2, padding: '9px', background: addLoading ? '#374151' : 'linear-gradient(135deg,#4f46e5,#0891b2)', border: 'none', borderRadius: '9px', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: addLoading ? 'not-allowed' : 'pointer' }}>
                  {addLoading ? 'Saving...' : '＋ Add Activity'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
