import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { TRANSLATIONS } from '../constants';
import type { Language } from '../types';
import MetricsDashboard from './MetricsDashboard';
import AttendanceTrackingScreen from './AttendanceTrackingScreen';

const language: Language = 'pt';

const JaboataoPrevLogo: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`flex items-center space-x-3 ${className}`}>
        <div className="p-2 bg-jaboatao-blue rounded-md shadow-md">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/>
                <circle cx="12" cy="10" r="3"/>
            </svg>
        </div>
        <div>
            <h1 className="font-montserrat text-lg font-semibold text-jaboatao-blue">JABOATÃOPREV</h1>
        </div>
    </div>
);


const MetricsIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18.7 8a2.3 2.3 0 0 0-3.4 0l-4.6 4.6a2.3 2.3 0 0 0 0 3.4l2.6 2.6a2.3 2.3 0 0 0 3.4 0l4.6-4.6a2.3 2.3 0 0 0 0-3.4Z"/></svg>;
const TrackingIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>;
const LogoutIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;

const NavButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode; label: string; }> = ({ active, onClick, children, label }) => (
    <button
        onClick={onClick}
        className={`flex items-center w-full px-4 py-3 text-sm font-semibold rounded-lg transition-colors duration-200 ${
        active ? 'bg-jaboatao-blue text-white shadow-md' : 'text-text-secondary hover:bg-jaboatao-blue/10 hover:text-jaboatao-blue'
        }`}
    >
        <span className="mr-3">{children}</span>
        {label}
    </button>
);


const RestrictedArea: React.FC<{ onExit: () => void }> = ({ onExit }) => {
    const { user, logout } = useAuth();
    const [view, setView] = useState<'tracking' | 'metrics'>('tracking');

    const handleLogout = () => {
        logout();
        onExit();
    };

    if (!user) {
        onExit();
        return null;
    }

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-border-color flex flex-col p-4 shadow-sm">
                <div className="mb-8">
                    <JaboataoPrevLogo />
                </div>

                <nav className="flex-grow space-y-2">
                    <NavButton label="Acompanhamento de Senhas" onClick={() => setView('tracking')} active={view === 'tracking'}>
                        <TrackingIcon />
                    </NavButton>
                    {user.role === 'ADMIN' && (
                        <NavButton label="Painel de Métricas" onClick={() => setView('metrics')} active={view === 'metrics'}>
                            <MetricsIcon />
                        </NavButton>
                    )}
                </nav>

                <div className="border-t border-border-color pt-4">
                    <div className="px-2 mb-4">
                        <p className="text-sm font-semibold text-text-primary truncate">{user.email}</p>
                        <p className="text-xs text-text-secondary">{user.role}</p>
                    </div>
                    <button onClick={handleLogout} className="flex items-center w-full px-4 py-3 text-sm font-semibold rounded-lg text-text-secondary hover:bg-red-500/10 hover:text-red-600 transition-colors duration-200">
                        <span className="mr-3"><LogoutIcon /></span>
                        {TRANSLATIONS.logout[language]}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-grow p-4 md:p-8 overflow-y-auto">
                {view === 'tracking' && <AttendanceTrackingScreen />}
                {view === 'metrics' && user.role === 'ADMIN' && <MetricsDashboard />}
            </main>
        </div>
    );
};

export default RestrictedArea;