
import React, { useState, useMemo } from 'react';
import { TRANSLATIONS } from '../constants';
import type { Service, Language } from '../types';
import { useQueue } from '../contexts/QueueContext';
import { 
    Fingerprint, 
    PersonAdd, 
    FamilyRestroom, 
    ReceiptLong, 
    Elderly, 
    HelpCircle 
} from '@mui/icons-material';

interface ServiceSelectionScreenProps {
    onServiceSelected: (service: Service) => void;
    onBack: () => void;
}

const IconRenderer: React.FC<{ iconName: string }> = ({ iconName }) => {
    switch (iconName) {
        case 'fingerprint': return <Fingerprint sx={{ fontSize: 48, color: '#005696' }} />;
        case 'person-add': return <PersonAdd sx={{ fontSize: 48, color: '#005696' }} />;
        case 'family-restroom': return <FamilyRestroom sx={{ fontSize: 48, color: '#005696' }} />;
        case 'receipt-long': return <ReceiptLong sx={{ fontSize: 48, color: '#005696' }} />;
        case 'elderly': return <Elderly sx={{ fontSize: 48, color: '#005696' }} />;
        default: return <HelpCircle sx={{ fontSize: 48, color: '#005696' }} />;
    }
};

const ServiceCard: React.FC<{ service: Service; onClick: (service: Service) => void; }> = ({ service, onClick }) => (
    <button
        onClick={() => onClick(service)}
        className="flex flex-col items-center justify-center text-center p-6 bg-white rounded-2xl shadow-md hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-jaboatao-blue/50 transition-all duration-300 ease-in-out w-full h-full border border-border-color"
    >
        <IconRenderer iconName={service.icon} />
        <h3 className="mt-4 text-xl font-semibold text-text-primary">{service.name}</h3>
        <p className="mt-1 text-sm text-text-secondary">{service.description}</p>
    </button>
);

const ServiceSelectionScreen: React.FC<ServiceSelectionScreenProps> = ({ onServiceSelected, onBack }) => {
    const { services } = useQueue();
    const [searchTerm, setSearchTerm] = useState('');
    const [language] = useState<Language>('pt');

    const filteredServices = useMemo(() => {
        return services.filter(service =>
            service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [services, searchTerm]);

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
                {filteredServices.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredServices.map(service => (
                            <ServiceCard key={service.id} service={service} onClick={onServiceSelected} />
                        ))}
                    </div>
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
