import React from 'react';
import { Elderly, FamilyRestroom, Business, ArrowBack } from '@mui/icons-material';
import type { UserType } from '../types';

interface UserTypeSelectionScreenProps {
    onSelect: (userType: UserType) => void;
    onBack: () => void;
    fullscreenMode?: boolean;
}


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
                    <ArrowBack sx={{ fontSize: 20, color: '#005696' }} />
                </button>
                <h1 className="font-montserrat text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-jaboatao-blue text-center flex-1">Selecione o tipo de atendimento</h1>
            </header>
            
            <main className="flex-grow flex items-center justify-center">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 md:gap-8">
                    <button 
                        onClick={() => onSelect('aposentado')}
                        className="flex flex-col items-center justify-center w-40 sm:w-48 md:w-56 landscape:w-32 h-40 sm:h-48 md:h-56 landscape:h-32 bg-jaboatao-blue text-white rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-jaboatao-blue/50 transition-all duration-300 ease-in-out landscape:text-sm"
                        aria-label="Selecionar tipo de atendimento Aposentado"
                    >
                        <Elderly sx={{ fontSize: 56, mb: 1 }} />
                        <span className="font-semibold text-base sm:text-lg md:text-xl landscape:text-sm">Aposentado</span>
                    </button>
                    <button 
                        onClick={() => onSelect('pensionista')}
                        className="flex flex-col items-center justify-center w-40 sm:w-48 md:w-56 landscape:w-32 h-40 sm:h-48 md:h-56 landscape:h-32 bg-jaboatao-green-prev text-white rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-jaboatao-green-prev/50 transition-all duration-300 ease-in-out landscape:text-sm"
                        aria-label="Selecionar tipo de atendimento Pensionista"
                    >
                        <FamilyRestroom sx={{ fontSize: 56, mb: 1 }} />
                        <span className="font-semibold text-base sm:text-lg md:text-xl landscape:text-sm">Pensionista</span>
                    </button>
                    <button 
                        onClick={() => onSelect('servidor_ativo')}
                        className="flex flex-col items-center justify-center w-40 sm:w-48 md:w-56 landscape:w-32 h-40 sm:h-48 md:h-56 landscape:h-32 bg-jaboatao-yellow text-text-primary rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-jaboatao-yellow/50 transition-all duration-300 ease-in-out landscape:text-sm"
                        aria-label="Selecionar tipo de atendimento Servidor Ativo"
                    >
                        <Business sx={{ fontSize: 56, mb: 1 }} />
                        <span className="font-semibold text-base sm:text-lg md:text-xl landscape:text-sm">Servidor Ativo</span>
                    </button>
                </div>
            </main>
        </div>
    );
};

export default UserTypeSelectionScreen;
