"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { getToken } from '@/utils/auth';
import { Calendar as CalendarIcon, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AppointmentsPage() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Booking State
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedSlot, setSelectedSlot] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const timeSlots = ['09:00', '09:30', '10:00', '10:30', '11:00'];

    useEffect(() => {
        const token = getToken();
        if (!token) {
            router.push('/login');
        } else {
            setIsAuthenticated(true);
        }
    }, [router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (!selectedDate || !selectedSlot) {
            setMessage({ type: 'error', text: 'Please select both a date and a time slot.' });
            return;
        }

        setIsLoading(true);

        try {
            const token = getToken();
            const res = await fetch('/api/appointments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    date: selectedDate,
                    timeSlot: selectedSlot
                })
            });

            const data = await res.json();

            if (!res.ok) {
                // Check if JWT token logic is causing 401s, etc.
                throw new Error(data.message || 'Failed to book appointment');
            }

            setMessage({ type: 'success', text: 'Appointment successfully booked!' });
            setSelectedDate('');
            setSelectedSlot('');

            // Clear success message after 5 seconds
            setTimeout(() => {
                setMessage({ type: '', text: '' });
            }, 5000);
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setIsLoading(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f172a] text-gray-100 p-6 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                <Navbar />

                <div className="pt-6">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-white tracking-tight">Book Appointment</h1>
                        <p className="text-gray-400 mt-2">Select your preferred date and time for your upcoming visit.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Selector Area */}
                        <div className="lg:col-span-8 flex flex-col space-y-6">

                            {/* Date Selector */}
                            <div className="bg-[#1e293b] rounded-xl p-6 shadow-xl border border-gray-800">
                                <h2 className="text-xl font-semibold text-white flex items-center mb-4">
                                    <CalendarIcon className="mr-3 text-indigo-400" size={24} />
                                    Select Date
                                </h2>
                                <div>
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]} // Prevents picking past dates
                                        className="w-full sm:w-1/2 px-4 py-3 bg-[#0f172a] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-inner custom-calendar-input"
                                    />
                                </div>
                            </div>

                            {/* Time Slots Grid */}
                            <div className="bg-[#1e293b] rounded-xl p-6 shadow-xl border border-gray-800">
                                <h2 className="text-xl font-semibold text-white flex items-center mb-4">
                                    <Clock className="mr-3 text-indigo-400" size={24} />
                                    Available Time Slots
                                </h2>

                                {selectedDate ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                                        {timeSlots.map((slot, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setSelectedSlot(slot)}
                                                className={`
                                                    py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 transform hover:-translate-y-1 shadow-md
                                                    ${selectedSlot === slot
                                                        ? 'bg-indigo-500 text-white border border-indigo-400 shadow-indigo-500/30'
                                                        : 'bg-[#0f172a] text-gray-300 border border-gray-700 hover:border-indigo-400 hover:text-white'}
                                                `}
                                            >
                                                {slot}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-8 text-center border-2 border-dashed border-gray-700 rounded-xl bg-[#0f172a]/50">
                                        <p className="text-gray-400 text-sm">Please select a date first to view available time slots.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Booking Summary Form Sidebar */}
                        <div className="lg:col-span-4">
                            <div className="bg-[#1e293b] rounded-xl p-6 shadow-xl border border-gray-800 sticky top-6">
                                <h3 className="text-xl font-bold text-white mb-6 border-b border-gray-700 pb-4">Booking Summary</h3>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="bg-[#0f172a] rounded-lg p-4 border border-gray-700">
                                            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Date</p>
                                            <p className="text-white font-medium">
                                                {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Not selected'}
                                            </p>
                                        </div>

                                        <div className="bg-[#0f172a] rounded-lg p-4 border border-gray-700">
                                            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Time</p>
                                            <p className="text-white font-medium">
                                                {selectedSlot ? `${selectedSlot} AM` : 'Not selected'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Feedback Messages */}
                                    {message.text && (
                                        <div className={`p-4 rounded-lg flex items-start space-x-3 ${message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'}`}>
                                            {message.type === 'success' ? <CheckCircle2 size={20} className="mt-0.5" /> : <AlertCircle size={20} className="mt-0.5" />}
                                            <p className="text-sm font-medium leading-relaxed">{message.text}</p>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isLoading || !selectedDate || !selectedSlot}
                                        className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-indigo-500/20 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1e293b] focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                                    >
                                        {isLoading ? 'Processing...' : 'Book Appointment'}
                                    </button>
                                </form>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-calendar-input::-webkit-calendar-picker-indicator {
                    filter: invert(1);
                    opacity: 0.6;
                    cursor: pointer;
                    transition: opacity 0.2s;
                }
                .custom-calendar-input::-webkit-calendar-picker-indicator:hover {
                    opacity: 1;
                }
            `}} />
        </div>
    );
}
