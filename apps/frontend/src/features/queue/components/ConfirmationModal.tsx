import React from 'react';

export interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDangerous?: boolean;
    onConfirm: () => void | Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    isDangerous = false,
    onConfirm,
    onCancel,
    isLoading = false,
}) => {
    if (!isOpen) return null;

    const handleConfirm = async () => {
        try {
            await onConfirm();
        } catch (error) {
            console.error('Erro ao confirmar:', error);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-200/60 p-6 sm:p-8 max-w-md w-full shadow-2xl animate-fade-in-up flex flex-col gap-6 text-slate-800">
                <div className="flex flex-col gap-2.5">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">{title}</h2>
                    <p className="text-sm font-semibold text-slate-500 leading-relaxed">{message}</p>
                </div>
                
                <div className="flex gap-3 justify-end items-center">
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className="px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-600 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className={`px-6 py-3 text-xs font-black uppercase tracking-widest text-white rounded-xl shadow-lg active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${
                            isDangerous
                                ? 'bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 shadow-rose-950/15'
                                : 'bg-gradient-to-r from-jaboatao-blue to-[#2B6CB0] hover:shadow-xl shadow-blue-950/15'
                        }`}
                    >
                        {isLoading ? 'Processando...' : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
