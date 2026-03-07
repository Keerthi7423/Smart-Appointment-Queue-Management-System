"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import StatsCard from '@/components/StatsCard';
import AdminAppointmentTable from '@/components/AdminAppointmentTable';
import { getToken } from '@/utils/auth';
import { Users, Timer, CheckCircle, XCircle, LayoutDashboard, Loader2, RefreshCcw } from 'lucide-react';

export default function AdminDashboard() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [appointments, setAppointments] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        confirmed: 0,
        cancelled: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        const token = getToken();
        if (!token) {
            router.push('/login');
        } else {
            setIsAuthenticated(true);
            fetchData(token);
        }
    }, [router]);

    const fetchData = async (token) => {
        try {
            setIsRefreshing(true);
            const res = await fetch('/api/admin/appointments', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) throw new Error('Failed to fetch appointments');

            const result = await res.json();
            const data = result.data || [];
            setAppointments(data);

            // Calculate stats locally
            const total = data.length;
            const pending = data.filter(a => a.status === 'waiting' || a.status === 'pending').length;
            const confirmed = data.filter(a => a.status === 'serving' || a.status === 'confirmed').length;
            const cancelled = data.filter(a => a.status === 'cancelled').length;

            setStats({ total, pending, confirmed, cancelled });
        } catch (err) {
            console.error('Admin API Error:', err);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleUpdateStatus = async (appointmentId, newStatus) => {
        try {
            const token = getToken();
            const res = await fetch(`/api/admin/appointments/${appointmentId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!res.ok) throw new Error('Update failed');

            // Optimistic update or just re-fetch
            fetchData(token);
        } catch (err) {
            alert('Failed to update status: ' + err.message);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex justify-center items-center">
                <Loader2 className="animate-spin text-emerald-500" size={48} />
            </div>
        );
    }

    const statsItems = [
        { title: 'Total Appointments', value: stats.total, icon: Users, color: 'bg-blue-500/20 text-blue-400' },
        { title: 'Pending Waiting', value: stats.pending, icon: Timer, color: 'bg-amber-500/20 text-amber-400' },
        { title: 'Confirmed Serving', value: stats.confirmed, icon: CheckCircle, color: 'bg-emerald-500/20 text-emerald-400' },
        { title: 'Cancelled Total', value: stats.cancelled, icon: XCircle, color: 'bg-rose-500/20 text-rose-400' },
    ];

    return (
        <div className="min-h-screen bg-[#0f172a] text-gray-100 p-6 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">

                <Navbar />

                <div className="pt-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                        <div>
                            <div className="flex items-center space-x-3 mb-1">
                                <div className="p-2 bg-indigo-500/20 rounded-lg">
                                    <LayoutDashboard size={20} className="text-indigo-400" />
                                </div>
                                <h1 className="text-3xl font-bold text-white tracking-tight">Admin Dashboard</h1>
                            </div>
                            <p className="text-gray-400">Total system overview and real-time appointment management.</p>
                        </div>

                        <button
                            onClick={() => fetchData(getToken())}
                            disabled={isRefreshing}
                            className="flex items-center space-x-2 px-6 py-3 bg-[#1e293b] border border-gray-700 rounded-xl font-semibold hover:border-indigo-500 transition-all active:scale-95 disabled:opacity-50 shadow-lg"
                        >
                            <RefreshCcw size={18} className={isRefreshing ? 'animate-spin' : ''} />
                            <span>Refresh Data</span>
                        </button>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                        {statsItems.map((item, idx) => (
                            <StatsCard
                                key={idx}
                                title={item.title}
                                value={item.value}
                                icon={item.icon}
                                color={item.color}
                                delay={idx * 0.1}
                            />
                        ))}
                    </div>

                    {/* Management Section */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-white">Manage Appointments</h2>
                            <div className="text-sm text-gray-500 bg-[#1e293b] px-4 py-1 rounded-full border border-gray-800">
                                Sorted by Latest Bookings
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="bg-[#1e293b] rounded-2xl p-24 flex flex-col items-center justify-center border border-gray-800 shadow-xl">
                                <Loader2 className="animate-spin text-indigo-500 mb-6" size={48} />
                                <p className="text-gray-400 font-medium tracking-widest text-sm">LOADING MASTER RECORDS...</p>
                            </div>
                        ) : (
                            <AdminAppointmentTable
                                appointments={appointments}
                                onUpdateStatus={handleUpdateStatus}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
