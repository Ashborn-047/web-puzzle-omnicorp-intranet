import React from 'react';
import {
    Server, Shield, Cpu, Zap, Mail, LogOut, Activity, HardDrive, Terminal, Network
} from 'lucide-react';

const SysAdminDashboard = ({ user, onTabChange, onLogout }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 md:p-6 animate-in fade-in">
            {/* System Status Header */}
            <div className="md:col-span-3 bg-slate-900 p-6 rounded-lg shadow-lg border border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center text-white">
                <div className="mb-4 md:mb-0">
                    <h2 className="text-xl md:text-2xl font-bold font-mono">ROOT@{user.id.toUpperCase()}:~$</h2>
                    <p className="text-slate-400 text-xs font-mono">SYS_ADMIN // {user.dept} // NODE-04</p>
                </div>
                <div className="flex gap-4">
                    <div className="text-left md:text-right">
                        <div className="flex items-center gap-2 text-cyan-400 font-bold bg-cyan-950/50 px-3 py-1 border border-cyan-800 rounded font-mono text-xs">
                            <Activity size={14} /> UPTIME: 342:12:04
                        </div>
                    </div>
                    <div className="text-left md:text-right">
                        <div className="flex items-center gap-2 text-amber-400 font-bold bg-amber-950/50 px-3 py-1 border border-amber-800 rounded font-mono text-xs">
                            <Shield size={14} /> SEC_FIREWALL: ON
                        </div>
                    </div>
                </div>
            </div>

            {/* 1. SERVER HEALTH */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2 uppercase tracking-wider text-xs">
                    <Server size={18} className="text-slate-600" /> Infrastructure
                </h3>
                <ul className="space-y-4">
                    <li>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-mono text-gray-500">CORE-FS-01</span>
                            <span className="text-[10px] font-bold text-green-600">ONLINE</span>
                        </div>
                        <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                            <div className="bg-green-500 h-full w-[45%]"></div>
                        </div>
                    </li>
                    <li>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-mono text-gray-500">AUTH-SRV-ALPHA</span>
                            <span className="text-[10px] font-bold text-green-600">ONLINE</span>
                        </div>
                        <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                            <div className="bg-green-400 h-full w-[12%]"></div>
                        </div>
                    </li>
                    <li>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-mono text-gray-500">DB-QUERY-LB</span>
                            <span className="text-[10px] font-bold text-amber-500">HEAVY LOAD</span>
                        </div>
                        <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                            <div className="bg-amber-500 h-full w-[92%] animate-pulse"></div>
                        </div>
                    </li>
                </ul>
            </div>

            {/* 2. SECURITY LOGS */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2 uppercase tracking-wider text-xs">
                    <Terminal size={18} className="text-slate-600" /> Security Logs
                </h3>
                <div className="bg-slate-50 p-3 rounded font-mono text-[10px] text-slate-600 space-y-2 border border-slate-100 h-32 overflow-y-auto">
                    <p className="border-l-2 border-slate-300 pl-2">[14:22:01] SSH Login attempt from 10.0.4.12: SUCCESS</p>
                    <p className="border-l-2 border-blue-300 pl-2 font-bold text-blue-600">[14:35:55] SYS-9000: Automated audit verified</p>
                    <p className="border-l-2 border-slate-300 pl-2">[14:38:12] File access: /archive/finance/L2_TXN_LOGS</p>
                    <p className="border-l-2 border-amber-300 pl-2 text-amber-600">[14:40:02] Unauthorized query: /root/vault/OMEGA</p>
                </div>
            </div>

            {/* 3. RESOURCE USAGE */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2 uppercase tracking-wider text-xs">
                    <Cpu size={18} className="text-slate-600" /> Resource Stats
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-red-50 rounded-lg border border-red-100 flex flex-col items-center">
                        <Cpu size={20} className="text-red-600 mb-1" />
                        <span className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">CPU Usage</span>
                        <span className="text-lg font-bold text-red-700">74%</span>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 flex flex-col items-center">
                        <HardDrive size={20} className="text-blue-600 mb-1" />
                        <span className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">Disk Usage</span>
                        <span className="text-lg font-bold text-blue-700">62%</span>
                    </div>
                </div>
            </div>

            {/* 4. TECH ACTIONS */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 md:col-span-3">
                <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2 uppercase tracking-wider text-xs">
                    <Zap size={18} className="text-slate-600" /> Admin Tools
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <button className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg flex flex-col items-center gap-2 transition-colors cursor-not-allowed opacity-50">
                        <Network size={24} className="text-indigo-600" />
                        <span className="text-[10px] font-bold text-gray-700 uppercase">Map Network</span>
                    </button>
                    <button className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg flex flex-col items-center gap-2 transition-colors cursor-not-allowed opacity-50">
                        <Shield size={24} className="text-red-500" />
                        <span className="text-[10px] font-bold text-gray-700 uppercase">Purge Logs</span>
                    </button>
                    <button onClick={() => onTabChange('messages')} className="p-4 bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-lg flex flex-col items-center gap-2 transition-all hover:scale-105 group active:scale-95 shadow-sm">
                        <Mail size={24} className="text-blue-600 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold text-gray-700 uppercase">Comm Center</span>
                    </button>
                    <button onClick={onLogout} className="p-4 bg-slate-50 hover:bg-red-50 border border-slate-200 rounded-lg flex flex-col items-center gap-2 transition-all hover:scale-105 group active:scale-95 shadow-sm">
                        <LogOut size={24} className="text-red-500 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold text-gray-700 uppercase">Logout</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SysAdminDashboard;
