import React from 'react';
import {
    Users, UserPlus, Heart, Zap, Mail, LogOut, Activity, PieChart, Briefcase, Search
} from 'lucide-react';

const HRDashboard = ({ user, onTabChange, onLogout }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 md:p-6 animate-in fade-in">
            {/* Workforce Header */}
            <div className="md:col-span-3 bg-white p-6 rounded-lg shadow-sm border border-indigo-100 flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="mb-4 md:mb-0">
                    <h2 className="text-xl md:text-2xl font-bold text-indigo-900 leading-tight">Human Resources Department</h2>
                    <p className="text-indigo-400 text-sm font-medium">OMNICORP // {user.name} // WORKFORCE MANAGER</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Active Staff</p>
                        <p className="text-2xl font-black text-indigo-600">1,492</p>
                    </div>
                    <div className="w-px h-10 bg-indigo-100"></div>
                    <div className="text-right">
                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Open Roles</p>
                        <p className="text-2xl font-black text-indigo-400">12</p>
                    </div>
                </div>
            </div>

            {/* 1. EMPLOYEE SEARCH (Disabled) */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2 uppercase tracking-wider text-[10px]">
                    <Search size={16} className="text-indigo-500" /> Personnel Lookup
                </h3>
                <div className="relative mb-4">
                    <input
                        type="text"
                        placeholder="Search by name, ID, or dept..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        disabled
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                </div>
                <div className="space-y-2">
                    <p className="text-[10px] text-gray-400 italic">Recent Searches:</p>
                    <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-[10px]">Sarah Kone</span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-[10px]">David Bowman</span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-[10px]">Dept: IT Ops</span>
                    </div>
                </div>
            </div>

            {/* 2. RECRUITMENT PIPELINE */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2 uppercase tracking-wider text-[10px]">
                    <Briefcase size={16} className="text-indigo-500" /> Hiring Status
                </h3>
                <ul className="space-y-3">
                    <li className="flex justify-between items-center p-2 hover:bg-indigo-50 rounded transition-colors border border-transparent hover:border-indigo-100">
                        <div>
                            <p className="text-xs font-bold text-gray-800">Security Analyst L3</p>
                            <p className="text-[10px] text-gray-500">Interview Stage</p>
                        </div>
                        <div className="px-2 py-1 bg-indigo-100 text-indigo-700 font-bold text-[10px] rounded uppercase">Active</div>
                    </li>
                    <li className="flex justify-between items-center p-2 hover:bg-neutral-50 rounded transition-colors border border-transparent">
                        <div>
                            <p className="text-xs font-bold text-gray-400">Junior Auditor (Contract)</p>
                            <p className="text-[10px] text-gray-400">Position Filled (Temp)</p>
                        </div>
                        <div className="px-2 py-1 bg-gray-100 text-gray-400 font-bold text-[10px] rounded uppercase">Closed</div>
                    </li>
                </ul>
            </div>

            {/* 3. WORKFORCE COMPOSITION */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2 uppercase tracking-wider text-[10px]">
                    <PieChart size={16} className="text-indigo-500" /> Unit Overview
                </h3>
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full border-4 border-indigo-500 flex items-center justify-center text-[10px] font-bold">42%</div>
                        <div>
                            <p className="text-xs font-bold text-gray-800 uppercase">Operations</p>
                            <p className="text-[10px] text-gray-500 tracking-tight">Main manufacturing & logistics</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full border-4 border-amber-400 flex items-center justify-center text-[10px] font-bold">18%</div>
                        <div>
                            <p className="text-xs font-bold text-gray-800 uppercase">Administration</p>
                            <p className="text-[10px] text-gray-500 tracking-tight">HR, Finance, Legal, Executive</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. HR ACTIONS */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 md:col-span-3">
                <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2 uppercase tracking-wider text-[10px]">
                    <Zap size={16} className="text-indigo-500" /> HR Management Portal
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <button className="p-4 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg flex flex-col items-center gap-2 transition-colors cursor-not-allowed opacity-50">
                        <UserPlus size={24} className="text-indigo-600" />
                        <span className="text-[10px] font-bold text-gray-700 uppercase">Onboard</span>
                    </button>
                    <button className="p-4 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg flex flex-col items-center gap-2 transition-colors cursor-not-allowed opacity-50">
                        <Heart size={24} className="text-pink-500" />
                        <span className="text-[10px] font-bold text-gray-700 uppercase">Benefits</span>
                    </button>
                    <button onClick={() => onTabChange('messages')} className="p-4 bg-indigo-50 hover:bg-blue-50 border border-indigo-200 rounded-lg flex flex-col items-center gap-2 transition-colors group">
                        <Mail size={24} className="text-blue-600 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold text-gray-700 uppercase">Inbox</span>
                    </button>
                    <button onClick={onLogout} className="p-4 bg-indigo-50 hover:bg-red-50 border border-indigo-200 rounded-lg flex flex-col items-center gap-2 transition-colors group">
                        <LogOut size={24} className="text-red-500 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold text-gray-700 uppercase">Terminate Session</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HRDashboard;
