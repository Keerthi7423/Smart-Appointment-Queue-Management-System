import React from 'react';

export default function StatusBadge({ status }) {
    const statusConfig = {
        pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',
        waiting: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30', // Map waiting to yellow
        confirmed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        serving: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', // Map serving to green
        cancelled: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
        completed: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    };

    const normalizedStatus = status?.toLowerCase() || 'pending';
    const colorClass = statusConfig[normalizedStatus] || statusConfig.pending;

    return (
        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${colorClass} capitalize tracking-wider`}>
            {status === 'waiting' ? 'Pending' : status === 'serving' ? 'Confirmed' : status}
        </span>
    );
}
