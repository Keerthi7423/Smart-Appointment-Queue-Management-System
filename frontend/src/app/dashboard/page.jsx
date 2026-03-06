"use client";

import Navbar from '@/components/Navbar';
import StatsCard from '@/components/StatsCard';
import SidebarFilters from '@/components/SidebarFilters';
import OrderCard from '@/components/OrderCard';
import { FilePlus, Timer, ConciergeBell, XCircle } from 'lucide-react';

export default function Dashboard() {
    // Mock Data for Dashboard
    const stats = [
        { title: 'New Orders', value: '1,245', icon: FilePlus, color: 'bg-blue-500/20 text-blue-400' },
        { title: 'On Progress', value: '430', icon: Timer, color: 'bg-amber-500/20 text-amber-400' },
        { title: 'Ready to Serve', value: '25', icon: ConciergeBell, color: 'bg-emerald-500/20 text-emerald-400' },
        { title: 'Cancelled Orders', value: '18', icon: XCircle, color: 'bg-rose-500/20 text-rose-400' },
    ];

    const orders = [
        {
            id: '8A92D7',
            user: { name: 'Eleanor Pena', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
            room: '402',
            status: 'New',
            items: [{ qty: 2, name: 'Truffle Pasta' }, { qty: 1, name: 'Caesar Salad' }],
            total: 58.50,
        },
        {
            id: '2B14C9',
            user: { name: 'Arlene McCoy', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026703d' },
            room: '105',
            status: 'On progress',
            items: [{ qty: 1, name: 'Ribeye Steak' }, { qty: 2, name: 'Cocktails' }],
            total: 120.00,
        },
        {
            id: '9D62F1',
            user: { name: 'Wade Warren', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d' },
            room: '210',
            status: 'Ready to serve',
            items: [{ qty: 3, name: 'Vegan Burger' }],
            total: 45.00,
        },
        {
            id: '4C55B3',
            user: { name: 'Jane Cooper', avatar: 'https://i.pravatar.cc/150?u=a04258114e29026702d' },
            room: '304',
            status: 'Cancelled',
            items: [{ qty: 1, name: 'Margherita Pizza' }],
            total: 18.00,
        },
        {
            id: '7E41A2',
            user: { name: 'Cody Fisher', avatar: 'https://i.pravatar.cc/150?u=a048581f4e29026701d' },
            room: '501',
            status: 'New',
            items: [{ qty: 2, name: 'Grilled Salmon' }, { qty: 1, name: 'White Wine' }],
            total: 89.00,
        },
        {
            id: '6F32B8',
            user: { name: 'Robert Fox', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026700d' },
            room: '112',
            status: 'On progress',
            items: [{ qty: 1, name: 'Lobster Bisque' }],
            total: 32.50,
        },
    ];

    return (
        <div className="min-h-screen bg-[#0f172a] text-gray-100 p-6 font-sans">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Top Navbar */}
                <Navbar />

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
                    {stats.map((stat, idx) => (
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

                {/* Main Content Area */}
                <div className="flex flex-col lg:flex-row gap-8 pt-6">

                    {/* Sidebar */}
                    <div className="w-full lg:w-64 flex-shrink-0">
                        <SidebarFilters />
                    </div>

                    {/* Order Cards Grid */}
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold tracking-tight text-white">Order List</h2>
                            <span className="text-gray-400 text-sm">Showing {orders.length} results</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {orders.map((order, idx) => (
                                <OrderCard key={order.id} order={order} delay={idx * 0.1} />
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
