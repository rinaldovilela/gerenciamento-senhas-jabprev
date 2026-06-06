import React from 'react';
import { ArrowBack, Help } from '@mui/icons-material';
import { JaboataoPrevLogo } from '@shared/components/Logo';

interface PrioritySelectionScreenProps {
    onSelect: (isPriority: boolean) => void;
    onBack: () => void;
    fullscreenMode?: boolean;
    theme?: 'light' | 'dark';
}

const PrioritySelectionScreen: React.FC<PrioritySelectionScreenProps> = ({ 
    onSelect, 
    onBack, 
    fullscreenMode,
    theme = 'dark'
}) => {
    const isDark = theme === 'dark';

    return (
        <div className={`flex flex-col w-full min-h-screen p-6 md:p-12 relative overflow-hidden select-none transition-colors duration-500 ${
            isDark 
                ? 'bg-gradient-to-tr from-[#081325] via-[#0c1a30] to-[#050b14] text-white' 
                : 'bg-gradient-to-tr from-[#f8fafc] via-[#e2e8f0] to-[#cbd5e1] text-slate-800'
        }`}>
            {/* Background glowing ambient light */}
            <div className={`absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full blur-[150px] pointer-events-none transition-colors duration-500 ${
                isDark ? 'bg-blue-500/10' : 'bg-blue-200/40'
            }`}></div>
            <div className={`absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full blur-[150px] pointer-events-none transition-colors duration-500 ${
                isDark ? 'bg-emerald-500/10' : 'bg-emerald-250/20'
            }`}></div>

            <header className="flex items-center mb-8 md:mb-12 justify-between z-10">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={onBack} 
                        className={`p-3 rounded-2xl active:scale-90 transition-all duration-155 border flex items-center justify-center shadow-lg ${
                            isDark 
                                ? 'bg-white/5 hover:bg-white/10 border-white/10 text-blue-400' 
                                : 'bg-white hover:bg-slate-50 border-slate-200 text-[#204FA1]'
                        }`}
                        title="Voltar"
                    >
                        <ArrowBack sx={{ fontSize: 22 }} />
                    </button>
                    <JaboataoPrevLogo theme={theme} className="hidden sm:flex" />
                </div>
                <h1 className={`font-montserrat text-xl sm:text-2xl md:text-3xl font-black text-right transition-colors duration-500 ${
                    isDark ? 'text-white' : 'text-slate-900'
                }`}>
                    Servidor Ativo
                </h1>
            </header>
            
            <main className="flex-grow flex items-center justify-center z-10 w-full px-4">
                <div className={`w-full max-w-2xl backdrop-blur-2xl p-8 sm:p-12 rounded-[40px] text-center flex flex-col items-center transition-all duration-500 ${
                    isDark 
                        ? 'bg-slate-900/60 border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)]' 
                        : 'bg-white/85 border border-slate-200/80 shadow-[0_30px_60px_rgba(30,41,59,0.12)]'
                }`}>
                    <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-inner animate-pulse transition-colors duration-500 ${
                        isDark 
                            ? 'bg-amber-500/10 border border-amber-400/20' 
                            : 'bg-amber-50 border border-amber-200'
                    }`}>
                        <Help className={isDark ? "text-amber-400" : "text-amber-600"} sx={{ fontSize: 40 }} />
                    </div>

                    <h2 className={`font-montserrat text-2xl sm:text-3xl font-black mb-8 tracking-tight transition-colors duration-500 ${
                        isDark ? 'text-white' : 'text-slate-800'
                    }`}>
                        O seu atendimento é prioritário?
                    </h2>

                    <div className="flex flex-col sm:flex-row justify-center gap-6 w-full max-w-md">
                        {/* Sim Card (Green/Priority) */}
                        <button 
                            onClick={() => onSelect(true)}
                            className={`flex-1 py-5 px-8 rounded-2xl border text-xl font-black uppercase tracking-wider active:scale-[0.96] transition-all duration-150 shadow-lg ${
                                isDark 
                                    ? 'border-emerald-500/30 bg-gradient-to-r from-emerald-950/20 to-emerald-900/10 hover:to-emerald-900/30 text-emerald-400 hover:shadow-[0_10px_30px_rgba(16,185,129,0.2)]' 
                                    : 'border-emerald-300 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-700 hover:shadow-[0_10px_30px_rgba(4,120,87,0.1)]'
                            }`}
                        >
                            Sim
                        </button>
                        {/* Não Card (Gray/Normal) */}
                        <button 
                            onClick={() => onSelect(false)}
                            className={`flex-1 py-5 px-8 rounded-2xl border text-xl font-black uppercase tracking-wider active:scale-[0.96] transition-all duration-150 shadow-lg ${
                                isDark 
                                    ? 'border-white/10 bg-white/5 hover:bg-white/10 text-slate-300' 
                                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                            }`}
                        >
                            Não
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PrioritySelectionScreen;
