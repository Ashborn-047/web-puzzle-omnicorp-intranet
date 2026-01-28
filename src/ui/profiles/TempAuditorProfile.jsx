import React from 'react';
import {
    Calendar, CheckSquare, Zap, Mail, DollarSign, LogOut, Activity, BarChart3, Clock
} from 'lucide-react';

const TempAuditorProfile = ({ user, onTabChange, onLogout }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 md:p-6 animate-in fade-in">
            {/* Header Widget */}
            <div className="md:col-span-3 bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="mb-4 md:mb-0">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 tracking-tight">Session: {user.name}</h2>
                    <p className="text-gray-500 text-sm font-medium">{user.dept} | Badge: {user.id}</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100 text-[10px] font-bold uppercase tracking-widest">
                        External Contract
                    </div>
                    <div className="flex items-center gap-2 text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full text-xs">
                        <Activity size={14} /> LINK STABLE
                    </div>
                </div>
            </div>

            {/* 1. CALENDAR / DEADLINES */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2 text-xs uppercase tracking-wider">
                    <Calendar size={18} className="text-blue-600" /> Audit Schedule
                </h3>
                <ul className="space-y-4 text-sm">
                    <li className="flex gap-3 items-start opacity-50">
                        <div className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-[10px] font-bold">15 MAY</div>
                        <div>
                            <p className="font-semibold text-gray-800">Payroll Sync</p>
                            <p className="text-[10px] text-green-600 font-bold uppercase">Closed</p>
                        </div>
                    </li>
                    <li className="flex gap-3 items-start">
                        <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-[10px] font-bold">TODAY</div>
                        <div>
                            <p className="font-semibold text-gray-800">Procurement P-104</p>
                            <p className="text-[10px] text-blue-600 font-bold underline cursor-pointer" onClick={() => onTabChange('finance')}>Active Audit</p>
                        </div>
                    </li>
                </ul>
            </div>

            {/* 2. PENDING REVIEWS */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2 text-xs uppercase tracking-wider">
                    <CheckSquare size={18} className="text-indigo-600" /> Pending Reviews
                </h3>
                <div className="space-y-3">
                    <div className="p-3 bg-gray-50 rounded border border-gray-100">
                        <p className="text-xs font-bold text-gray-700 mb-1">Packet_A_May.doc</p>
                        <p className="text-[10px] text-gray-500 line-clamp-1">Requires reconciliation of 42 line items.</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded border border-gray-100">
                        <p className="text-xs font-bold text-gray-700 mb-1">Packet_B_May.doc</p>
                        <p className="text-[10px] text-gray-500 line-clamp-1">Queued for later review.</p>
                    </div>
                </div>
            </div>

            {/* 3. QUOTA TRACKER */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2 text-xs uppercase tracking-wider">
                    <BarChart3 size={18} className="text-green-600" /> Quota Status
                </h3>
                <div className="flex flex-col items-center justify-center h-24">
                    <div className="relative w-20 h-20">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-gray-100" />
                            <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray={213.6} strokeDashoffset={213.6 * (1 - 0.88)} className="text-blue-600" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                            <span className="text-lg font-bold text-gray-800">88%</span>
                        </div>
                    </div>
                    <p className="mt-3 text-[10px] text-gray-400 font-bold tracking-tight uppercase italic">Nearing Completion</p>
                </div>
            </div>

            {/* 4. SYSTEM ACTIONS */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 md:col-span-3">
                <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2 text-xs uppercase tracking-wider">
                    <Zap size={18} className="text-amber-500" /> Functional Modules
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button onClick={() => onTabChange('messages')} className="p-4 bg-gray-50 hover:bg-blue-50 border border-gray-200 rounded-xl flex flex-col items-center gap-2 transition-all hover:shadow-md active:scale-95 group">
                        <Mail className="text-blue-600 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold text-gray-600 uppercase">OmniMail</span>
                    </button>
                    <button onClick={() => onTabChange('finance')} className="p-4 bg-gray-50 hover:bg-green-50 border border-gray-200 rounded-xl flex flex-col items-center gap-2 transition-all hover:shadow-md active:scale-95 group">
                        <DollarSign className="text-green-600 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold text-gray-600 uppercase">Audit Tool</span>
                    </button>
                    <button onClick={() => onTabChange('directory')} className="p-4 bg-gray-50 hover:bg-indigo-50 border border-gray-200 rounded-xl flex flex-col items-center gap-2 transition-all hover:shadow-md active:scale-95 group">
                        <Activity className="text-indigo-600 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold text-gray-600 uppercase">Directory</span>
                    </button>
                    <button onClick={onLogout} className="p-4 bg-gray-50 hover:bg-red-50 border border-gray-200 rounded-xl flex flex-col items-center gap-2 transition-all hover:shadow-md active:scale-95 group">
                        <LogOut className="text-red-500 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold text-gray-600 uppercase">Exit Portal</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TempAuditorProfile;
