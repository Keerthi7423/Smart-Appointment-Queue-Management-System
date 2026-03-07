import React from 'react';
import StatusBadge from './StatusBadge';
import { Calendar, Clock, Hash } from 'lucide-react';

export default function AppointmentTable({ appointments }) {
    if (!appointments || appointments.length === 0) {
        return (
            <div className="bg-[#1e293b] rounded-xl p-12 text-center border border-gray-800 shadow-xl">
                <div className="flex justify-center mb-4">
                    <div className="p-4 bg-[#0f172a] rounded-full border border-gray-700">
                        <Calendar size={32} className="text-gray-500" />
                    </div>
                </div>
                <h3 className="text-xl font-semibold text-white">No appointments booked yet</h3>
                <p className="text-gray-400 mt-2 max-w-xs mx-auto">
                    When you book an appointment, it will appear here with your queue position and status.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-[#1e293b] rounded-xl shadow-xl border border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#0f172a]/50 text-gray-400 text-xs uppercase tracking-widest font-bold border-b border-gray-800">
                            <th className="px-6 py-5">Appointment ID</th>
                            <th className="px-6 py-5">Date</th>
                            <th className="px-6 py-5">Time Slot</th>
                            <th className="px-6 py-5">Queue Pos</th>
                            <th className="px-6 py-5 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50">
                        {appointments.map((apt) => (
                            <tr key={apt._id} className="hover:bg-white/5 transition-colors group">
                                <td className="px-6 py-4">
                                    <span className="text-indigo-400 font-mono text-sm group-hover:text-indigo-300">
                                        #{apt._id.substring(apt._id.length - 6).toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center text-gray-200">
                                        <Calendar size={14} className="mr-2 text-indigo-400/70" />
                                        {new Date(apt.date).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center text-gray-200">
                                        <Clock size={14} className="mr-2 text-indigo-400/70" />
                                        {apt.timeSlot}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        <div className="px-2.5 py-0.5 rounded-md bg-[#0f172a] text-indigo-300 border border-indigo-500/20 text-xs font-bold flex items-center">
                                            <Hash size={10} className="mr-1" />
                                            {apt.queueNumber}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <StatusBadge status={apt.status} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
