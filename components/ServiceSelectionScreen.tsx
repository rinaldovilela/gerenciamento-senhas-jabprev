import React, { useState, useMemo } from 'react';
import { SERVICES, TRANSLATIONS } from '../constants';
import type { Service, Language } from '../types';

interface ServiceSelectionScreenProps {
    onServiceSelected: (service: Service) => void;
    onBack: () => void;
}

const ServiceCard: React.FC<{ service: Service; onClick: (service: Service) => void; }> = ({ service, onClick }) => (
    <button
        onClick={() => onClick(service)}
        className="flex flex-col items-center justify-center text-center p-6 bg-white rounded-2xl shadow-md hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-jaboatao-blue/50 transition-all duration-300 ease-in-out w-full h-full border border-border-color"
    >
        {service.icon}
        <h3 className="mt-4 text-xl font-semibold text-text-primary">{service.name}</h3>
        <p className="mt-1 text-sm text-text-secondary">{service.description}</p>
    </button>
);

const ServiceSelectionScreen: React.FC<ServiceSelectionScreenProps> = ({ onServiceSelected, onBack }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [language] = useState<Language>('pt'); // Simplified for this component

    const filteredServices = useMemo(() => {
        return SERVICES.filter(service =>
            service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    const servicesByCategory = useMemo(() => {
        return filteredServices.reduce<Record<string, Service[]>>((acc, service) => {
            (acc[service.category] = acc[service.category] || []).push(service);
            return acc;
        }, {});
    }, [filteredServices]);

    return (
        <div className="flex flex-col w-full min-h-screen p-4 md:p-8 bg-app-bg text-text-primary">
            <header className="flex items-center mb-8">
                <button onClick={onBack} className="p-3 rounded-full bg-white hover:bg-slate-100 transition-colors mr-4 border border-border-color">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
                </button>
                <h1 className="font-montserrat text-3xl md:text-4xl font-semibold text-jaboatao-blue">{TRANSLATIONS.selectService[language]}</h1>
            </header>
            
            <div className="mb-8">
                <input
                    type="search"
                    placeholder={TRANSLATIONS.searchService[language]}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-4 text-lg bg-white border border-border-color rounded-xl focus:outline-none focus:ring-2 focus:ring-jaboatao-blue focus:border-transparent transition-shadow placeholder:text-text-secondary text-text-primary"
                />
            </div>

            <main className="flex-grow overflow-y-auto">
                {Object.keys(servicesByCategory).length > 0 ? (
                    // FIX: Replaced Object.entries with Object.keys to work around a type inference issue where the value in [key, value] pairs was being inferred as 'unknown'.
                    Object.keys(servicesByCategory).map((category) => (
                        <section key={category} className="mb-10">
                            <h2 className="text-2xl font-semibold text-text-secondary mb-6 pb-2 border-b-2 border-border-color">{category}</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {servicesByCategory[category].map(service => (
                                    <ServiceCard key={service.id} service={service} onClick={onServiceSelected} />
                                ))}
                            </div>
                        </section>
                    ))
                ) : (
                    <div className="text-center py-16">
                        <p className="text-xl text-text-secondary">Nenhum serviço encontrado.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ServiceSelectionScreen;