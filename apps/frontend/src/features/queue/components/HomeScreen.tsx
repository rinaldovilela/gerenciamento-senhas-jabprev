import React, { useState } from 'react';
import { TRANSLATIONS } from '@shared/constants';
import type { Language } from '@shared/types';
import { Tv, Fullscreen, TouchApp, LightMode, DarkMode } from '@mui/icons-material';
import { JaboataoPrevLogo } from '@shared/components/Logo';

interface HomeScreenProps {
    onStart: () => void;
    onAdminClick: () => void;
    onPublicDisplayClick: () => void;
    onFullscreenMode?: () => void;
    theme?: 'light' | 'dark';
    onToggleTheme?: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ 
    onStart, 
    onAdminClick, 
    onPublicDisplayClick, 
    onFullscreenMode,
    theme = 'dark',
    onToggleTheme
}) => {
    const [language] = useState<Language>('pt');
    const isDark = theme === 'dark';

    return (
        <div className={`flex flex-col items-center justify-between w-full min-h-screen p-6 md:p-12 relative overflow-hidden select-none transition-colors duration-500 ${
            isDark 
                ? 'bg-gradient-to-tr from-[#081325] via-[#0c1a30] to-[#050b14] text-slate-300' 
                : 'bg-gradient-to-tr from-[#f8fafc] via-[#e2e8f0] to-[#cbd5e1] text-slate-700'
        }`}>
            {/* Background glowing ambient light */}
            <div className={`absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full blur-[150px] pointer-events-none transition-colors duration-500 ${
                isDark ? 'bg-blue-500/10' : 'bg-blue-200/40'
            }`}></div>
            <div className={`absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full blur-[150px] pointer-events-none transition-colors duration-500 ${
                isDark ? 'bg-[#204FA1]/15' : 'bg-slate-300/40'
            }`}></div>

            <header className="w-full flex justify-between items-center gap-4 z-10">
                <JaboataoPrevLogo theme={theme} />
                <div className="flex items-center gap-3">
                    {onToggleTheme && (
                        <button
                            onClick={onToggleTheme}
                            className={`flex items-center justify-center p-3 rounded-2xl border transition-all duration-300 active:scale-95 shadow-md ${
                                isDark 
                                    ? 'bg-white/5 hover:bg-white/10 border-white/10 text-amber-400' 
                                    : 'bg-white hover:bg-slate-50 border-slate-200 text-[#204FA1]'
                            }`}
                            title={isDark ? "Mudar para Tema Claro" : "Mudar para Tema Escuro"}
                        >
                            {isDark ? <LightMode sx={{ fontSize: 22 }} /> : <DarkMode sx={{ fontSize: 22 }} />}
                        </button>
                    )}
                    <button
                        onClick={onPublicDisplayClick}
                        className={`flex items-center gap-2.5 py-3 px-5 rounded-2xl border active:scale-95 transition-all duration-150 shadow-md text-sm md:text-base font-black uppercase tracking-wider ${
                            isDark 
                                ? 'bg-white/5 hover:bg-white/10 border-white/10 text-white' 
                                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                        }`}
                        aria-label="Ver painel de senhas"
                    >
                        <Tv sx={{ fontSize: 20 }} className={isDark ? "text-blue-400" : "text-[#204FA1]"} />
                        <span>Ver Painel</span>
                    </button>
                </div>
            </header>

            <main className="flex flex-col items-center justify-center flex-grow text-center z-10 w-full px-4 my-8">
                <div className={`backdrop-blur-2xl p-8 sm:p-12 lg:p-16 rounded-[40px] max-w-2xl w-full flex flex-col items-center justify-center transition-all duration-500 transform hover:scale-[1.01] ${
                    isDark 
                        ? 'bg-slate-900/60 border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)]' 
                        : 'bg-white/85 border border-slate-200/80 shadow-[0_30px_60px_rgba(30,41,59,0.12)]'
                }`}>
                    <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-inner animate-pulse transition-colors duration-500 ${
                        isDark 
                            ? 'bg-blue-500/10 border border-blue-400/20' 
                            : 'bg-blue-50 border border-blue-200'
                    }`}>
                        <TouchApp className={isDark ? "text-blue-400" : "text-[#204FA1]"} sx={{ fontSize: 40 }} />
                    </div>

                    <h2 className={`font-montserrat text-3xl sm:text-4xl md:text-5xl font-black mb-4 tracking-tight bg-clip-text text-transparent bg-gradient-to-r ${
                        isDark 
                            ? 'from-white via-slate-100 to-amber-300' 
                            : 'from-[#204FA1] via-blue-900 to-amber-600'
                    }`}>
                        Atendimento ao Cidadão
                    </h2>
                    
                    <p className={`text-base sm:text-lg md:text-xl mb-10 max-w-md font-semibold leading-relaxed transition-colors duration-500 ${
                        isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                        Toque no botão abaixo para retirar sua senha de atendimento.
                    </p>

                    <button
                        onClick={onStart}
                        className={`w-full max-w-md text-xl sm:text-2xl font-black py-5 sm:py-6 px-10 sm:px-14 rounded-2xl active:scale-95 transition-all duration-150 uppercase tracking-widest ${
                            isDark 
                                ? 'bg-gradient-to-r from-[#204FA1] to-[#2B6CB0] border border-blue-400/30 text-white shadow-2xl hover:shadow-blue-500/10' 
                                : 'bg-gradient-to-r from-[#204FA1] to-[#1E40AF] text-white shadow-[0_15px_30px_rgba(30,66,150,0.25)] hover:from-blue-700 hover:to-blue-800'
                        }`}
                    >
                        {TRANSLATIONS.startService[language]}
                    </button>
                </div>
            </main>

            <footer className={`w-full text-center border-t pt-6 z-10 transition-colors duration-500 ${
                isDark ? 'border-white/5' : 'border-slate-350'
            }`}>
                <p className={`text-[10px] sm:text-xs font-medium tracking-wide transition-colors duration-500 ${
                    isDark ? 'text-slate-500' : 'text-slate-450'
                }`}>
                    <b>JABOATÃOPREV</b> – Rua Coronel Waldemar Basgal, 576, Piedade/Prazeres, Jaboatão dos Guararapes - PE | CEP: 54.400-171
                </p>
                <div className="mt-3 flex gap-6 justify-center items-center">
                    <button 
                        onClick={onAdminClick} 
                        className={`text-xs font-bold transition-colors uppercase tracking-widest ${
                            isDark ? 'text-slate-500 hover:text-white' : 'text-slate-500 hover:text-[#204FA1]'
                        }`}
                    >
                        Acesso Restrito
                    </button>
                    {onFullscreenMode && (
                        <button 
                            onClick={onFullscreenMode} 
                            className={`text-xs font-bold transition-colors flex items-center gap-1.5 uppercase tracking-widest ${
                                isDark ? 'text-slate-500 hover:text-white' : 'text-slate-500 hover:text-[#204FA1]'
                            }`}
                            title="Modo fullscreen para tablet"
                        >
                            <Fullscreen sx={{ fontSize: 16 }} />
                            Modo Fullscreen
                        </button>
                    )}
                </div>
            </footer>
        </div>
    );
};

export default HomeScreen;