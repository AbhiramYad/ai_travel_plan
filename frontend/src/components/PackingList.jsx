import React, { useState } from 'react';
import api from '../utils/api';

export default function PackingList({ packingList, tripId, onUpdate }) {
  const [updatingId, setUpdatingId] = useState(null);

  const togglePackingItem = async (itemId) => {
    if (!itemId) return;
    setUpdatingId(itemId);

    const updatedPackingList = packingList.map((item) => {
      if (item._id === itemId) {
        return {
          ...item,
          isPacked: !item.isPacked
        };
      }
      return item;
    });

    try {
      const response = await api.put(`/api/trips/${tripId}`, {
        packingList: updatedPackingList
      });
      onUpdate(response.data);
    } catch (error) {
      console.error('Failed to toggle packing item:', error);
    } finally {
      setUpdatingId(null);
    }
  };

  const getBadgeStyle = (category) => {
    switch (category) {
      case 'Documents':
        return 'border-rose-500/30 bg-rose-500/10 text-rose-400';
      case 'Clothing':
        return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400';
      case 'Gear':
        return 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400';
      default:
        return 'border-slate-700 bg-slate-800/40 text-slate-300';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {packingList.map((item) => (
        <div
          key={item._id}
          onClick={() => togglePackingItem(item._id)}
          className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer select-none transition-all ${
            item.isPacked
              ? 'bg-slate-900/20 border-slate-900 text-slate-500'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700/60 text-slate-200'
          } ${updatingId === item._id ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={item.isPacked}
              readOnly
              className="w-4 h-4 rounded border-slate-700 bg-slate-950/80 text-indigo-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
            />
            <span className={`text-sm ${item.isPacked ? 'line-through text-slate-500' : 'text-slate-200'}`}>
              {item.item}
            </span>
          </div>

          <span
            className={`font-mono text-[9px] uppercase border px-2 py-0.5 rounded tracking-widest shrink-0 ${getBadgeStyle(
              item.category
            )}`}
          >
            {item.category}
          </span>
        </div>
      ))}
    </div>
  );
}
