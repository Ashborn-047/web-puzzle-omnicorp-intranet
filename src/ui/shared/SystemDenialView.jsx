import React from 'react';
import { ShieldAlert, Lock, ArrowLeft } from 'lucide-react';

const SystemDenialView = ({ reason = "Access Denied", clearanceRequired, onBack }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-in fade-in zoom-in duration-300">
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-25"></div>
                <div className="relative bg-red-50 p-6 rounded-full border-2 border-red-100">
                    <ShieldAlert size={48} className="text-red-600" />
                </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">{reason}</h2>
            <p className="text-gray-500 max-w-md mb-8">
                Your current credentials do not provide sufficient authorization to view this resource.
                If you believe this is an error, please contact your local IT Operations unit.
            </p>

            {clearanceRequired && (
                <div className="mb-8 p-4 bg-gray-50 border border-gray-200 rounded-lg inline-flex items-center gap-3">
                    <Lock size={16} className="text-gray-400" />
                    <span className="text-sm font-mono font-bold text-gray-600 uppercase tracking-widest">
                        REQUIRED CLEARANCE: {clearanceRequired}
                    </span>
                </div>
            )}

            {onBack && (
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all font-medium"
                >
                    <ArrowLeft size={18} />
                    Return to Dashboard
                </button>
            )}

            <div className="mt-12 pt-8 border-t border-gray-100 w-full max-w-xs">
                <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em]">
                    OmniCorp Security Protocol 9.4.1
                </p>
            </div>
        </div>
    );
};

export default SystemDenialView;
