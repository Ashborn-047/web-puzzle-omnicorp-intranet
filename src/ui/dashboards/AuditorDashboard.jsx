import React from 'react';
import {
    Calendar, CheckSquare, AlertCircle, Zap, Mail, DollarSign, LogOut, Activity, BarChart3, Clock
} from 'lucide-react';

const AuditorDashboard = ({ user, onTabChange, onLogout }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 md:p-6 animate-in fade-in">
            {/* Header Widget */}
            <div className="md:col-span-3 bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="mb-4 md:mb-0">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800">Welcome, {user.name}</h2>
                    <p className="text-gray-500 text-sm">{user.dept} | {user.role}</p>
                </div>
                <div className="text-left md:text-right w-full md:w-auto">
                    <div className="flex items-center gap-2 text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full w-fit">
                        <Activity size={16} /> SYSTEM ONLINE
                    </div>
                </div>
            </div>

            {/* 1. CALENDAR */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <Calendar size={18} /> Calendar
                </h3>
                <ul className="space-y-3 text-sm">
                    <li className="flex gap-3 items-start">
                        <div className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-xs font-bold whitespace-nowrap">MAY 15</div>
                        <div>
                            <p className="font-medium text-gray-400">Quarterly Payroll Audit</p>
                            <p className="text-[10px] text-green-600 font-bold uppercase">Completed</p>
                        </div>
                    </li>
                    <li className="flex gap-3 items-start">
                        <div className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-xs font-bold whitespace-nowrap">MAY 18</div>
                        <div>
                            <p className="font-medium text-gray-400">Travel Expense Review</p>
                            <p className="text-[10px] text-green-600 font-bold uppercase">Completed</p>
                        </div>
                    </li>
                    <li className="flex gap-3 items-start">
                        <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold whitespace-nowrap">TODAY</div>
                        <div>
                            <p className="font-medium">Procurement Review</p>
                            <p className="text-[10px] text-blue-600 font-bold underline cursor-pointer">PENDING</p>
                        </div>
                    </li>
                </ul>
            </div>

            {/* 2. TASKS */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <CheckSquare size={18} /> Tasks
                </h3>
                <ul className="space-y-3 text-sm">
                    <li className="flex items-center gap-2 text-gray-400 line-through">
                        <CheckSquare size={14} /> <span>Submit Q2 travel summary</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-400 line-through">
                        <CheckSquare size={14} /> <span>Verify vendor credentials</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                        <div className="w-3.5 h-3.5 border border-gray-400 rounded-sm mr-0.5"></div>
                        <span className="font-medium">Finalize procurement batch #P-104</span>
                    </li>
                </ul>
            </div>

            {/* 3. PERFORMANCE / ALERTS */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <BarChart3 size={18} /> Audit Quota
                </h3>
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-500 uppercase font-bold tracking-tighter">Current Progress</span>
                            <span className="text-blue-600 font-bold">88%</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-full w-[88%]"></div>
                        </div>
                    </div>
                    <div className="text-[10px] text-gray-400 flex items-start gap-2 italic">
                        <Clock size={12} className="shrink-0 mt-0.5" />
                        <span>Next session deadline: Friday, 17:00</span>
                    </div>
                </div>
            </div>

            {/* 4. QUICK ACTIONS */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 md:col-span-3">
                <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <Zap size={18} /> Quick Actions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button
                        onClick={() => onTabChange('messages')}
                        className="p-4 bg-gray-50 hover:bg-blue-50 border border-gray-200 rounded-lg flex items-center gap-3 transition-colors group"
                    >
                        <Mail size={24} className="text-blue-600 group-hover:scale-110 transition-transform" />
                        <div className="text-left">
                            <span className="block text-sm font-bold">Inbox</span>
                            <span className="text-[10px] text-gray-500 uppercase">View correspondence</span>
                        </div>
                    </button>
                    <button
                        onClick={() => onTabChange('finance')}
                        className="p-4 bg-gray-50 hover:bg-green-50 border border-gray-200 rounded-lg flex items-center gap-3 transition-colors group"
                    >
                        <DollarSign size={24} className="text-green-600 group-hover:scale-110 transition-transform" />
                        <div className="text-left">
                            <span className="block text-sm font-bold">Finance Audit</span>
                            <span className="text-[10px] text-gray-500 uppercase">Active processing</span>
                        </div>
                    </button>
                    <button
                        onClick={onLogout}
                        className="p-4 bg-gray-50 hover:bg-red-50 border border-gray-200 rounded-lg flex items-center gap-3 transition-colors group"
                    >
                        <LogOut size={24} className="text-red-600 group-hover:scale-110 transition-transform" />
                        <div className="text-left">
                            <span className="block text-sm font-bold">Logout</span>
                            <span className="text-[10px] text-gray-500 uppercase">End session</span>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuditorDashboard;
