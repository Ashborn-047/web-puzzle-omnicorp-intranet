import React, { useState, useEffect } from 'react';
import { Shield, Unlock, Key, Eye, EyeOff, AlertTriangle, CheckCircle2 } from 'lucide-react';

// Default accepted passcodes: 'omnicorp-dev' or '1979'
const DEFAULT_PASSCODES = ['omnicorp-dev', '1979', 'omni2026'];

export default function StudioSecurityGate({ onAuthenticated }) {
    const [passcode, setPasscode] = useState('');
    const [showPasscode, setShowPasscode] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [shake, setShake] = useState(false);
    const [rememberDevice, setRememberDevice] = useState(true);
    const [isChangingPass, setIsChangingPass] = useState(false);
    const [newPass, setNewPass] = useState('');
    const [newPassConfirm, setNewPassConfirm] = useState('');
    const [changeSuccess, setChangeSuccess] = useState(false);

    // Check if already authenticated in this session or local storage
    useEffect(() => {
        const sessionAuth = sessionStorage.getItem('omnicorp_studio_unlocked');
        const localAuth = localStorage.getItem('omnicorp_studio_remembered');
        if (sessionAuth === 'true' || localAuth === 'true') {
            onAuthenticated(true);
        }
    }, [onAuthenticated]);

    const handleUnlock = (e) => {
        e.preventDefault();
        const trimmed = passcode.trim();

        // Check against user custom passcode if set, or default passcodes
        const savedCustomHash = localStorage.getItem('omnicorp_custom_passcode');
        const isMatch = savedCustomHash 
            ? (trimmed === savedCustomHash)
            : (DEFAULT_PASSCODES.includes(trimmed.toLowerCase()) || trimmed === '1979');

        if (isMatch) {
            setErrorMsg('');
            sessionStorage.setItem('omnicorp_studio_unlocked', 'true');
            if (rememberDevice) {
                localStorage.setItem('omnicorp_studio_remembered', 'true');
            }
            onAuthenticated(true);
        } else {
            setShake(true);
            setErrorMsg('SECURITY VIOLATION: Unauthorized access key. Clearance denied.');
            setTimeout(() => setShake(false), 500);
        }
    };

    const handleSaveNewPasscode = (e) => {
        e.preventDefault();
        if (newPass.length < 4) {
            setErrorMsg('Passcode must be at least 4 characters long.');
            return;
        }
        if (newPass !== newPassConfirm) {
            setErrorMsg('New passcodes do not match.');
            return;
        }
        localStorage.setItem('omnicorp_custom_passcode', newPass);
        setChangeSuccess(true);
        setTimeout(() => {
            setChangeSuccess(false);
            setIsChangingPass(false);
            setNewPass('');
            setNewPassConfirm('');
            setErrorMsg('');
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden select-none">
            {/* Ambient Background Grid & Glow */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e1b4b0f_1px,transparent_1px),linear-gradient(to_bottom,#1e1b4b0f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-900/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-900/20 rounded-full blur-3xl pointer-events-none" />

            <div className={`w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 relative z-10 transition-transform ${shake ? 'animate-bounce' : ''}`}>
                {/* Header Badge */}
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-inner">
                            <Shield size={20} className="animate-pulse" />
                        </div>
                        <div>
                            <div className="text-[10px] uppercase font-mono tracking-widest text-purple-400 font-semibold">
                                OMNICORP NARRATIVE CLOUD
                            </div>
                            <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                                Developer Authorization
                            </h2>
                        </div>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-red-950/60 text-red-400 border border-red-800/50">
                        RESTRICTED
                    </span>
                </div>

                {!isChangingPass ? (
                    <form onSubmit={handleUnlock} className="space-y-5">
                        <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/60 text-xs text-slate-400 leading-relaxed font-mono">
                            <span className="text-purple-400 font-semibold">SYS NOTICE:</span> Narrative Studio contains classified puzzle logic & graph nodes. Enter your Master Developer Passcode to proceed.
                        </div>

                        {errorMsg && (
                            <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/50 text-xs text-red-300 flex items-start gap-2.5">
                                <AlertTriangle size={15} className="shrink-0 mt-0.5 text-red-400" />
                                <div>{errorMsg}</div>
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider">
                                Developer Passcode
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                    <Key size={16} />
                                </div>
                                <input
                                    type={showPasscode ? 'text' : 'password'}
                                    value={passcode}
                                    onChange={(e) => setPasscode(e.target.value)}
                                    placeholder="Enter access passcode..."
                                    autoFocus
                                    className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl pl-9 pr-10 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all font-mono"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasscode(!showPasscode)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                                    title={showPasscode ? 'Hide passcode' : 'Show passcode'}
                                >
                                    {showPasscode ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1">
                                <span>Default: <code className="text-purple-300 font-mono bg-purple-950/40 px-1 py-0.5 rounded">omnicorp-dev</code> or <code className="text-purple-300 font-mono bg-purple-950/40 px-1 py-0.5 rounded">1979</code></span>
                                <button
                                    type="button"
                                    onClick={() => { setIsChangingPass(true); setErrorMsg(''); }}
                                    className="text-purple-400 hover:text-purple-300 hover:underline"
                                >
                                    Customize Key
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="rememberDevice"
                                checked={rememberDevice}
                                onChange={(e) => setRememberDevice(e.target.checked)}
                                className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-purple-600 focus:ring-purple-500/30"
                            />
                            <label htmlFor="rememberDevice" className="text-xs text-slate-400 cursor-pointer">
                                Remember authorization on this browser
                            </label>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-sm rounded-xl shadow-lg shadow-purple-950/50 hover:shadow-purple-700/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                        >
                            <Unlock size={16} /> Authenticate & Unlock Studio
                        </button>
                    </form>
                ) : (
                    /* Change Passcode View */
                    <form onSubmit={handleSaveNewPasscode} className="space-y-4">
                        <div className="text-xs text-slate-400">
                            Set your private custom master passcode. This key is stored securely in this browser's local sandbox.
                        </div>

                        {errorMsg && (
                            <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/50 text-xs text-red-300 flex items-start gap-2">
                                <AlertTriangle size={15} className="shrink-0 mt-0.5 text-red-400" />
                                <div>{errorMsg}</div>
                            </div>
                        )}

                        {changeSuccess && (
                            <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-xs text-emerald-300 flex items-center gap-2">
                                <CheckCircle2 size={16} className="text-emerald-400" />
                                <div>Custom passcode successfully saved!</div>
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-300">New Passcode</label>
                            <input
                                type="password"
                                value={newPass}
                                onChange={(e) => setNewPass(e.target.value)}
                                placeholder="Min 4 characters"
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-300">Confirm Passcode</label>
                            <input
                                type="password"
                                value={newPassConfirm}
                                onChange={(e) => setNewPassConfirm(e.target.value)}
                                placeholder="Re-enter new passcode"
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                            />
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => { setIsChangingPass(false); setErrorMsg(''); }}
                                className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 py-2 px-3 bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs rounded-xl transition-colors"
                            >
                                Save Custom Key
                            </button>
                        </div>
                    </form>
                )}

                <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>STATUS: ARMED</span>
                    <span>ENV: GITHUB_PAGES / PROD</span>
                </div>
            </div>
        </div>
    );
}
