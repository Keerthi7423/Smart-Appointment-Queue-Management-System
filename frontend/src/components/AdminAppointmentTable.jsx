import React, { useState } from 'react';
import StatusBadge from './StatusBadge';
import { Calendar, Clock, Hash, CheckCircle, XCircle, ChevronRight, User } from 'lucide-react';

export default function AdminAppointmentTable({ appointments, onUpdateStatus }) {
    const [confirmAction, setConfirmAction] = useState({ show: false, id: null, status: null });

    const handleActionClick = (id, status) => {
        setConfirmAction({ show: true, id, status });
    };

    const executeAction = () => {
        onUpdateStatus(confirmAction.id, confirmAction.status);
        setConfirmAction({ show: false, id: null, status: null });
    };

    if (!appointments || appointments.length === 0) {
        return (
            <div className="bg-[#1e293b] rounded-xl p-12 text-center border border-gray-800">
                <h3 className="text-xl font-semibold text-white">No appointments found</h3>
                <p className="text-gray-400 mt-2 text-sm">There are no bookings in the system at this time.</p>
            </div>
        );
    }

    return (
        <div className="bg-[#1e293b] rounded-xl shadow-xl border border-gray-800 overflow-hidden">

            {/* Confirmation Modal */}
            {confirmAction.show && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#1e293b] border border-gray-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
                        <h3 className="text-xl font-bold text-white mb-2">Confirm Action</h3>
                        <p className="text-gray-400 text-sm mb-6">Are you sure you want to change this appointment status to <span className="text-indigo-400 font-bold uppercase">{confirmAction.status}</span>?</p>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setConfirmAction({ show: false })}
                                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm font-semibold transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={executeAction}
                                className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white text-sm font-semibold transition-colors"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#0f172a]/50 text-gray-400 text-xs uppercase tracking-widest font-bold border-b border-gray-800">
                            <th className="px-6 py-5">ID & User</th>
                            <th className="px-6 py-5">Date & Time</th>
                            <th className="px-6 py-5">Queue</th>
                            <th className="px-6 py-5">Status</th>
                            <th className="px-6 py-5 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50">
                        {appointments.map((apt) => (
                            <tr key={apt._id} className="hover:bg-white/5 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-indigo-400 font-mono text-xs mb-1 uppercase tracking-tighter">
                                            #{apt._id.substring(apt._id.length - 6)}
                                        </span>
                                        <div className="flex items-center text-white font-medium">
                                            <User size={14} className="mr-2 text-gray-500" />
                                            {apt.userId?.name || 'Unknown User'}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-gray-200 text-sm flex flex-col space-y-1">
                                        <span className="flex items-center">
                                            <Calendar size={12} className="mr-2 text-indigo-400/50" />
                                            {new Date(apt.date).toLocaleDateString()}
                                        </span>
                                        <span className="flex items-center text-xs text-gray-400">
                                            <Clock size={12} className="mr-2 text-indigo-400/50" />
                                            {apt.timeSlot}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="inline-flex items-center px-2 py-1 rounded bg-[#0f172a] text-indigo-300 border border-indigo-500/10 text-xs font-bold">
                                        <Hash size={10} className="mr-1" />
                                        {apt.queueNumber}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <StatusBadge status={apt.status} />
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end space-x-2">
                                        {apt.status === 'waiting' && (
                                            <button
                                                onClick={() => handleActionClick(apt._id, 'serving')}
                                                className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-lg transition-colors border border-emerald-500/20 shadow-sm shadow-emerald-500/5"
                                                title="Confirm Appointment"
                                            >
                                                <CheckCircle size={18} />
                                            </button>
                                        )}
                                        {apt.status === 'serving' && (
                                            <button
                                                onClick={() => handleActionClick(apt._id, 'completed')}
                                                className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-lg transition-colors border border-blue-500/20 shadow-sm shadow-blue-500/5"
                                                title="Mark Completed"
                                            >
                                                <ChevronRight size={18} />
                                            </button>
                                        )}
                                        {apt.status !== 'completed' && apt.status !== 'cancelled' && (
                                            <button
                                                onClick={() => handleActionClick(apt._id, 'cancelled')}
                                                className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-lg transition-colors border border-rose-500/20 shadow-sm shadow-rose-500/5"
                                                title="Cancel Appointment"
                                            >
                                                <XCircle size={18} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
