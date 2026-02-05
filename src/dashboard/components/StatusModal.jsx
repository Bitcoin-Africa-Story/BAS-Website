import React from 'react';
import { CheckCircle, X } from 'lucide-react';

const StatusModal = ({ open, title, message, onClose }) => {
    if (!open) return null;

    const isError = title === 'Action Failed' || title === 'Error';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-8 w-full max-w-md shadow-2xl">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isError ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'
                    }`}>
                    {isError ? <X size={32} /> : <CheckCircle size={32} />}
                </div>
                <h3 className="text-2xl font-bold text-white text-center mb-2">{title}</h3>
                <p className="text-gray-400 text-center mb-6">{message}</p>
                <button
                    onClick={onClose}
                    className="w-full py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold rounded-xl hover:from-yellow-400 hover:to-yellow-500 transition-all font-inter"
                >
                    Continue
                </button>
            </div>
        </div>
    );
};

export default StatusModal;
