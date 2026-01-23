import React from 'react';
import {
    FlaskConical, Microscope, Database, Zap, Mail, LogOut, Activity, Boxes, Code, Binary
} from 'lucide-react';

const RnDDashboard = ({ user, onTabChange, onLogout }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 md:p-6 animate-in fade-in">
            {/* Research Header */}
            <div className="md:col-span-3 bg-neutral-900 p-6 rounded-lg shadow-xl border border-neutral-700 flex flex-col md:flex-row justify-between items-start md:items-center text-white">
                <div className="mb-4 md:mb-0">
                    <div className="flex items-center gap-2 mb-1">
                        <FlaskConical size={20} className="text-emerald-400" />
                        <h2 className="text-xl md:text-2xl font-bold tracking-tight">Project Horizon Lab-04</h2>
                    </div>
                    <p className="text-neutral-500 text-xs font-mono uppercase tracking-widest">Researcher: {user.name} // AUTH_STP: {user.id.toUpperCase()}</p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <p className="text-[10px] text-neutral-500 uppercase font-bold">Lab Status</p>
                        <p className="text-sm font-bold text-emerald-400">ISOLATED</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-neutral-500 uppercase font-bold">Active Threads</p>
                        <p className="text-sm font-bold text-neutral-200">14</p>
                    </div>
                </div>
            </div>

            {/* 1. PROJECT LIST */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2 uppercase tracking-wider text-[10px]">
                    <Boxes size={16} className="text-emerald-500" /> Active Experiments
                </h3>
                <div className="space-y-4">
                    <div className="group cursor-default">
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-xs font-bold text-gray-800">PROJECT: IKAROS</span>
                            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold">STABLE</span>
                        </div>
                        <p className="text-[10px] text-gray-500 leading-tight">Biometric interface synchronization via neural pathways.</p>
                    </div>
                    <div className="group cursor-default">
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-xs font-bold text-gray-800">PROJECT: NEON-MIST</span>
                            <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold">VARIANT_DETECTION</span>
                        </div>
                        <p className="text-[10px] text-gray-500 leading-tight">Atmospheric projection of high-density data packets.</p>
                    </div>
                </div>
            </div>

            {/* 2. TELEMETRY FEED */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2 uppercase tracking-wider text-[10px]">
                    <Binary size={16} className="text-emerald-500" /> System Telemetry
                </h3>
                <div className="bg-emerald-950/5 p-4 rounded-lg border border-emerald-100 font-mono text-[10px] text-emerald-900 h-32 overflow-hidden flex flex-col gap-2">
                    <div className="flex justify-between border-b border-emerald-100/50 pb-1">
                        <span>SIGNAL_STRENGTH</span>
                        <span className="font-bold">98.4%</span>
                    </div>
                    <div className="flex justify-between border-b border-emerald-100/50 pb-1">
                        <span>DATA_LATENCY</span>
                        <span className="font-bold">4.2ms</span>
                    </div>
                    <div className="flex justify-between border-b border-emerald-100/50 pb-1">
                        <span>ENTROPY_INDEX</span>
                        <span className="font-bold text-amber-600">0.0042</span>
                    </div>
                    <div className="mt-auto animate-pulse flex gap-1">
                        <div className="h-4 w-1 bg-emerald-300"></div>
                        <div className="h-6 w-1 bg-emerald-400"></div>
                        <div className="h-3 w-1 bg-emerald-200"></div>
                        <div className="h-5 w-1 bg-emerald-500"></div>
                        <div className="h-4 w-1 bg-emerald-400"></div>
                    </div>
                </div>
            </div>

            {/* 3. COMPUTATIONAL LOAD */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2 uppercase tracking-wider text-[10px]">
                    <Microscope size={16} className="text-emerald-500" /> Resource Allocation
                </h3>
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between text-[10px] mb-1">
                            <span className="text-gray-500 font-bold uppercase">Simulation Engine</span>
                            <span className="text-emerald-600 font-bold">65%</span>
                        </div>
                        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full w-[65%]"></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-[10px] mb-1">
                            <span className="text-gray-500 font-bold uppercase">Model Persistence</span>
                            <span className="text-indigo-600 font-bold">22%</span>
                        </div>
                        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-indigo-500 h-full w-[22%]"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. LAB ACTIONS */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 md:col-span-3">
                <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2 uppercase tracking-wider text-[10px]">
                    <Zap size={16} className="text-emerald-500" /> Lab Controller
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <button className="p-4 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-lg flex flex-col items-center gap-2 transition-colors cursor-not-allowed opacity-50">
                        <Code size={24} className="text-emerald-600" />
                        <span className="text-[10px] font-bold text-gray-700 uppercase">Compile</span>
                    </button>
                    <button className="p-4 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-lg flex flex-col items-center gap-2 transition-colors cursor-not-allowed opacity-50">
                        <Database size={24} className="text-blue-500" />
                        <span className="text-[10px] font-bold text-gray-700 uppercase">Archive</span>
                    </button>
                    <button onClick={() => onTabChange('messages')} className="p-4 bg-neutral-50 hover:bg-blue-50 border border-neutral-200 rounded-lg flex flex-col items-center gap-2 transition-colors group">
                        <Mail size={24} className="text-blue-600 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold text-gray-700 uppercase">Internal Comms</span>
                    </button>
                    <button onClick={onLogout} className="p-4 bg-neutral-50 hover:bg-red-50 border border-neutral-200 rounded-lg flex flex-col items-center gap-2 transition-colors group">
                        <LogOut size={24} className="text-red-500 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold text-gray-700 uppercase">Secure Logout</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RnDDashboard;
