"use client";

import { motion } from 'framer-motion';

export default function StatsCard({ title, value, icon: Icon, color, delay = 0 }) {
    // Entrance animation for Framer motion
    const variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay } }
    };

    return (
        <motion.div
            variants={variants}
            initial="hidden"
            animate="visible"
            className="bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-700/50 flex items-center justify-between"
        >
            <div className="flex flex-col space-y-2">
                <span className="text-gray-400 text-sm font-medium">{title}</span>
                <span className="text-4xl font-bold text-white">{value}</span>
            </div>

            <div className={`p-4 rounded-xl flex items-center justify-center ${color}`}>
                <Icon size={24} className="text-white" />
            </div>
        </motion.div>
    );
}
