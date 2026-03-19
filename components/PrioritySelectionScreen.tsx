
import React from 'react';

interface PrioritySelectionScreenProps {
    onSelect: (isPriority: boolean) => void;
    onBack: () => void;
    fullscreenMode?: boolean;
}

const PrioritySelectionScreen: React.FC<PrioritySelectionScreenProps> = ({ onSelect, onBack, fullscreenMode }) => {
    return (
        <div className="flex flex-col w-full h-screen md:min-h-screen p-3 sm:p-4 md:p-8 landscape:p-2 landscape:h-screen bg-app-bg text-text-primary overflow-hidden">
            <header className="flex items-center mb-6 sm:mb-8 landscape:mb-2 justify-between flex-shrink-0">
                <button 
                    onClick={onBack} 
                    className={`p-2 sm:p-3 landscape:p-1.5 rounded-full bg-white hover:bg-slate-100 transition-colors mr-3 sm:mr-4 landscape:mr-2 border border-border-color ${
                        fullscreenMode ? 'hidden landscape:hidden portrait:flex' : 'hidden lg:flex'
                    }`}
                    title="Voltar"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
                </button>
                <h1 className="font-montserrat text-xl sm:text-2xl md:text-3xl lg:text-4xl landscape:text-lg font-semibold text-jaboatao-blue text-center flex-1">Atendimento Servidor Ativo</h1>
            </header>
            
            <main className="flex-grow flex items-center justify-center overflow-hidden">
                <div className="w-full max-w-2xl text-center bg-[#E9EEF6] border-2 border-[#204FA1] p-4 sm:p-6 md:p-8 landscape:p-3 rounded-2xl shadow-lg">
                    <h2 className="text-lg sm:text-2xl md:text-3xl landscape:text-base font-semibold text-text-primary mb-3 sm:mb-6 md:mb-8 landscape:mb-2">O atendimento é prioritário?</h2>
                    <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 md:gap-6 landscape:gap-2">
                        <button 
                            onClick={() => onSelect(true)}
                            className="w-full sm:w-48 md:w-52 landscape:w-32 py-3 sm:py-4 md:py-5 landscape:py-2 text-base sm:text-lg md:text-2xl landscape:text-sm font-bold bg-[#2E8B57] text-white rounded-xl shadow-md hover:opacity-90 transition-opacity transform hover:scale-105"
                        >
                            Sim
                        </button>
                        <button 
                            onClick={() => onSelect(false)}
                            className="w-full sm:w-48 md:w-52 landscape:w-32 py-3 sm:py-4 md:py-5 landscape:py-2 text-base sm:text-lg md:text-2xl landscape:text-sm font-bold bg-[#A0AEC0] text-white rounded-xl shadow-md hover:opacity-90 transition-opacity transform hover:scale-105"
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
