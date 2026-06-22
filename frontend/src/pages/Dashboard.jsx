import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import CreateTripForm from '../components/CreateTripForm';
import ItineraryCard from '../components/ItineraryCard';
import PackingList from '../components/PackingList';

export default function Dashboard() {
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [userName] = useState(() => localStorage.getItem('userName') || '');
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
    localStorage.removeItem('userName');
    navigate('/');
  };

  const handleTripCreated = (newTrip) => {
    setTrips([newTrip, ...trips]);
    setSelectedTrip(newTrip);
  };

  const handleTripUpdated = (updatedTrip) => {
    setSelectedTrip(updatedTrip);
    setTrips(trips.map(t => t._id === updatedTrip._id ? updatedTrip : t));
  };

  const handleDeleteTrip = async (tripId) => {
    if (!window.confirm('Are you sure you want to delete this trip itinerary?')) return;

    try {
      await api.delete(`/api/trips/${tripId}`);
      const remainingTrips = trips.filter(t => t._id !== tripId);
      setTrips(remainingTrips);
      setSelectedTrip(remainingTrips.length > 0 ? remainingTrips[0] : null);
    } catch (error) {
      console.error('Failed to delete trip:', error);
    }
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
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
            AI Travel Dashboard
          </h1>
          {userName && (
            <p className="text-xs text-slate-400 mt-0.5">Welcome back, <span className="text-indigo-400 font-semibold">{userName}</span> ✈️</p>
          )}
        </div>
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
                  <div key={t._id} className="relative group">
                    <button
                      onClick={() => setSelectedTrip(t)}
                      className={`w-full text-left p-4 pr-12 rounded-xl border text-sm transition-all flex flex-col gap-1 ${
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
                    
                    {/* Delete Trip button */}
                    <button
                      onClick={() => handleDeleteTrip(t._id)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-rose-400 rounded-lg opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all"
                      title="Delete Trip"
                    >
                      ✕
                    </button>
                  </div>
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

            {/* Hotel Recommendations */}
            {selectedTrip && selectedTrip.hotels && selectedTrip.hotels.length > 0 && (
              <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                  🏨 Hotel Recommendations
                </h3>
                <div className="space-y-3">
                  {selectedTrip.hotels.map((hotel, i) => (
                    <div key={i} className="bg-slate-950/50 border border-slate-800/60 p-4 rounded-xl">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <p className="text-sm font-bold text-slate-200">{hotel.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{hotel.rating}</p>
                        </div>
                        <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-md shrink-0">
                          ${hotel.estimatedCostNightUSD}/night
                        </span>
                      </div>
                      <span className={`mt-2 inline-block text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded border ${
                        hotel.tier === 'High' ? 'border-amber-500/30 bg-amber-500/10 text-amber-400' :
                        hotel.tier === 'Medium' ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400' :
                        'border-slate-600 bg-slate-800/40 text-slate-400'
                      }`}>{hotel.tier}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column (Itinerary Timeline & Packing List) */}
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
                      <ItineraryCard
                        key={day.dayNumber}
                        day={day}
                        trip={selectedTrip}
                        onUpdate={handleTripUpdated}
                      />
                    ))}
                  </div>
                </div>

                {/* Packing List Section */}
                <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                    ⛈️ AI Weather-Aware Packing Assistant
                  </h3>
                  <p className="text-xs text-slate-400 mb-6">
                    Based on your active planned locations and local forecasted climate, pack these items:
                  </p>
                  
                  <PackingList
                    packingList={selectedTrip.packingList}
                    tripId={selectedTrip._id}
                    onUpdate={handleTripUpdated}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Create Trip Form Modal Overlay */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <CreateTripForm
            onTripCreated={handleTripCreated}
            onClose={() => setShowCreateModal(false)}
          />
        </div>
      )}
    </div>
  );
}
