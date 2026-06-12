import React, { useState } from 'react';
import { 
    Info, 
    ReportProblem, 
    ThumbUp,
    HelpOutline
} from '@mui/icons-material';

export interface OuvidoriaClassificationModalProps {
    isOpen: boolean;
    title?: string;
    description?: string;
    onConfirm: (classification: 'informacao' | 'reclamacao' | 'elogio') => void | Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

type Classification = 'informacao' | 'reclamacao' | 'elogio';

const OuvidoriaClassificationModal: React.FC<OuvidoriaClassificationModalProps> = ({
    isOpen,
    title = 'Classificar Atendimento da Ouvidoria',
    description = 'Este é um atendimento de Ouvidoria. Para finalizá-lo, por favor, classifique a natureza do chamado:',
    onConfirm,
    onCancel,
    isLoading = false
}) => {
    const [selected, setSelected] = useState<Classification | null>(null);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        if (!selected) return;
        try {
            await onConfirm(selected);
        } catch (error) {
            console.error('Erro ao salvar classificação:', error);
        }
    };

    const options = [
        {
            id: 'informacao' as Classification,
            label: 'Informação',
            description: 'Dúvidas, orientações ou esclarecimentos gerais sobre processos.',
            icon: <Info className="text-blue-500 group-hover:scale-110 transition-transform duration-300" sx={{ fontSize: 32 }} />,
            activeClass: 'border-blue-500 bg-blue-50/40 text-blue-900 shadow-blue-100/50',
            hoverClass: 'hover:border-blue-300 hover:bg-blue-50/10'
        },
        {
            id: 'reclamacao' as Classification,
            label: 'Reclamação',
            description: 'Queixas, insatisfações ou relatos de inconsistências/problemas.',
            icon: <ReportProblem className="text-amber-500 group-hover:scale-110 transition-transform duration-300" sx={{ fontSize: 32 }} />,
            activeClass: 'border-amber-500 bg-amber-50/40 text-amber-900 shadow-amber-100/50',
            hoverClass: 'hover:border-amber-300 hover:bg-amber-50/10'
        },
        {
            id: 'elogio' as Classification,
            label: 'Elogio',
            description: 'Agradecimentos, elogios ou manifestações de satisfação com o serviço.',
            icon: <ThumbUp className="text-emerald-500 group-hover:scale-110 transition-transform duration-300" sx={{ fontSize: 32 }} />,
            activeClass: 'border-emerald-500 bg-emerald-50/40 text-emerald-900 shadow-emerald-100/50',
            hoverClass: 'hover:border-emerald-300 hover:bg-emerald-50/10'
        }
    ];

    return (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-200/60 p-6 sm:p-8 max-w-xl w-full shadow-2xl animate-fade-in-up flex flex-col gap-6 text-slate-800">
                <div className="flex flex-col gap-2.5">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <span className="p-1.5 bg-[#204FA1]/10 rounded-lg text-[#204FA1]">
                            <HelpOutline sx={{ fontSize: 24 }} />
                        </span>
                        {title}
                    </h2>
                    <p className="text-sm font-semibold text-slate-500 leading-relaxed">{description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {options.map((opt) => {
                        const isSelected = selected === opt.id;
                        return (
                            <button
                                key={opt.id}
                                disabled={isLoading}
                                onClick={() => setSelected(opt.id)}
                                className={`group flex flex-col items-center md:items-start text-center md:text-left p-4.5 rounded-2xl border-2 transition-all duration-200 active:scale-[0.98] ${
                                    isSelected 
                                        ? opt.activeClass + ' scale-[1.01]' 
                                        : 'border-slate-100 bg-white text-slate-800 ' + opt.hoverClass
                                }`}
                            >
                                <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl mb-3 group-hover:bg-white transition-colors">
                                    {opt.icon}
                                </div>
                                <h3 className="font-extrabold text-sm uppercase tracking-wider mb-1.5">{opt.label}</h3>
                                <p className="text-xs font-semibold leading-relaxed text-slate-400 select-none">{opt.description}</p>
                            </button>
                        );
                    })}
                </div>

                <div className="flex gap-3 justify-end items-center border-t border-slate-100 pt-5">
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className="px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-600 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isLoading || !selected}
                        className={`px-6 py-3 text-xs font-black uppercase tracking-widest text-white rounded-xl shadow-lg active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${
                            selected
                                ? 'bg-gradient-to-r from-jaboatao-blue to-[#2B6CB0] hover:shadow-xl shadow-blue-950/15'
                                : 'bg-slate-300 shadow-none cursor-not-allowed'
                        }`}
                    >
                        {isLoading ? 'Processando...' : 'Confirmar e Finalizar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OuvidoriaClassificationModal;
