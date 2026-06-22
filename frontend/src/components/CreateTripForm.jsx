import React, { useState } from 'react';
import api from '../utils/api';

const BUDGET_OPTIONS = [
  { value: 'Low', label: 'Budget', icon: '💰', desc: 'Hostels & local food' },
  { value: 'Medium', label: 'Standard', icon: '✈️', desc: 'Mid-range comfort' },
  { value: 'High', label: 'Luxury', icon: '👑', desc: 'Premium experience' },
];

export default function CreateTripForm({ onTripCreated, onClose }) {
  const [destination, setDestination] = useState('');
  const [durationDays, setDurationDays] = useState(3);
  const [budgetTier, setBudgetTier] = useState('Medium');
  const [interests, setInterests] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const interestsArray = interests
        ? interests.split(',').map((i) => i.trim()).filter(Boolean)
        : [];
      const response = await api.post('/api/trips/generate', {
        destination,
        durationDays: Number(durationDays),
        budgetTier,
        interests: interestsArray,
      });
      onTripCreated(response.data);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to generate itinerary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      width: '100%', maxWidth: '480px',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      border: '1px solid #334155',
      borderRadius: '20px',
      padding: '32px',
      boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
      position: 'relative',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
            ✈️ Plan Your Trip
          </h3>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0' }}>AI-powered itinerary generator</p>
        </div>
        <button
          onClick={onClose}
          style={{ background: '#1e293b', border: '1px solid #334155', color: '#94a3b8', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >✕</button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: '13px', padding: '10px 14px', borderRadius: '10px', marginBottom: '20px' }}>
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '48px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', border: '4px solid #4f46e5', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ color: '#818cf8', fontWeight: 700, fontSize: '15px', margin: 0 }}>Consulting Gemini AI...</p>
          <p style={{ color: '#64748b', fontSize: '13px', maxWidth: '280px', margin: 0 }}>
            Generating a weather-aware itinerary, hotels & budget breakdown. This takes ~10 seconds.
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>

          {/* Destination */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
              📍 Destination
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              required
              placeholder="e.g. Paris, France"
              style={{
                width: '100%', background: '#0f172a', border: '1px solid #334155',
                borderRadius: '12px', padding: '12px 16px', fontSize: '14px',
                color: '#f8fafc', outline: 'none', boxSizing: 'border-box',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = '#6366f1'}
              onBlur={e => e.target.style.borderColor = '#334155'}
            />
          </div>

          {/* Duration */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
              📅 Duration (Days)
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0', background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', overflow: 'hidden' }}>
              <button
                type="button"
                onClick={() => setDurationDays(d => Math.max(1, Number(d) - 1))}
                style={{ padding: '12px 20px', background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '20px', cursor: 'pointer', fontWeight: 700 }}
              >−</button>
              <span style={{ flex: 1, textAlign: 'center', color: '#f8fafc', fontWeight: 700, fontSize: '18px' }}>
                {durationDays}
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 400, marginLeft: '4px' }}>
                  {durationDays === 1 ? 'day' : 'days'}
                </span>
              </span>
              <button
                type="button"
                onClick={() => setDurationDays(d => Math.min(30, Number(d) + 1))}
                style={{ padding: '12px 20px', background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '20px', cursor: 'pointer', fontWeight: 700 }}
              >+</button>
            </div>
          </div>

          {/* Budget Tier — Radio Cards */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
              💳 Budget Tier
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {BUDGET_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setBudgetTier(opt.value)}
                  style={{
                    padding: '12px 8px',
                    borderRadius: '12px',
                    border: budgetTier === opt.value ? '2px solid #6366f1' : '2px solid #334155',
                    background: budgetTier === opt.value ? 'rgba(99,102,241,0.15)' : '#0f172a',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s',
                    outline: 'none',
                  }}
                >
                  <div style={{ fontSize: '22px', marginBottom: '4px' }}>{opt.icon}</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: budgetTier === opt.value ? '#a5b4fc' : '#cbd5e1' }}>{opt.label}</div>
                  <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
              🎯 Interests <span style={{ color: '#475569', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(comma-separated, optional)</span>
            </label>
            <input
              type="text"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="e.g. Museums, Hiking, Food, Beach"
              style={{
                width: '100%', background: '#0f172a', border: '1px solid #334155',
                borderRadius: '12px', padding: '12px 16px', fontSize: '14px',
                color: '#f8fafc', outline: 'none', boxSizing: 'border-box',
              }}
              onFocus={e => e.target.style.borderColor = '#6366f1'}
              onBlur={e => e.target.style.borderColor = '#334155'}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            style={{
              width: '100%', padding: '14px',
              background: 'linear-gradient(135deg, #4f46e5, #0891b2)',
              border: 'none', borderRadius: '12px', color: '#fff',
              fontSize: '15px', fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(79,70,229,0.35)',
              transition: 'opacity 0.2s, transform 0.1s',
              marginTop: '4px',
            }}
            onMouseEnter={e => e.target.style.opacity = '0.9'}
            onMouseLeave={e => e.target.style.opacity = '1'}
          >
            🚀 Generate Travel Plan
          </button>

        </form>
      )}
    </div>
  );
}
