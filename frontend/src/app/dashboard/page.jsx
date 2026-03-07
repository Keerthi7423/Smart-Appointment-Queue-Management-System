"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import StatsCard from '@/components/StatsCard';
import AppointmentTable from '@/components/AppointmentTable';
import { getToken } from '@/utils/auth';
import { CalendarCheck2, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function Dashboard() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [appointments, setAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        upcoming: 0,
        completed: 0,
        cancelled: 0
    });

    useEffect(() => {
        const token = getToken();
        if (!token) {
            router.push('/login');
        } else {
            setIsAuthenticated(true);
            fetchAppointments(token);
        }
    }, [router]);

    const fetchAppointments = async (token) => {
        try {
            setIsLoading(true);
            const res = await fetch('/api/appointments/user', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) throw new Error('Failed to fetch appointments');

            const result = await res.json();
            const data = result.data || result.appointments || [];

            setAppointments(data);

            // Calculate stats
            const upcoming = data.filter(a => a.status === 'waiting' || a.status === 'pending' || a.status === 'serving').length;
            const completed = data.filter(a => a.status === 'completed').length;
            const cancelled = data.filter(a => a.status === 'cancelled').length;

            setStats({ upcoming, completed, cancelled });
        } catch (err) {
            console.error('API Error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex justify-center items-center">
                <Loader2 className="animate-spin text-emerald-500" size={48} />
            </div>
        );
    }

    const statsConfig = [
        {
            title: 'Upcoming Appointments',
            value: stats.upcoming,
            icon: CalendarCheck2,
            color: 'bg-indigo-500/20 text-indigo-400'
        },
        {
            title: 'Completed Appointments',
            value: stats.completed,
            icon: CheckCircle,
            color: 'bg-emerald-500/20 text-emerald-400'
        },
        {
            title: 'Cancelled Appointments',
            value: stats.cancelled,
            icon: XCircle,
            color: 'bg-rose-500/20 text-rose-400'
        },
    ];

    return (
        <div className="min-h-screen bg-[#0f172a] text-gray-100 p-6 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">

                <Navbar />

                <div className="pt-4">
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-white tracking-tight">My Appointments</h1>
                            <p className="text-gray-400 mt-2">Manage your bookings and track your queue status in real-time.</p>
                        </div>
                        <button
                            onClick={() => router.push('/appointments')}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                        >
                            Book New
                        </button>
                    </div>

                    {/* Stats Rows */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        {statsConfig.map((stat, idx) => (
                            <StatsCard
                                key={idx}
                                title={stat.title}
                                value={stat.value}
                                icon={stat.icon}
                                color={stat.color}
                                delay={idx * 0.1}
                            />
                        ))}
                    </div>

                    {/* Appointment Lists */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white flex items-center">
                                <AlertCircle className="mr-2 text-indigo-400" size={20} />
                                Recent Bookings
                            </h2>
                            <span className="text-gray-500 text-sm font-medium">
                                {appointments.length} total bookings found
                            </span>
                        </div>

                        {isLoading ? (
                            <div className="bg-[#1e293b] rounded-xl p-20 flex flex-col items-center justify-center border border-gray-800 shadow-xl">
                                <Loader2 className="animate-spin text-indigo-500 mb-4" size={40} />
                                <p className="text-gray-400 font-medium tracking-wide">Retrieving your data...</p>
                            </div>
                        ) : (
                            <AppointmentTable appointments={appointments} />
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
