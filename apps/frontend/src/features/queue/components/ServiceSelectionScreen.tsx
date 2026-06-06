import React, { useState, useMemo } from 'react';
import { TRANSLATIONS } from '@shared/constants';
import type { Service, Language } from '@shared/types';
import { useTodayQueue } from '@features/queue/contexts/TodayQueueContext';
import { 
    Fingerprint, 
    PersonAdd, 
    FamilyRestroom, 
    ReceiptLong, 
    Elderly, 
    Help,
    ArrowBack,
    Search
} from '@mui/icons-material';
import { JaboataoPrevLogo } from '@shared/components/Logo';

interface ServiceSelectionScreenProps {
    onServiceSelected: (service: Service) => void;
    onBack: () => void;
    fullscreenMode?: boolean;
    theme?: 'light' | 'dark';
}

const IconRenderer: React.FC<{ iconName: string; theme: 'light' | 'dark' }> = ({ iconName, theme }) => {
    const isDark = theme === 'dark';
    const color = isDark ? '#60A5FA' : '#204FA1';
    
    switch (iconName) {
        case 'fingerprint': return <Fingerprint sx={{ fontSize: 44, color }} />;
        case 'person-add': return <PersonAdd sx={{ fontSize: 44, color }} />;
        case 'family-restroom': return <FamilyRestroom sx={{ fontSize: 44, color }} />;
        case 'receipt-long': return <ReceiptLong sx={{ fontSize: 44, color }} />;
        case 'elderly': return <Elderly sx={{ fontSize: 44, color }} />;
        default: return <Help sx={{ fontSize: 44, color }} />;
    }
};

const ServiceCard: React.FC<{ 
    service: Service; 
    onClick: (service: Service) => void; 
    theme: 'light' | 'dark';
}> = ({ service, onClick, theme }) => {
    const isDark = theme === 'dark';

    return (
        <button
            onClick={() => onClick(service)}
            className={`flex flex-col items-center justify-center text-center p-8 border active:scale-[0.97] transition-all duration-200 shadow-xl w-full h-full group rounded-3xl ${
                isDark 
                    ? 'bg-slate-900/60 border-white/10 hover:border-blue-500/30 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]' 
                    : 'bg-white border-slate-200 hover:border-[#204FA1]/40 hover:shadow-[0_20px_40px_rgba(30,41,59,0.08)]'
            }`}
        >
            <div className={`w-18 h-18 rounded-2xl flex items-center justify-center mb-4 shadow-inner group-hover:scale-105 transition-transform duration-300 ${
                isDark 
                    ? 'bg-blue-500/10 border border-blue-500/20' 
                    : 'bg-blue-50 border border-blue-100'
            }`}>
                <IconRenderer iconName={service.icon} theme={theme} />
            </div>
            <h3 className={`text-lg font-montserrat font-black tracking-tight leading-snug uppercase mt-2 transition-colors duration-500 ${
                isDark ? 'text-white' : 'text-slate-800'
            }`}>
                {service.name}
            </h3>
            <p className={`mt-2 text-xs font-semibold leading-relaxed transition-colors duration-500 ${
                isDark ? 'text-slate-400' : 'text-slate-500'
            }`}>
                {service.description}
            </p>
        </button>
    );
};

const ServiceSelectionScreen: React.FC<ServiceSelectionScreenProps> = ({ 
    onServiceSelected, 
    onBack, 
    fullscreenMode,
    theme = 'dark'
}) => {
    const { services } = useTodayQueue();
    const [searchTerm, setSearchTerm] = useState('');
    const [language] = useState<Language>('pt');
    const isDark = theme === 'dark';

    const filteredServices = useMemo(() => {
        return services.filter(service =>
            service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [services, searchTerm]);

    return (
        <div className={`flex flex-col w-full h-screen max-h-screen p-6 md:p-12 relative overflow-hidden select-none transition-colors duration-500 ${
            isDark 
                ? 'bg-gradient-to-tr from-[#081325] via-[#0c1a30] to-[#050b14] text-white' 
                : 'bg-gradient-to-tr from-[#f8fafc] via-[#e2e8f0] to-[#cbd5e1] text-slate-800'
        }`}>
            <style dangerouslySetInnerHTML={{__html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: ${isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)'};
                    border-radius: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: ${isDark ? 'rgba(96, 165, 250, 0.3)' : 'rgba(32, 79, 161, 0.3)'};
                    border-radius: 8px;
                    border: 2px solid transparent;
                    background-clip: padding-box;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: ${isDark ? 'rgba(96, 165, 250, 0.5)' : 'rgba(32, 79, 161, 0.5)'};
                    border: 2px solid transparent;
                    background-clip: padding-box;
                }
            `}} />

            {/* Background glowing ambient light */}
            <div className={`absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full blur-[150px] pointer-events-none transition-colors duration-500 ${
                isDark ? 'bg-blue-500/10' : 'bg-blue-200/40'
            }`}></div>
            <div className={`absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full blur-[150px] pointer-events-none transition-colors duration-500 ${
                isDark ? 'bg-emerald-500/10' : 'bg-emerald-250/20'
            }`}></div>

            <header className="flex items-center mb-6 md:mb-8 justify-between flex-shrink-0 z-10">
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
                    {TRANSLATIONS.selectService[language]}
                </h1>
            </header>
            
            <div className="mb-6 md:mb-8 flex-shrink-0 z-10 max-w-xl mx-auto w-full relative">
                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-500 ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                }`} sx={{ fontSize: 22 }} />
                <input
                    type="search"
                    placeholder={TRANSLATIONS.searchService[language]}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-12 pr-4 py-4 text-base md:text-lg backdrop-blur-2xl rounded-2xl focus:outline-none focus:ring-2 focus:border-transparent transition-all font-medium shadow-inner ${
                        isDark 
                            ? 'bg-slate-900/60 border border-white/10 text-white focus:ring-blue-500/40 placeholder:text-slate-500' 
                            : 'bg-white border border-slate-200 text-slate-800 focus:ring-[#204FA1]/40 placeholder:text-slate-400 shadow-sm'
                    }`}
                />
            </div>

            <main className="flex-grow overflow-y-auto overflow-x-hidden z-10 pr-1 custom-scrollbar">
                {filteredServices.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto pb-4">
                        {filteredServices.map(service => (
                            <ServiceCard key={service.id} service={service} onClick={onServiceSelected} theme={theme} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <p className={`text-lg font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Nenhum serviço encontrado.
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ServiceSelectionScreen;
