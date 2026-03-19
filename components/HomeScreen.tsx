import React, { useState } from 'react';
import { TRANSLATIONS, TvIcon } from '../constants';
import type { Language } from '../types';

interface HomeScreenProps {
    onStart: () => void;
    onAdminClick: () => void;
    onPublicDisplayClick: () => void;
    onFullscreenMode?: () => void;
}

const JaboataoPrevLogo: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`flex items-center space-x-4 ${className}`}>
        <div className="p-2 bg-jaboatao-blue rounded-md shadow-md">
             <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/>
                <circle cx="12" cy="10" r="3"/>
            </svg>
        </div>
        <div>
            <h1 className="font-montserrat text-2xl font-semibold text-jaboatao-blue">JABOATÃOPREV</h1>
            <p className="text-sm text-text-secondary font-semibold">Compromisso com o Futuro</p>
        </div>
    </div>
);

const HomeScreen: React.FC<HomeScreenProps> = ({ onStart, onAdminClick, onPublicDisplayClick, onFullscreenMode }) => {
    const [language] = useState<Language>('pt');

    return (
        <div className="flex flex-col items-center justify-between w-full min-h-screen p-4 tablet-portrait-p lg:p-8 bg-app-bg text-text-secondary">
            <header className="w-full flex justify-between items-center gap-4 tablet-landscape-compact">
                <JaboataoPrevLogo />
                 <button
                    onClick={onPublicDisplayClick}
                    className="flex items-center gap-2 py-2 px-3 tablet-landscape-text-lg md:px-4 rounded-lg bg-white hover:bg-slate-50 transition-colors text-text-primary border border-border-color shadow-sm text-sm md:text-base"
                    aria-label="Ver painel de senhas"
                >
                    <TvIcon className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="font-semibold hidden sm:inline">Ver Painel</span>
                    <span className="font-semibold sm:hidden">Painel</span>
                </button>
            </header>

            <main className="flex flex-col items-center justify-center flex-grow text-center">
                <div className="bg-white p-6 sm:p-8 lg:p-16 rounded-3xl shadow-lg max-w-2xl w-full border border-border-color">
                    <h2 className="font-montserrat text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-jaboatao-blue mb-4">
                       Atendimento ao Cidadão
                    </h2>
                    <p className="text-base sm:text-lg md:text-xl text-text-secondary mb-8 sm:mb-12">
                       Toque no botão abaixo para retirar sua senha.
                    </p>
                    <button
                        onClick={onStart}
                        className="w-full max-w-md text-xl sm:text-2xl md:text-3xl font-bold bg-jaboatao-blue text-white py-4 sm:py-6 px-8 sm:px-12 rounded-2xl shadow-lg hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-jaboatao-blue/50 transform hover:scale-105 transition-all duration-300"
                    >
                        {TRANSLATIONS.startService[language]}
                    </button>
                </div>
            </main>

            <footer className="w-full text-center border-t border-border-color pt-4">
                <p className="text-xs text-text-secondary">
                    <b>JABOATÃOPREV</b> – Rua Coronel Waldemar Basgal, 576, Piedade/Prazeres, Jaboatão dos Guararapes - PE | CEP: 54.400-171
                </p>
                 <div className="mt-2 flex flex-col sm:flex-row gap-2 justify-center items-center">
                    <button onClick={onAdminClick} className="text-xs text-text-secondary hover:text-jaboatao-blue transition-colors">
                        Acesso Restrito
                    </button>
                    {onFullscreenMode && (
                        <button 
                            onClick={onFullscreenMode} 
                            className="text-xs text-text-secondary hover:text-jaboatao-green-prev transition-colors flex items-center gap-1"
                            title="Modo fullscreen para tablet"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
                            Modo Fullscreen
                        </button>
                    )}
                </div>
            </footer>
        </div>
    );
};

export default HomeScreen;