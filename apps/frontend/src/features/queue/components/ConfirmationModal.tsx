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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-100 p-6 sm:p-8 max-w-md w-full shadow-2xl animate-fade-in-up flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-black text-text-primary tracking-tight">{title}</h2>
                    <p className="text-sm font-semibold text-text-secondary/90 leading-relaxed">{message}</p>
                </div>
                
                <div className="flex gap-3 justify-end items-center">
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className="px-5 py-2.5 text-xs font-bold text-text-primary bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className={`px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-md hover:shadow-lg active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${
                            isDangerous
                                ? 'bg-red-500 hover:bg-red-600 shadow-red-500/10'
                                : 'bg-jaboatao-blue hover:bg-[#1C4690] shadow-jaboatao-blue/15'
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
