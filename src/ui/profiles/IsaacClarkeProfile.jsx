import React from 'react';
import {
    Server, Cpu, Zap, Mail, LogOut, Activity, HardDrive, Terminal, ShieldAlert, Wifi, Settings
} from 'lucide-react';

const IsaacClarkeProfile = ({ user, onTabChange, onLogout }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 md:p-6 animate-in fade-in bg-slate-50 min-h-full">
            {/* Engineer Header */}
            <div className="md:col-span-3 bg-indigo-900 p-8 rounded-xl shadow-xl border border-indigo-950 flex flex-col md:flex-row justify-between items-start md:items-center text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                    <Settings size={120} />
                </div>

                <div className="mb-4 md:mb-0 relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md">
                            <Cpu size={24} className="text-white" />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight">{user.name}</h2>
                    </div>
                    <p className="text-indigo-300 text-xs font-mono uppercase tracking-[0.2em]">{user.role} // SITE_SECTOR_7 // RIG_ID: {user.id}</p>
                </div>

                <div className="flex gap-4 relative z-10">
                    <div className="bg-white/10 border border-white/20 px-4 py-2 rounded-lg backdrop-blur-md text-center">
                        <p className="text-[9px] text-indigo-300 font-bold uppercase mb-1">Rig Integrity</p>
                        <p className="text-xl font-bold font-mono">98.4%</p>
                    </div>
                    <div className="bg-emerald-900/30 border border-emerald-500/30 px-4 py-2 rounded-lg backdrop-blur-md text-center">
                        <p className="text-[9px] text-emerald-400 font-bold uppercase mb-1">Neural Bridge</p>
                        <p className="text-xl font-bold font-mono text-emerald-400">SYNCED</p>
                    </div>
                </div>
            </div>

            {/* 1. SECTOR 7 STATUS */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2 text-xs uppercase tracking-wider">
                    <Wifi size={18} className="text-indigo-600" /> Sector 7 Sub-Systems
                </h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-xs font-bold text-slate-600">GRAVITY_WELL_04</span>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-[10px] font-bold text-emerald-600">STABLE</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                        <span className="text-xs font-bold text-red-700 font-mono">ELEVATOR_6B_HYDRAULIC</span>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                            <span className="text-[10px] font-bold text-red-600">JAMMED</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. MAINTENANCE LOGS */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2 text-xs uppercase tracking-wider">
                    <Terminal size={18} className="text-slate-600" /> RIG_LOGS.dat
                </h3>
                <div className="bg-slate-50 p-4 rounded-lg font-mono text-[9px] text-slate-500 space-y-3 h-32 overflow-y-auto border border-slate-100">
                    <p className="border-l-2 border-indigo-400 pl-2">ENTRY 441: Periodic vent cleaning complete.</p>
                    <p className="border-l-2 border-slate-300 pl-2">ENTRY 442: Replaced coolant in Node 02.</p>
                    <p className="border-l-2 border-red-400 pl-2 text-red-600 font-bold">ENTRY 443: Unexpected spatial distortion in Sector 7-C.</p>
                    <p className="border-l-2 border-slate-300 pl-2">ENTRY 444: Requesting additional plasma cutters.</p>
                </div>
            </div>

            {/* 3. HARDWARE SLOTS */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2 text-xs uppercase tracking-wider">
                    <ShieldAlert size={18} className="text-red-500" /> Critical Tickets
                </h3>
                <div className="space-y-3">
                    <div className="p-4 bg-red-50/50 rounded-xl border border-red-100 group hover:bg-red-50 transition-colors cursor-pointer">
                        <p className="text-[10px] font-bold text-red-900 mb-1">TICKET #042: Blood in ventilation</p>
                        <p className="text-[9px] text-red-700">STATUS: Wont Fix - Reported as "Organic Residue".</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 opacity-60">
                        <p className="text-[10px] font-bold text-slate-800 mb-1">TICKET #039: Whisper in Node 04</p>
                        <p className="text-[9px] text-slate-500 italic">Marked as Audio Interference.</p>
                    </div>
                </div>
            </div>

            {/* 4. ENGINEER ACTIONS */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 md:col-span-3">
                <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2 text-xs uppercase tracking-wider">
                    <Zap size={18} className="text-indigo-600" /> Engineering HUD
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <button onClick={() => onTabChange('infrastructure')} className="p-4 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl flex flex-col items-center gap-2 transition-all hover:scale-105 group">
                        <Server size={24} className="text-indigo-600 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold text-indigo-900 uppercase">System Map</span>
                    </button>
                    <button onClick={() => onTabChange('messages')} className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex flex-col items-center gap-2 transition-all hover:scale-105 group">
                        <Mail size={24} className="text-slate-600 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold text-slate-700 uppercase">Messages</span>
                    </button>
                    <button className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex flex-col items-center gap-2 opacity-50 cursor-not-allowed">
                        <HardDrive size={24} className="text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Diag Tool</span>
                    </button>
                    <button onClick={onLogout} className="p-4 bg-slate-50 hover:bg-red-50 border border-slate-200 rounded-xl flex flex-col items-center gap-2 transition-all hover:scale-105 group">
                        <LogOut size={24} className="text-red-500 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold text-slate-700 uppercase">Exit Link</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default IsaacClarkeProfile;
