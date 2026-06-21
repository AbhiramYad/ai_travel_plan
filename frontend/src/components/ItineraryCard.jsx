import React, { useState } from 'react';
import api from '../utils/api';

export default function ItineraryCard({ day, trip, onUpdate }) {
  const [newActivityName, setNewActivityName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddActivity = async (e) => {
    e.preventDefault();
    const title = newActivityName.trim();
    if (!title) return;

    setLoading(true);

    const newActivity = {
      title,
      description: 'Manually added activity',
      estimatedCostUSD: 0,
      timeOfDay: 'Morning'
    };

    const updatedItinerary = trip.itinerary.map((d) => {
      if (d.dayNumber === day.dayNumber) {
        return {
          ...d,
          activities: [...d.activities, newActivity]
        };
      }
      return d;
    });

    try {
      const response = await api.put(`/api/trips/${trip._id}`, {
        itinerary: updatedItinerary
      });
      onUpdate(response.data);
      setNewActivityName('');
    } catch (error) {
      console.error('Failed to add activity:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative pl-6">
      {/* Circle dot marker */}
      <div className="absolute left-[-9px] top-1.5 w-4 h-4 rounded-full bg-slate-950 border-2 border-indigo-500 flex items-center justify-center">
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
      </div>

      <div className="mb-4">
        <h4 className="text-lg font-bold text-slate-200">Day {day.dayNumber}</h4>
      </div>

      <div className="space-y-4">
        {day.activities.map((act, index) => (
          <div
            key={index}
            className="bg-slate-950/60 border border-slate-800/60 p-4 rounded-xl flex justify-between gap-4 transition-all hover:border-slate-700/60"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
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
        ))}
      </div>

      {/* Add activity inline form */}
      <form onSubmit={handleAddActivity} className="mt-4 flex gap-2">
        <input
          type="text"
          value={newActivityName}
          onChange={(e) => setNewActivityName(e.target.value)}
          placeholder="Add custom activity..."
          required
          disabled={loading}
          className="flex-1 bg-slate-950/40 border border-slate-800/80 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-slate-850 hover:bg-slate-800 border border-slate-800 text-xs font-semibold rounded-xl transition-colors disabled:opacity-50"
        >
          {loading ? 'Adding...' : 'Add'}
        </button>
      </form>
    </div>
  );
}
