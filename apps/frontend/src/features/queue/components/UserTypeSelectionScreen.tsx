import React from 'react';
import { Elderly, FamilyRestroom, Business, ArrowBack } from '@mui/icons-material';
import type { UserType } from '@shared/types';
import { JaboataoPrevLogo } from '@shared/components/Logo';

interface UserTypeSelectionScreenProps {
    onSelect: (userType: UserType) => void;
    onBack: () => void;
    fullscreenMode?: boolean;
    theme?: 'light' | 'dark';
}

const UserTypeSelectionScreen: React.FC<UserTypeSelectionScreenProps> = ({ 
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
                isDark ? 'bg-[#2E8B57]/10' : 'bg-emerald-200/20'
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
                    Tipo de Atendimento
                </h1>
            </header>
            
            <main className="flex-grow flex flex-col items-center justify-center z-10">
                <div className="text-center mb-8 md:mb-12">
                    <p className={`text-lg md:text-xl font-bold tracking-wide transition-colors duration-500 ${
                        isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                        Como você se identifica para o atendimento?
                    </p>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-center gap-6 lg:gap-10 w-full max-w-6xl px-4">
                    {/* Aposentado Card */}
                    <button 
                        onClick={() => onSelect('aposentado')}
                        className={`flex flex-col items-center justify-center w-full md:w-72 lg:w-80 p-8 md:p-10 rounded-3xl border active:scale-[0.97] transition-all duration-200 shadow-xl ${
                            isDark 
                                ? 'border-blue-500/20 bg-gradient-to-b from-blue-950/20 to-blue-900/5 hover:to-blue-900/15 hover:shadow-[0_20px_50px_rgba(30,58,138,0.3)]' 
                                : 'border-blue-200 bg-white hover:bg-blue-50/50 hover:shadow-[0_20px_50px_rgba(30,58,138,0.1)]'
                        } group`}
                        aria-label="Selecionar tipo de atendimento Aposentado"
                    >
                        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-all duration-300 ${
                            isDark 
                                ? 'bg-blue-500/10 border border-blue-500/30' 
                                : 'bg-blue-50 border border-blue-200'
                        }`}>
                            <Elderly className={isDark ? "text-blue-400" : "text-blue-600"} sx={{ fontSize: 48 }} />
                        </div>
                        <span className={`font-montserrat font-black text-xl lg:text-2xl tracking-wider uppercase transition-colors duration-500 ${
                            isDark ? 'text-white' : 'text-slate-800'
                        }`}>
                            Aposentado
                        </span>
                        <span className={`text-xs font-bold mt-2 uppercase tracking-widest opacity-80 ${
                            isDark ? 'text-blue-400' : 'text-blue-600'
                        }`}>
                            Beneficiário
                        </span>
                    </button>

                    {/* Pensionista Card */}
                    <button 
                        onClick={() => onSelect('pensionista')}
                        className={`flex flex-col items-center justify-center w-full md:w-72 lg:w-80 p-8 md:p-10 rounded-3xl border active:scale-[0.97] transition-all duration-200 shadow-xl ${
                            isDark 
                                ? 'border-emerald-500/20 bg-gradient-to-b from-emerald-950/20 to-emerald-900/5 hover:to-emerald-900/15 hover:shadow-[0_20px_50px_rgba(6,78,59,0.3)]' 
                                : 'border-emerald-200 bg-white hover:bg-emerald-50/50 hover:shadow-[0_20px_50px_rgba(16,185,129,0.1)]'
                        } group`}
                        aria-label="Selecionar tipo de atendimento Pensionista"
                    >
                        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-all duration-300 ${
                            isDark 
                                ? 'bg-emerald-500/10 border border-emerald-500/30' 
                                : 'bg-emerald-50 border border-emerald-200'
                        }`}>
                            <FamilyRestroom className={isDark ? "text-emerald-400" : "text-emerald-600"} sx={{ fontSize: 48 }} />
                        </div>
                        <span className={`font-montserrat font-black text-xl lg:text-2xl tracking-wider uppercase transition-colors duration-500 ${
                            isDark ? 'text-white' : 'text-slate-800'
                        }`}>
                            Pensionista
                        </span>
                        <span className={`text-xs font-bold mt-2 uppercase tracking-widest opacity-80 ${
                            isDark ? 'text-emerald-400' : 'text-emerald-600'
                        }`}>
                            Pensão por Morte
                        </span>
                    </button>

                    {/* Servidor Ativo Card */}
                    <button 
                        onClick={() => onSelect('servidor_ativo')}
                        className={`flex flex-col items-center justify-center w-full md:w-72 lg:w-80 p-8 md:p-10 rounded-3xl border active:scale-[0.97] transition-all duration-200 shadow-xl ${
                            isDark 
                                ? 'border-amber-500/20 bg-gradient-to-b from-amber-950/20 to-amber-900/5 hover:to-amber-900/15 hover:shadow-[0_20px_50px_rgba(120,53,4,0.3)]' 
                                : 'border-amber-200 bg-white hover:bg-amber-50/50 hover:shadow-[0_20px_50px_rgba(245,158,11,0.1)]'
                        } group`}
                        aria-label="Selecionar tipo de atendimento Servidor Ativo"
                    >
                        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-all duration-300 ${
                            isDark 
                                ? 'bg-amber-500/10 border border-amber-500/30' 
                                : 'bg-amber-50 border border-amber-200'
                        }`}>
                            <Business className={isDark ? "text-amber-400" : "text-amber-600"} sx={{ fontSize: 48 }} />
                        </div>
                        <span className={`font-montserrat font-black text-xl lg:text-2xl tracking-wider uppercase transition-colors duration-500 ${
                            isDark ? 'text-white' : 'text-slate-800'
                        }`}>
                            Servidor Ativo
                        </span>
                        <span className={`text-xs font-bold mt-2 uppercase tracking-widest opacity-80 ${
                            isDark ? 'text-amber-400' : 'text-amber-600'
                        }`}>
                            Servidores Municipais
                        </span>
                    </button>
                </div>
            </main>
        </div>
    );
};

export default UserTypeSelectionScreen;
