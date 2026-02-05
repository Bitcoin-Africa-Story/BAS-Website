import React from 'react';

const ProcessingOverlay = ({ isSubmitting, message = "Processing Publication..." }) => {
    if (!isSubmitting) return null;

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8 flex flex-col items-center gap-4 shadow-2xl">
                <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{message}</p>
            </div>
        </div>
    );
};

export default ProcessingOverlay;
