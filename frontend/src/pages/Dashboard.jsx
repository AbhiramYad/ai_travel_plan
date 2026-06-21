import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function Dashboard() {
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activityInputs, setActivityInputs] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    fetchUserTrips();
  }, [navigate]);

  const fetchUserTrips = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/trips');
      setTrips(response.data);
      if (response.data.length > 0) {
        setSelectedTrip(response.data[0]);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/');
      }
      console.error('Failed to fetch user trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleAddActivity = async (e, dayNumber) => {
    e.preventDefault();
    const title = activityInputs[dayNumber]?.trim();
    if (!title || !selectedTrip) return;

    const newActivity = {
      title,
      description: 'Manually added activity',
      estimatedCostUSD: 0,
      timeOfDay: 'Morning'
    };

    const updatedItinerary = selectedTrip.itinerary.map(day => {
      if (day.dayNumber === dayNumber) {
        return {
          ...day,
          activities: [...day.activities, newActivity]
        };
      }
      return day;
    });

    try {
      const response = await api.put(`/api/trips/${selectedTrip._id}`, {
        itinerary: updatedItinerary
      });
      setSelectedTrip(response.data);
      setTrips(trips.map(t => t._id === response.data._id ? response.data : t));
      setActivityInputs({
        ...activityInputs,
        [dayNumber]: ''
      });
    } catch (error) {
      console.error('Failed to add activity:', error);
    }
  };

  const handleActivityInputChange = (dayNumber, val) => {
    setActivityInputs({
      ...activityInputs,
      [dayNumber]: val
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center">
        <div className="text-xl font-bold tracking-wider text-indigo-400 animate-pulse">
          Loading secure user vault...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-slate-900/60 backdrop-blur-xl border-b border-slate-800/80 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
          AI Travel Dashboard
        </h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-600/10"
          >
            Create New Trip
          </button>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 border border-slate-800 hover:bg-slate-800 text-sm font-semibold rounded-xl transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      {trips.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
          <span className="text-6xl mb-6">✈️</span>
          <h2 className="text-xl font-bold text-slate-200">No trips generated yet</h2>
          <p className="text-sm text-slate-400 mt-2 mb-6">
            Create your first intelligent, day-by-day travel plan using Google Gemini AI models.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-sm font-semibold rounded-xl transition-all"
          >
            Generate First Trip
          </button>
        </div>
      ) : (
        <div className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (Trips list + Budget) */}
          <div className="space-y-6 lg:col-span-1">
            {/* Active Trips Card */}
            <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                Your Active Trips
              </h3>
              <div className="space-y-2">
                {trips.map((t) => (
                  <button
                    key={t._id}
                    onClick={() => setSelectedTrip(t)}
                    className={`w-full text-left p-4 rounded-xl border text-sm transition-all flex flex-col gap-1 ${
                      selectedTrip?._id === t._id
                        ? 'bg-indigo-600/15 border-indigo-500/50 text-indigo-200'
                        : 'bg-slate-950/40 border-slate-800/60 text-slate-300 hover:border-slate-700/80'
                    }`}
                  >
                    <span className="font-bold text-slate-100 text-base">{t.destination}</span>
                    <span className="text-xs text-slate-400">
                      {t.durationDays} Days • {t.budgetTier} Budget
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Financial Cost Ledger */}
            {selectedTrip && (
              <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                  Financial Cost Ledger
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm text-slate-400 border-b border-slate-800/60 pb-2">
                    <span>Transport</span>
                    <span className="font-mono text-slate-200">${selectedTrip.estimatedBudget?.transport || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-400 border-b border-slate-800/60 pb-2">
                    <span>Accommodation</span>
                    <span className="font-mono text-slate-200">${selectedTrip.estimatedBudget?.accommodation || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-400 border-b border-slate-800/60 pb-2">
                    <span>Food</span>
                    <span className="font-mono text-slate-200">${selectedTrip.estimatedBudget?.food || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-400 border-b border-slate-800/60 pb-2">
                    <span>Activities</span>
                    <span className="font-mono text-slate-200">${selectedTrip.estimatedBudget?.activities || 0}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-indigo-400 pt-2">
                    <span>Total Cost</span>
                    <span className="font-mono">${selectedTrip.estimatedBudget?.total || 0}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column (Itinerary Timeline & Details) */}
          <div className="lg:col-span-2 space-y-6">
            {selectedTrip && (
              <>
                {/* Timeline Section */}
                <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
                    Itinerary Timeline
                  </h3>
                  
                  <div className="relative pl-6 border-l-2 border-indigo-500/30 ml-4 space-y-8">
                    {selectedTrip.itinerary.map((day) => (
                      <div key={day.dayNumber} className="relative">
                        {/* Dot marker */}
                        <div className="absolute left-[-31px] top-1.5 w-4 h-4 rounded-full bg-slate-950 border-2 border-indigo-500 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                        </div>

                        <div className="mb-4">
                          <h4 className="text-lg font-bold text-slate-200">Day {day.dayNumber}</h4>
                        </div>

                        <div className="space-y-4">
                          {day.activities.map((act, index) => (
                            <div key={index} className="bg-slate-950/60 border border-slate-800/60 p-4 rounded-xl flex justify-between gap-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-bold text-slate-200">{act.title}</span>
                                  <span className="text-[10px] bg-slate-800/60 px-2 py-0.5 rounded-md font-mono text-cyan-400 uppercase">
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
                        <form onSubmit={(e) => handleAddActivity(e, day.dayNumber)} className="mt-4 flex gap-2">
                          <input
                            type="text"
                            value={activityInputs[day.dayNumber] || ''}
                            onChange={(e) => handleActivityInputChange(day.dayNumber, e.target.value)}
                            placeholder="Add custom activity..."
                            className="flex-1 bg-slate-950/40 border border-slate-800/80 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                          />
                          <button
                            type="submit"
                            className="px-4 py-2 bg-slate-850 hover:bg-slate-800 border border-slate-800 text-xs font-semibold rounded-xl transition-colors"
                          >
                            Add
                          </button>
                        </form>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Packing List Placeholder */}
                <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                    ⛈️ AI Weather-Aware Packing Assistant
                  </h3>
                  <p className="text-xs text-slate-400 mb-4">
                    Based on your active planned locations and local forecasted climate, pack these items:
                  </p>
                  <div className="text-slate-500 text-xs italic">
                    Packing list items will be integrated in Phase 10.
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Temporary Modal Placeholder for creation */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Create Trip Placeholder</h3>
            <p className="text-xs text-slate-400 mb-6">
              Create trip form component will be integrated in Phase 10.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-slate-800 text-xs font-semibold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
