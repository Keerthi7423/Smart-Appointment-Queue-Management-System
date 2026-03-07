import React from 'react';
import StatusBadge from './StatusBadge';
import { Calendar, Clock, Hash, MoreVertical } from 'lucide-react';

export default function AppointmentCard({ appointment }) {
    const { _id, date, timeSlot, queueNumber, status } = appointment;
    const displayId = _id.substring(_id.length - 6).toUpperCase();

    return (
        <div className="bg-[#1e293b] rounded-xl p-5 border border-gray-800 shadow-lg hover:border-indigo-500/50 transition-all group">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-2">
                    <div className="bg-indigo-500/10 p-2 rounded-lg">
                        <Hash className="text-indigo-400" size={18} />
                    </div>
                    <span className="text-white font-bold tracking-tight">#{displayId}</span>
                </div>
                <StatusBadge status={status} />
            </div>

            <div className="space-y-3">
                <div className="flex items-center text-gray-400 text-sm">
                    <Calendar size={16} className="mr-3 text-indigo-400/70" />
                    {new Date(date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'long',
                        day: 'numeric'
                    })}
                </div>
                <div className="flex items-center text-gray-400 text-sm">
                    <Clock size={16} className="mr-3 text-indigo-400/70" />
                    {timeSlot} AM
                </div>
                <div className="flex items-center text-gray-400 text-sm">
                    <Hash size={16} className="mr-3 text-indigo-400/70" />
                    Queue Position: <span className="text-indigo-300 font-bold ml-1">{queueNumber}</span>
                </div>
            </div>

            <div className="mt-5 pt-4 border-t border-gray-800 flex justify-between items-center">
                <button className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                    View Details
                </button>
                <button className="text-gray-500 hover:text-white transition-colors">
                    <MoreVertical size={18} />
                </button>
            </div>
        </div>
    );
}
