
import React from 'react';

interface PrioritySelectionScreenProps {
    onSelect: (isPriority: boolean) => void;
    onBack: () => void;
    fullscreenMode?: boolean;
}

const PrioritySelectionScreen: React.FC<PrioritySelectionScreenProps> = ({ onSelect, onBack, fullscreenMode }) => {
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
                <h1 className="font-montserrat text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-jaboatao-blue text-center flex-1">Atendimento Servidor Ativo</h1>
            </header>
            
            <main className="flex-grow flex items-center justify-center">
                <div className="w-full max-w-2xl text-center bg-[#E9EEF6] border-2 border-[#204FA1] p-6 sm:p-8 md:p-12 rounded-2xl shadow-lg">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-text-primary mb-6 sm:mb-8 md:mb-10">O atendimento é prioritário?</h2>
                    <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 md:gap-8">
                        <button 
                            onClick={() => onSelect(true)}
                            className="w-full sm:w-48 md:w-52 py-4 sm:py-5 text-lg sm:text-xl md:text-2xl font-bold bg-[#2E8B57] text-white rounded-xl shadow-md hover:opacity-90 transition-opacity transform hover:scale-105"
                        >
                            Sim
                        </button>
                        <button 
                            onClick={() => onSelect(false)}
                            className="w-full sm:w-48 md:w-52 py-4 sm:py-5 text-lg sm:text-xl md:text-2xl font-bold bg-[#A0AEC0] text-white rounded-xl shadow-md hover:opacity-90 transition-opacity transform hover:scale-105"
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
