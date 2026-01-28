import React from 'react';
import {
    Server, Shield, Cpu, Zap, Mail, LogOut, Activity, HardDrive, Terminal, Network, Search, AlertTriangle
} from 'lucide-react';

const DavidBowmanProfile = ({ user, onTabChange, onLogout }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 md:p-6 animate-in fade-in">
            {/* System Status Header */}
            <div className="md:col-span-3 bg-slate-900 p-6 rounded-lg shadow-lg border border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2">
                    <div className="flex items-center gap-2 px-3 py-1 bg-red-900/40 border border-red-900 rounded-full text-[10px] font-bold text-red-500 animate-pulse">
                        <AlertTriangle size={12} /> STATUS: REVIEW_PENDING
                    </div>
                </div>

                <div className="mb-4 md:mb-0 relative z-10">
                    <h2 className="text-xl md:text-2xl font-bold font-mono">SYS_ADMIN@HQ-NODE-06:~$</h2>
                    <p className="text-slate-400 text-xs font-mono uppercase tracking-widest">{user.name} // {user.dept} // L3_CLEARANCE</p>
                </div>
                <div className="flex gap-4 relative z-10">
                    <div className="text-left md:text-right">
                        <div className="flex items-center gap-2 text-cyan-400 font-bold bg-cyan-950/50 px-3 py-1 border border-cyan-800 rounded font-mono text-xs">
                            <Activity size={14} /> UPTIME: 8421:22:11
                        </div>
                    </div>
                </div>
            </div>

            {/* 1. NODE MONITORING */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2 uppercase tracking-wider text-[10px]">
                    <Server size={18} className="text-slate-600" /> Infrastructure Node Status
                </h3>
                <div className="space-y-4">
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-bold text-slate-700">HQ-DATA-CENTER</span>
                            <span className="text-[10px] font-bold text-green-600">SYMMETRIC</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-full w-[65%]"></div>
                        </div>
                    </div>
                    <div className="p-3 bg-red-50 border border-red-100 rounded">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-bold text-red-700 font-mono">NODE-066 (FAIL)</span>
                            <span className="text-[10px] font-bold text-red-600">CRITICAL</span>
                        </div>
                        <div className="w-full bg-red-200 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-red-500 h-full w-[98%] animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. SILENT ALERTS */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2 uppercase tracking-wider text-[10px]">
                    <Terminal size={18} className="text-slate-600" /> Residual System Logs
                </h3>
                <div className="bg-slate-900 p-4 rounded font-mono text-[9px] text-emerald-500 space-y-2 h-32 overflow-y-auto custom-scrollbar shadow-inner border border-slate-800">
                    <p className="opacity-70">[10:04:12] SYSTEM: Re-indexing L3_ARCHIVE...</p>
                    <p className="text-amber-400">[11:22:55] WARN: SSH Handshake failure from SECTOR_7</p>
                    <p className="text-red-400 font-bold">[12:00:00] CRIT: Unauthorized file copy detected</p>
                    <p className="opacity-70">[12:01:44] SYSTEM: David Bowman session persistent</p>
                    <p className="text-emerald-400 animate-pulse">&gt; _</p>
                </div>
            </div>

            {/* 3. HARDWARE & ENVIRONMENT */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2 uppercase tracking-wider text-[10px]">
                    <Cpu size={18} className="text-slate-600" /> Resource Statistics
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex flex-col items-center">
                        <HardDrive className="text-blue-600 mb-2" size={20} />
                        <span className="text-[9px] font-bold text-blue-900/40 uppercase tracking-tighter">Vault Usage</span>
                        <span className="text-xl font-bold text-blue-900 font-mono">24.8 PB</span>
                    </div>
                    <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 flex flex-col items-center">
                        <Search className="text-slate-600 mb-2" size={20} />
                        <span className="text-[9px] font-bold text-slate-900/40 uppercase tracking-tighter">Queries/s</span>
                        <span className="text-xl font-bold text-slate-900 font-mono">1.2M</span>
                    </div>
                </div>
            </div>

            {/* 4. ADMINISTRATIVE TOOLS */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 md:col-span-3">
                <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2 uppercase tracking-wider text-[10px]">
                    <Zap size={18} className="text-slate-600" /> Admin Control Set
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <button onClick={() => onTabChange('terminal')} className="p-4 bg-slate-900 text-slate-100 hover:bg-slate-800 border border-slate-700 rounded-xl flex flex-col items-center gap-2 transition-all hover:scale-105 group shadow-lg">
                        <Terminal size={24} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold uppercase tracking-widest font-mono">SysTerminal</span>
                    </button>
                    <button onClick={() => onTabChange('infrastructure')} className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex flex-col items-center gap-2 transition-all hover:scale-105 group shadow-sm">
                        <Server size={24} className="text-slate-600 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold text-gray-700 uppercase">Hardware</span>
                    </button>
                    <button onClick={() => onTabChange('messages')} className="p-4 bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-xl flex flex-col items-center gap-2 transition-all hover:scale-105 group shadow-sm">
                        <Mail size={24} className="text-blue-600 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold text-gray-700 uppercase">OmniMail</span>
                    </button>
                    <button onClick={onLogout} className="p-4 bg-slate-50 hover:bg-red-50 border border-slate-200 rounded-xl flex flex-col items-center gap-2 transition-all hover:scale-105 group shadow-sm">
                        <LogOut size={24} className="text-red-500 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold text-gray-700 uppercase">Terminate</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DavidBowmanProfile;
