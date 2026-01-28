import React from 'react';
import {
    Calendar, CheckSquare, Zap, Mail, DollarSign, LogOut, Activity, BarChart3, Clock, PieChart, ShieldCheck, FileText
} from 'lucide-react';

const SarahKoneProfile = ({ user, onTabChange, onLogout }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 md:p-6 animate-in fade-in text-gray-800">
            {/* Executive Header */}
            <div className="md:col-span-3 bg-white p-8 rounded-2xl shadow-sm border border-indigo-100 flex flex-col md:flex-row justify-between items-start md:items-center relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-indigo-600 rounded-t-2xl"></div>
                <div className="mb-4 md:mb-0">
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{user.name}</h2>
                    <p className="text-indigo-600 text-sm font-bold uppercase tracking-widest">{user.role} // {user.dept} // L2</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Authorization Status</p>
                        <div className="flex items-center gap-2 text-indigo-700 font-bold bg-indigo-50 px-4 py-1.5 rounded-full text-xs border border-indigo-100 shadow-sm">
                            <ShieldCheck size={16} /> VERIFIED SESSION
                        </div>
                    </div>
                </div>
            </div>

            {/* 1. AUDIT RISK TRENDS */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                <h3 className="font-bold text-gray-700 mb-6 flex items-center gap-2 text-xs uppercase tracking-wider">
                    <PieChart size={18} className="text-indigo-600" /> Risk Correlation
                </h3>
                <div className="flex-1 flex flex-col justify-center space-y-6">
                    <div>
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter mb-2">
                            <span className="text-gray-400">Policy Compliance</span>
                            <span className="text-indigo-600">92%</span>
                        </div>
                        <div className="w-full bg-gray-50 h-2.5 rounded-full overflow-hidden border border-gray-100">
                            <div className="bg-indigo-500 h-full w-[92%]"></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter mb-2">
                            <span className="text-gray-400">Variance Reports</span>
                            <span className="text-amber-600">HIGH</span>
                        </div>
                        <div className="w-full bg-gray-50 h-2.5 rounded-full overflow-hidden border border-gray-100">
                            <div className="bg-amber-400 h-full w-[78%]"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. CHIEF OVERSIGHT */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-700 mb-6 flex items-center gap-2 text-xs uppercase tracking-wider">
                    <FileText size={18} className="text-blue-600" /> Pending Approvals
                </h3>
                <div className="space-y-4">
                    <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 group hover:bg-indigo-50 transition-colors cursor-pointer">
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-xs font-bold text-indigo-900">Q2 Logistics Reconciliation</p>
                            <span className="text-[8px] bg-indigo-200 text-indigo-900 px-1.5 py-0.5 rounded font-bold uppercase">Priority</span>
                        </div>
                        <p className="text-[10px] text-indigo-700 leading-relaxed">System flags in Sector 7 expenditures require manual override.</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 opacity-60">
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-xs font-bold text-gray-800">External Audit Handover</p>
                        </div>
                        <p className="text-[10px] text-gray-500">Wait for Audit-04 to finish Group C packets.</p>
                    </div>
                </div>
            </div>

            {/* 3. PERFORMANCE QUOTA */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-700 mb-6 flex items-center gap-2 text-xs uppercase tracking-wider">
                    <BarChart3 size={18} className="text-emerald-600" /> Team Efficiency
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex flex-col items-center">
                        <span className="text-[10px] font-bold text-emerald-900/40 uppercase mb-1 tracking-tighter">Throughput</span>
                        <span className="text-2xl font-bold text-emerald-700">104%</span>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex flex-col items-center">
                        <span className="text-[10px] font-bold text-blue-900/40 uppercase mb-1 tracking-tighter">Accuracy</span>
                        <span className="text-2xl font-bold text-blue-700">99.8%</span>
                    </div>
                </div>
                <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center">
                    <p className="text-[10px] text-gray-400 font-medium italic">"All findings must be sanitized before final Board presentation."</p>
                </div>
            </div>

            {/* 4. EXECUTIVE ACTIONS */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 md:col-span-3">
                <h3 className="font-bold text-gray-700 mb-6 flex items-center gap-2 text-xs uppercase tracking-wider">
                    <Zap size={18} className="text-indigo-600" /> Management Interface
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    <button onClick={() => onTabChange('finance')} className="p-6 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-2xl flex flex-col items-center gap-4 transition-all hover:scale-105 group shadow-sm">
                        <DollarSign size={32} className="text-indigo-600 group-hover:scale-110 transition-transform" />
                        <div className="text-center">
                            <span className="block text-sm font-bold text-indigo-900">Finance Control</span>
                            <span className="text-[9px] text-indigo-500 uppercase font-bold">Ledger Override</span>
                        </div>
                    </button>
                    <button onClick={() => onTabChange('messages')} className="p-6 bg-white hover:bg-gray-50 border border-gray-100 rounded-2xl flex flex-col items-center gap-4 transition-all hover:scale-105 group shadow-sm">
                        <Mail size={32} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                        <div className="text-center">
                            <span className="block text-sm font-bold text-gray-800">OmniMail</span>
                            <span className="text-[9px] text-gray-500 uppercase font-bold">Encrypted Comms</span>
                        </div>
                    </button>
                    <button onClick={() => onTabChange('directory')} className="p-6 bg-white hover:bg-gray-50 border border-gray-100 rounded-2xl flex flex-col items-center gap-4 transition-all hover:scale-105 group shadow-sm">
                        <FileText size={32} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                        <div className="text-center">
                            <span className="block text-sm font-bold text-gray-800">Directory</span>
                            <span className="text-[9px] text-gray-500 uppercase font-bold">Personnel Mgmt</span>
                        </div>
                    </button>
                    <button onClick={onLogout} className="p-6 bg-white hover:bg-red-50 border border-gray-100 rounded-2xl flex flex-col items-center gap-4 transition-all hover:scale-105 group shadow-sm">
                        <LogOut size={32} className="text-red-400 group-hover:scale-110 transition-transform" />
                        <div className="text-center">
                            <span className="block text-sm font-bold text-gray-800">Logout</span>
                            <span className="text-[9px] text-gray-500 uppercase font-bold">System Exit</span>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SarahKoneProfile;
