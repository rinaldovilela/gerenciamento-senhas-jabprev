import React, { useMemo, useState } from 'react';
import type { Service } from '@shared/types';
import { ArrowBack, Person } from '@mui/icons-material';

interface NameInputScreenProps {
    service: Service;
    onSubmit: (attendeeName: string) => void;
    onBack: () => void;
    fullscreenMode?: boolean;
}

const NameInputScreen: React.FC<NameInputScreenProps> = ({ service, onSubmit, onBack, fullscreenMode }) => {
    const [name, setName] = useState('');

    const isValid = useMemo(() => name.trim().length >= 3, [name]);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        if (!isValid) {
            return;
        }

        onSubmit(name.trim());
    };

    return (
        <div className="flex flex-col w-full h-screen md:min-h-screen p-4 md:p-8 landscape:p-3 landscape:h-screen bg-app-bg text-text-primary overflow-hidden">
            <header className="flex items-center mb-6 md:mb-8 landscape:mb-2 justify-between flex-shrink-0">
                <button
                    onClick={onBack}
                    className="p-3 landscape:p-1.5 rounded-full bg-white hover:bg-slate-100 transition-colors mr-4 landscape:mr-2 border border-border-color flex"
                    title="Voltar"
                >
                    <ArrowBack sx={{ fontSize: 24, color: '#005696' }} />
                </button>
                <h1 className="font-montserrat text-3xl md:text-4xl landscape:text-lg font-semibold text-jaboatao-blue flex-1 text-center">
                    Nome da Pessoa Atendida
                </h1>
            </header>

            <main className="flex-grow flex items-center justify-center">
                <form onSubmit={handleSubmit} className="w-full max-w-2xl bg-white border border-border-color rounded-2xl shadow-lg p-5 md:p-8 landscape:p-4">
                    <p className="text-text-secondary mb-3 md:mb-4 text-sm md:text-base">
                        Servico selecionado: <span className="font-semibold text-text-primary">{service.name}</span>
                    </p>

                    <label htmlFor="attendeeName" className="block text-sm md:text-base font-semibold text-text-primary mb-2">
                        Digite o nome de quem sera atendido
                    </label>

                    <div className="relative">
                        <Person className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                        <input
                            id="attendeeName"
                            type="text"
                            autoFocus
                            maxLength={120}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ex.: Maria da Silva"
                            className="w-full pl-11 pr-3 py-3 md:py-4 text-base md:text-lg bg-white border border-border-color rounded-xl focus:outline-none focus:ring-2 focus:ring-jaboatao-blue focus:border-transparent"
                        />
                    </div>

                    <p className="mt-2 text-xs md:text-sm text-text-secondary">
                        Minimo de 3 caracteres.
                    </p>

                    <div className={`mt-5 md:mt-7 grid gap-3 ${fullscreenMode ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'}`}>
                        <button
                            type="button"
                            onClick={onBack}
                            className="w-full py-3 rounded-xl border border-border-color bg-white text-text-primary font-semibold hover:bg-slate-50 transition-colors"
                        >
                            Voltar
                        </button>
                        <button
                            type="submit"
                            disabled={!isValid}
                            className="w-full py-3 rounded-xl bg-jaboatao-blue text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Gerar senha
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default NameInputScreen;
