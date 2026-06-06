import React, { useMemo, useState } from 'react';
import type { Service } from '@shared/types';
import { ArrowBack, Person, Backspace, KeyboardReturn, DeleteSweep } from '@mui/icons-material';
import { JaboataoPrevLogo } from '@shared/components/Logo';

interface NameInputScreenProps {
    service: Service;
    onSubmit: (attendeeName: string) => Promise<void> | void;
    onBack: () => void;
    fullscreenMode?: boolean;
    theme?: 'light' | 'dark';
}

const NameInputScreen: React.FC<NameInputScreenProps> = ({ 
    service, 
    onSubmit, 
    onBack, 
    fullscreenMode,
    theme = 'dark'
}) => {
    const [name, setName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isDark = theme === 'dark';

    const isValid = useMemo(() => name.trim().length >= 3, [name]);

    const handleSubmit = async (event?: React.FormEvent) => {
        if (event) event.preventDefault();

        if (!isValid || isSubmitting) {
            return;
        }

        try {
            setIsSubmitting(true);
            await onSubmit(name.trim());
        } finally {
            setIsSubmitting(false);
        }
    };

    // Teclado virtual tátil interativo
    const keyboardRows = [
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
        ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
    ];

    const handleKeyPress = (char: string) => {
        if (name.length < 60) {
            setName(prev => prev + char);
        }
    };

    const handleBackspace = () => {
        setName(prev => prev.slice(0, -1));
    };

    const handleClear = () => {
        setName('');
    };

    const handleSpace = () => {
        if (name.length > 0 && !name.endsWith(' ') && name.length < 60) {
            setName(prev => prev + ' ');
        }
    };

    return (
        <div className={`flex flex-col w-full h-screen md:min-h-screen p-6 md:p-12 relative overflow-hidden select-none transition-colors duration-500 ${
            isDark 
                ? 'bg-gradient-to-tr from-[#081325] via-[#0c1a30] to-[#050b14] text-white' 
                : 'bg-gradient-to-tr from-[#f8fafc] via-[#e2e8f0] to-[#cbd5e1] text-slate-800'
        }`}>
            {/* Background glowing ambient light */}
            <div className={`absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full blur-[150px] pointer-events-none transition-colors duration-500 ${
                isDark ? 'bg-blue-500/10' : 'bg-blue-200/40'
            }`}></div>
            <div className={`absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full blur-[150px] pointer-events-none transition-colors duration-500 ${
                isDark ? 'bg-[#204FA1]/10' : 'bg-slate-350/30'
            }`}></div>

            <header className="flex items-center mb-4 md:mb-6 justify-between flex-shrink-0 z-10">
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
                    Identificação
                </h1>
            </header>

            <main className="flex-grow flex flex-col items-center justify-center z-10 w-full max-w-4xl mx-auto min-h-0">
                {/* Form area */}
                <div className={`w-full backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col mb-4 transition-all duration-500 ${
                    isDark 
                        ? 'bg-slate-900/60 border border-white/10 text-white' 
                        : 'bg-white/85 border border-slate-200/80 text-slate-800'
                }`}>
                    <p className={`text-sm font-semibold mb-2 transition-colors duration-500 ${
                        isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                        Serviço selecionado: <span className={`font-bold uppercase ${isDark ? 'text-blue-400' : 'text-[#204FA1]'}`}>{service.name}</span>
                    </p>

                    <label htmlFor="attendeeName" className={`block text-base sm:text-lg font-black mb-3 transition-colors duration-500 ${
                        isDark ? 'text-white' : 'text-slate-800'
                    }`}>
                        Digite seu nome na caixa abaixo:
                    </label>

                    <div className="relative">
                        <Person className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-500 ${
                            isDark ? 'text-slate-400' : 'text-slate-500'
                        }`} sx={{ fontSize: 24 }} />
                        <input
                            id="attendeeName"
                            type="text"
                            autoFocus
                            inputMode="none" // Previne a ativação do teclado nativo do sistema operacional
                            maxLength={60}
                            value={name}
                            onChange={(e) => setName(e.target.value.toUpperCase())}
                            placeholder="EX.: MARIA DA SILVA"
                            className={`w-full pl-12 pr-4 py-4 text-xl sm:text-2xl rounded-2xl focus:outline-none focus:ring-2 focus:border-transparent font-black uppercase shadow-inner transition-all duration-500 ${
                                isDark 
                                    ? 'bg-slate-950/60 border border-white/10 text-white focus:ring-blue-500/40 placeholder:text-slate-650' 
                                    : 'bg-slate-50 border border-slate-200 text-slate-900 focus:ring-[#204FA1]/40 placeholder:text-slate-400'
                            }`}
                        />
                    </div>
                </div>

                {/* Virtual Tactile Keyboard */}
                <div className={`w-full backdrop-blur-md rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col gap-2.5 sm:gap-3.5 select-none transition-colors duration-500 ${
                    isDark 
                        ? 'bg-slate-950/50 border border-white/5' 
                        : 'bg-slate-100 border border-slate-200'
                }`}>
                    {keyboardRows.map((row, rIdx) => (
                        <div key={rIdx} className="flex justify-center gap-1.5 sm:gap-2.5">
                            {row.map((char) => (
                                <button
                                    key={char}
                                    type="button"
                                    onClick={() => handleKeyPress(char)}
                                    className={`flex-1 py-3 sm:py-4 rounded-xl text-lg sm:text-2xl font-black active:scale-90 transition-all duration-100 shadow-md ${
                                        isDark 
                                            ? 'bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/30 text-white' 
                                            : 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-805 shadow-[0_2px_4px_rgba(0,0,0,0.05)]'
                                    }`}
                                >
                                    {char}
                                </button>
                            ))}
                        </div>
                    ))}
                    
                    {/* Control Row */}
                    <div className="flex justify-center gap-1.5 sm:gap-2.5 w-full">
                        {/* Clear Key */}
                        <button
                            type="button"
                            onClick={handleClear}
                            className={`flex-[1.5] py-3.5 sm:py-4 rounded-xl text-sm sm:text-base font-black uppercase tracking-widest active:scale-90 transition-all duration-100 shadow-md flex items-center justify-center gap-1 ${
                                isDark 
                                    ? 'bg-red-950/30 hover:bg-red-900/30 border border-red-900/30 text-red-400' 
                                    : 'bg-red-50 hover:bg-red-100 border border-red-100 text-red-650'
                            }`}
                        >
                            <DeleteSweep sx={{ fontSize: 20 }} />
                            <span className="hidden sm:inline">Limpar</span>
                        </button>

                        {/* Space Key */}
                        <button
                            type="button"
                            onClick={handleSpace}
                            className={`flex-[4] py-3.5 sm:py-4 rounded-xl text-lg sm:text-xl font-black active:scale-95 transition-all duration-100 shadow-md uppercase tracking-wider ${
                                isDark 
                                    ? 'bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/30 text-white' 
                                    : 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-805 shadow-[0_2px_4px_rgba(0,0,0,0.05)]'
                            }`}
                        >
                            Espaço
                        </button>

                        {/* Backspace Key */}
                        <button
                            type="button"
                            onClick={handleBackspace}
                            className={`flex-[1.5] py-3.5 sm:py-4 rounded-xl text-sm sm:text-base font-black uppercase tracking-widest active:scale-90 transition-all duration-100 shadow-md flex items-center justify-center gap-1.5 ${
                                isDark 
                                    ? 'bg-amber-950/20 hover:bg-amber-900/20 border border-amber-900/30 text-amber-400' 
                                    : 'bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-600'
                            }`}
                        >
                            <Backspace sx={{ fontSize: 18 }} />
                            <span className="hidden sm:inline">Corrigir</span>
                        </button>
                    </div>
                </div>

                {/* Confirm buttons */}
                <div className="w-full grid grid-cols-2 gap-4 mt-4 flex-shrink-0">
                    <button
                        type="button"
                        onClick={onBack}
                        disabled={isSubmitting}
                        className={`py-4 rounded-2xl border font-black uppercase tracking-wider active:scale-95 transition-all duration-150 shadow-md text-base sm:text-lg ${
                            isDark 
                                ? 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10' 
                                : 'border-slate-200 bg-white text-slate-650 hover:bg-slate-100'
                        }`}
                    >
                        Voltar
                    </button>
                    <button
                        type="button"
                        onClick={() => handleSubmit()}
                        disabled={!isValid || isSubmitting}
                        className={`py-4 rounded-2xl border text-white font-black uppercase tracking-wider active:scale-95 transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg text-base sm:text-lg flex items-center justify-center gap-2 ${
                            isDark 
                                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 border-emerald-500/20 hover:shadow-[0_10px_25px_rgba(16,185,129,0.2)]' 
                                : 'bg-gradient-to-r from-emerald-600 to-emerald-750 border-emerald-500/20 hover:shadow-[0_10px_25px_rgba(16,185,129,0.15)] shadow-md'
                        }`}
                    >
                        {isSubmitting ? (
                            'Gerando...'
                        ) : (
                            <>
                                <KeyboardReturn sx={{ fontSize: 22 }} />
                                Gerar Senha
                            </>
                        )}
                    </button>
                </div>
            </main>
        </div>
    );
};

export default NameInputScreen;
