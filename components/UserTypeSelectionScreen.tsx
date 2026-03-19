import React from 'react';
import type { UserType } from '../types';

interface UserTypeSelectionScreenProps {
    onSelect: (userType: UserType) => void;
    onBack: () => void;
    fullscreenMode?: boolean;
}

const AposentadoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 4.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z"/>
      <path d="M6.52 9.48a4.5 4.5 0 0 1 7.42 2.37c.33.94.46 2.06.46 3.15v2.5"/>
      <path d="M11 17.5v-5a2.5 2.5 0 0 0-5 0v5"/>
      <path d="M6 17.5H4.5"/><path d="M15.5 12.5a2.5 2.5 0 0 1 5 0v5a2.5 2.5 0 0 1-5 0V16a2.5 2.5 0 0 0-2.5-2.5h-1.5"/>
    </svg>
);

const PensionistaIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="8" r="5"/>
      <path d="M20 21a8 8 0 0 0-16 0"/>
    </svg>
);

const ServidorAtivoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
);


const UserTypeSelectionScreen: React.FC<UserTypeSelectionScreenProps> = ({ onSelect, onBack, fullscreenMode }) => {

    return (
        <div className="flex flex-col w-full min-h-screen p-3 sm:p-4 md:p-8 bg-app-bg text-text-primary">
            <header className="flex items-center mb-6 sm:mb-8 justify-between">
                <button 
                    onClick={onBack} 
                    className={`p-2 sm:p-3 rounded-full bg-white hover:bg-slate-100 transition-colors mr-3 sm:mr-4 border border-border-color ${
                        fullscreenMode ? 'hidden landscape:hidden portrait:flex' : 'hidden lg:flex'
                    }`}
                    title="Voltar"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
                </button>
                <h1 className="font-montserrat text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-jaboatao-blue text-center flex-1">Selecione o tipo de atendimento</h1>
            </header>
            
            <main className="flex-grow flex items-center justify-center">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 md:gap-8">
                    <button 
                        onClick={() => onSelect('aposentado')}
                        className="flex flex-col items-center justify-center w-40 sm:w-48 md:w-56 h-40 sm:h-48 md:h-56 bg-jaboatao-blue text-white rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-jaboatao-blue/50 transition-all duration-300 ease-in-out"
                        aria-label="Selecionar tipo de atendimento Aposentado"
                    >
                        <AposentadoIcon className="w-10 sm:w-12 md:w-14 h-10 sm:h-12 md:h-14 mb-2" />
                        <span className="font-semibold text-base sm:text-lg md:text-xl">Aposentado</span>
                    </button>
                    <button 
                        onClick={() => onSelect('pensionista')}
                        className="flex flex-col items-center justify-center w-40 sm:w-48 md:w-56 h-40 sm:h-48 md:h-56 bg-jaboatao-green-prev text-white rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-jaboatao-green-prev/50 transition-all duration-300 ease-in-out"
                        aria-label="Selecionar tipo de atendimento Pensionista"
                    >
                        <PensionistaIcon className="w-10 sm:w-12 md:w-14 h-10 sm:h-12 md:h-14 mb-2" />
                        <span className="font-semibold text-base sm:text-lg md:text-xl">Pensionista</span>
                    </button>
                    <button 
                        onClick={() => onSelect('servidor_ativo')}
                        className="flex flex-col items-center justify-center w-40 sm:w-48 md:w-56 h-40 sm:h-48 md:h-56 bg-jaboatao-yellow text-text-primary rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-jaboatao-yellow/50 transition-all duration-300 ease-in-out"
                        aria-label="Selecionar tipo de atendimento Servidor Ativo"
                    >
                        <ServidorAtivoIcon className="w-10 sm:w-12 md:w-14 h-10 sm:h-12 md:h-14 mb-2" />
                        <span className="font-semibold text-base sm:text-lg md:text-xl">Servidor Ativo</span>
                    </button>
                </div>
            </main>
        </div>
    );
};

export default UserTypeSelectionScreen;
