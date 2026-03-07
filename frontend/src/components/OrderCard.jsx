"use client";

import { motion } from 'framer-motion';
import { User } from 'lucide-react';

export default function OrderCard({ order, delay = 0 }) {
    const { id, user, room, items, total, status } = order;

    // Set colors based on status
    const statusColors = {
        'New': 'bg-blue-100 text-blue-700',
        'On progress': 'bg-amber-100 text-amber-700',
        'Ready to serve': 'bg-emerald-100 text-emerald-700',
        'Cancelled': 'bg-rose-100 text-rose-700',
    };

    const variants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.4, delay } },
    };

    return (
        <motion.div
            variants={variants}
            initial="hidden"
            animate="visible"
            whileHover={{ y: -5, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between"
        >
            {/* Header: User & Order ID */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border border-gray-300">
                        {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            <User className="text-gray-500 w-6 h-6" />
                        )}
                    </div>
                    <div>
                        <h4 className="text-gray-900 font-semibold">{user.name}</h4>
                        <span className="text-sm text-gray-500">Room {room}</span>
                    </div>
                </div>
                <div className="text-right flex flex-col items-end space-y-1">
                    <span className="text-xs font-bold text-gray-400">Order #{id}</span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[status] || 'bg-gray-100 text-gray-700'}`}>
                        {status}
                    </span>
                </div>
            </div>

            <hr className="border-gray-50 mb-4" />

            {/* Items List */}
            <div className="flex-1 mb-4">
                <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Order Items</h5>
                <ul className="space-y-1.5 min-h-[60px]">
                    {items.map((item, idx) => (
                        <li key={idx} className="flex justify-between text-sm text-gray-700">
                            <span className="font-medium">{item.qty}x {item.name}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Footer: Total & Button */}
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                <div>
                    <span className="block text-xs text-gray-500">Total Payment</span>
                    <span className="text-lg font-bold text-gray-900">${total.toFixed(2)}</span>
                </div>
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1">
                    Order details
                </button>
            </div>
        </motion.div>
    );
}
