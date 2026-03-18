
import React from 'react';

interface PrioritySelectionScreenProps {
    onSelect: (isPriority: boolean) => void;
    onBack: () => void;
}

const PrioritySelectionScreen: React.FC<PrioritySelectionScreenProps> = ({ onSelect, onBack }) => {
    return (
        <div className="flex flex-col w-full min-h-screen p-4 md:p-8 bg-app-bg text-text-primary">
            <header className="flex items-center mb-8">
                <button onClick={onBack} className="p-3 rounded-full bg-white hover:bg-slate-100 transition-colors mr-4 border border-border-color">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
                </button>
                <h1 className="font-montserrat text-3xl md:text-4xl font-semibold text-jaboatao-blue">Atendimento Servidor Ativo</h1>
            </header>
            
            <main className="flex-grow flex items-center justify-center">
                <div className="w-full max-w-2xl text-center bg-[#E9EEF6] border-2 border-[#204FA1] p-12 rounded-2xl shadow-lg">
                    <h2 className="text-3xl font-semibold text-text-primary mb-10">O atendimento é prioritário?</h2>
                    <div className="flex flex-col sm:flex-row justify-center gap-8">
                        <button 
                            onClick={() => onSelect(true)}
                            className="w-full sm:w-52 py-5 text-2xl font-bold bg-[#2E8B57] text-white rounded-xl shadow-md hover:opacity-90 transition-opacity transform hover:scale-105"
                        >
                            Sim
                        </button>
                        <button 
                            onClick={() => onSelect(false)}
                            className="w-full sm:w-52 py-5 text-2xl font-bold bg-[#A0AEC0] text-white rounded-xl shadow-md hover:opacity-90 transition-opacity transform hover:scale-105"
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
