import React from 'react';
import {
    Crown, ShieldAlert, TrendingUp, Zap, Mail, LogOut, Activity, Landmark, EyeOff
} from 'lucide-react';

const ManagementDashboard = ({ onTabChange, onLogout }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 md:p-6 animate-in fade-in">
            {/* Executive Header */}
            <div className="md:col-span-3 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 p-8 rounded-lg shadow-2xl border border-amber-900/30 flex flex-col md:flex-row justify-between items-start md:items-center text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-5">
                    <Crown size={120} />
                </div>
                <div className="mb-4 md:mb-0 relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/30">
                            <Crown size={24} className="text-amber-500" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black tracking-tighter uppercase italic">Executive Overseer Portal</h2>
                    </div>
                    <p className="text-amber-500/70 text-xs font-mono uppercase tracking-[0.3em]">Session: REDACTED // Location: [SECURE_NODE_01]</p>
                </div>
                <div className="flex items-center gap-4 relative z-10">
                    <div className="px-4 py-2 bg-amber-500 text-black font-black text-xs rounded uppercase tracking-widest">
                        Clearance: OMEGA
                    </div>
                </div>
            </div>

            {/* 1. SECTOR OVERVIEW (Redacted) */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center justify-center min-h-[200px] relative">
                <div className="absolute inset-4 bg-gray-50 border border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center p-6 text-center">
                    <EyeOff size={32} className="text-gray-300 mb-4" />
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Sector Metrics Redacted</p>
                    <p className="text-[9px] text-gray-400">Requires L-OMEGA Authorization for global telemetry.</p>
                </div>
            </div>

            {/* 2. REVENUE / GROWTH (Redacted) */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center justify-center min-h-[200px] relative">
                <div className="absolute inset-4 bg-gray-50 border border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center p-6 text-center">
                    <Landmark size={32} className="text-gray-300 mb-4" />
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Financial Data Redacted</p>
                    <p className="text-[9px] text-gray-400">Fiscal transparency limited to Oversight Committee.</p>
                </div>
            </div>

            {/* 3. STRATEGIC INITIATIVES (Redacted) */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center justify-center min-h-[200px] relative">
                <div className="absolute inset-4 bg-gray-50 border border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center p-6 text-center">
                    <ShieldAlert size={32} className="text-gray-300 mb-4" />
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Project Status Redacted</p>
                    <p className="text-[9px] text-gray-400">Critical infrastructure visibility restricted.</p>
                </div>
            </div>

            {/* 4. EXEC ACTIONS */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 md:col-span-3">
                <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2 uppercase tracking-wider text-[10px]">
                    <Zap size={16} className="text-amber-600" /> Executive Console
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button className="p-6 bg-gray-900 hover:bg-black border border-amber-900/30 rounded-xl flex items-center justify-center gap-4 transition-all group opacity-50 cursor-not-allowed">
                        <TrendingUp size={28} className="text-amber-500" />
                        <div className="text-left">
                            <span className="block text-sm font-bold text-white">Market Influence</span>
                            <span className="text-[10px] text-amber-500/50 uppercase font-bold">LOCKED</span>
                        </div>
                    </button>
                    <button onClick={() => onTabChange('messages')} className="p-6 bg-gray-900 hover:bg-black border border-amber-900/30 rounded-xl flex items-center justify-center gap-4 transition-all group">
                        <Mail size={28} className="text-blue-400 group-hover:scale-110 transition-transform" />
                        <div className="text-left">
                            <span className="block text-sm font-bold text-white">Directives</span>
                            <span className="text-[10px] text-gray-500 uppercase font-bold">Incoming Channel</span>
                        </div>
                    </button>
                    <button onClick={onLogout} className="p-6 bg-gray-900 hover:bg-red-950 border border-red-900/30 rounded-xl flex items-center justify-center gap-4 transition-all group">
                        <LogOut size={28} className="text-red-500 group-hover:scale-110 transition-transform" />
                        <div className="text-left">
                            <span className="block text-sm font-bold text-white">Terminate Session</span>
                            <span className="text-[10px] text-gray-500 uppercase font-bold">End Protocol</span>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ManagementDashboard;
