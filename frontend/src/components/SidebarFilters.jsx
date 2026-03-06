"use client";

import { useState } from 'react';
import { LayoutGrid, List } from 'lucide-react';

export default function SidebarFilters() {
    const [activeStatus, setActiveStatus] = useState('New');
    const [activeFilter, setActiveFilter] = useState('Today');
    const [isCardView, setIsCardView] = useState(true);

    const orderStatuses = ['New', 'On progress', 'Ready to serve', 'Cancelled'];
    const filters = ['Recent orders', 'Last hour', 'Today', 'Custom date'];

    return (
        <aside className="w-64 bg-gray-900 rounded-2xl p-6 flex flex-col space-y-8 shadow-lg text-gray-300">
            {/* View Toggle */}
            <div className="flex items-center justify-between mt-2">
                <span className="text-sm font-semibold tracking-wide uppercase text-gray-500">View Mode</span>
                <div className="flex bg-gray-800 rounded-lg p-1 space-x-1">
                    <button
                        onClick={() => setIsCardView(true)}
                        className={`p-1.5 rounded-md transition-all ${isCardView ? 'bg-indigo-500 text-white shadow' : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        <LayoutGrid size={16} />
                    </button>
                    <button
                        onClick={() => setIsCardView(false)}
                        className={`p-1.5 rounded-md transition-all ${!isCardView ? 'bg-indigo-500 text-white shadow' : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        <List size={16} />
                    </button>
                </div>
            </div>

            {/* Order Status */}
            <div>
                <h3 className="text-sm font-semibold tracking-wide uppercase text-gray-500 mb-4">Order Status</h3>
                <ul className="space-y-3">
                    {orderStatuses.map((status) => (
                        <li key={status}>
                            <label className="flex items-center space-x-3 cursor-pointer group">
                                <input
                                    type="radio"
                                    name="orderStatus"
                                    checked={activeStatus === status}
                                    onChange={() => setActiveStatus(status)}
                                    className="w-4 h-4 text-indigo-500 bg-gray-800 border-gray-600 focus:ring-indigo-500 focus:ring-offset-gray-900"
                                />
                                <span className={`text-sm transition-colors ${activeStatus === status ? 'text-white font-medium' : 'text-gray-400 group-hover:text-gray-300'}`}>
                                    {status}
                                </span>
                            </label>
                        </li>
                    ))}
                </ul>
            </div>

            <hr className="border-gray-800" />

            {/* Filter By */}
            <div>
                <h3 className="text-sm font-semibold tracking-wide uppercase text-gray-500 mb-4">Filter By</h3>
                <ul className="space-y-3">
                    {filters.map((filter) => (
                        <li key={filter}>
                            <label className="flex items-center space-x-3 cursor-pointer group">
                                <input
                                    type="radio"
                                    name="filterBy"
                                    checked={activeFilter === filter}
                                    onChange={() => setActiveFilter(filter)}
                                    className="w-4 h-4 text-indigo-500 bg-gray-800 border-gray-600 focus:ring-indigo-500 focus:ring-offset-gray-900"
                                />
                                <span className={`text-sm transition-colors ${activeFilter === filter ? 'text-white font-medium' : 'text-gray-400 group-hover:text-gray-300'}`}>
                                    {filter}
                                </span>
                            </label>
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    );
}
