import React, { useState } from 'react';
import { useAuth } from '@features/auth/contexts/AuthContext';
import { TRANSLATIONS } from '@shared/constants';
import type { Language } from '@shared/types';
import { Menu, Close } from '@mui/icons-material';
import MetricsDashboard from './MetricsDashboard';
import AttendanceTrackingScreen from './AttendanceTrackingScreen';
import UserManagementScreen from './UserManagementScreen';
import ServiceManagementScreen from './ServiceManagementScreen';

const language: Language = 'pt';

const JaboataoPrevLogo: React.FC<{ className?: string; dark?: boolean }> = ({ className, dark }) => (
    <div className={`flex items-center gap-3 ${className}`}>
        <div className={`p-2.5 rounded-xl border transition-all duration-300 ${dark ? 'bg-white/10 border-white/10' : 'bg-slate-100 border-slate-200'}`}>
            <img 
                src="/logo-jabprev.png" 
                alt="JaboatãoPrev" 
                className={`h-7 w-auto object-contain transition-all duration-300 ${dark ? 'brightness-0 invert' : ''}`} 
            />
        </div>
        <div className="flex flex-col">
            <span className={`font-montserrat font-extrabold text-sm tracking-wider leading-none ${dark ? 'text-white' : 'text-[#204FA1]'}`}>JABOATÃO</span>
            <span className={`font-poppins font-bold text-[10px] tracking-widest leading-none mt-1 ${dark ? 'text-amber-400' : 'text-slate-505'}`}>PREV</span>
        </div>
    </div>
);

const MetricsIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18.7 8a2.3 2.3 0 0 0-3.4 0l-4.6 4.6a2.3 2.3 0 0 0 0 3.4l2.6 2.6a2.3 2.3 0 0 0 3.4 0l4.6-4.6a2.3 2.3 0 0 0 0-3.4Z"/></svg>;
const TrackingIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>;
const UsersIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M20 8v6"/><path d="M23 11h-6"/></svg>;
const ServicesIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>;
const LogoutIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;

const NavButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode; label: string; }> = ({ active, onClick, children, label }) => (
    <button
        onClick={onClick}
        className={`flex items-center w-full px-4 py-3.5 text-sm font-bold rounded-2xl transition-all duration-200 group active:scale-[0.98] ${
        active 
            ? 'bg-gradient-to-r from-jaboatao-yellow to-amber-500 text-slate-950 shadow-lg shadow-amber-500/15' 
            : 'text-slate-400 hover:bg-white/5 hover:text-white'
        }`}
    >
        <span className={`mr-3 transition-transform duration-200 group-hover:scale-110 ${active ? 'text-slate-950' : 'text-slate-400 group-hover:text-white'}`}>{children}</span>
        <span>{label}</span>
    </button>
);

const RestrictedArea: React.FC<{ onExit: () => void }> = ({ onExit }) => {
    const { user, logout } = useAuth();
    const [view, setView] = useState<'tracking' | 'metrics' | 'users' | 'services'>('tracking');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        onExit();
    };

    const handleNavClick = (targetView: typeof view) => {
        setView(targetView);
        setIsMobileMenuOpen(false);
    };

    if (!user) {
        onExit();
        return null;
    }

    return (
        <div 
            className="flex flex-col lg:flex-row min-h-screen bg-cover bg-center bg-no-repeat relative overflow-hidden"
            style={{ backgroundImage: 'url("/images/Bandeira/bandeira.jpeg")' }}
        >
            {/* Backdrop Blur + Dark Gradient Overlay */}
            <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-[6px] pointer-events-none z-0"></div>

            {/* Mobile Backdrop Overlay */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                ></div>
            )}

            {/* Sidebar Drawer */}
            <aside className={`
                fixed lg:static top-0 left-0 bottom-0 w-80 shrink-0 
                bg-slate-950/95 lg:bg-slate-950/75 backdrop-blur-md text-white 
                flex flex-col p-6 m-0 lg:m-4 lg:mr-0 
                rounded-none lg:rounded-3xl border-r lg:border border-white/10 
                shadow-2xl z-50 lg:z-10 transition-transform duration-300 ease-in-out
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Logo e Titulo */}
                <div className="flex items-center justify-between mb-10 px-2">
                    <JaboataoPrevLogo dark />
                    <button 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="lg:hidden p-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl transition-all"
                        aria-label="Fechar Menu"
                    >
                        <Close sx={{ fontSize: 20 }} className="text-white" />
                    </button>
                </div>

                {/* Navegação */}
                <nav className="flex-grow space-y-2">
                    <NavButton label="Controle de Senhas" onClick={() => handleNavClick('tracking')} active={view === 'tracking'}>
                        <TrackingIcon />
                    </NavButton>
                    {user.role === 'admin' && (
                        <NavButton label="Painel de Métricas" onClick={() => handleNavClick('metrics')} active={view === 'metrics'}>
                            <MetricsIcon />
                        </NavButton>
                    )}
                    {user.role === 'admin' && (
                        <NavButton label="Gestão de Usuários" onClick={() => handleNavClick('users')} active={view === 'users'}>
                            <UsersIcon />
                        </NavButton>
                    )}
                    {user.role === 'admin' && (
                        <NavButton label="Gestão de Serviços" onClick={() => handleNavClick('services')} active={view === 'services'}>
                            <ServicesIcon />
                        </NavButton>
                    )}
                </nav>

                {/* Perfil Operador e Logout */}
                <div className="border-t border-white/10 pt-6 mt-6">
                    <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-2xl mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-jaboatao-blue to-[#407BDE] flex items-center justify-center font-bold text-white shadow-md">
                            {user.email.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-grow min-w-0">
                            <p className="text-sm font-bold text-white truncate">{user.email}</p>
                            <span className="inline-block px-2 py-0.5 bg-jaboatao-yellow/10 border border-jaboatao-yellow/20 rounded-md text-[10px] font-bold text-jaboatao-yellow uppercase tracking-wider mt-0.5">
                                {user.role}
                            </span>
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleLogout} 
                        className="flex items-center justify-center w-full px-4 py-3 text-sm font-bold rounded-2xl text-red-400 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/20 active:scale-[0.98] transition-all duration-200"
                    >
                        <span className="mr-3"><LogoutIcon /></span>
                        {TRANSLATIONS.logout[language]}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-grow p-4 md:p-6 lg:p-8 overflow-y-auto h-screen z-10 flex flex-col min-w-0">
                {/* Mobile Top Header */}
                <div className="flex lg:hidden justify-between items-center bg-slate-950/60 backdrop-blur-md border border-white/10 rounded-2xl p-4 mb-4 text-white">
                    <JaboataoPrevLogo dark />
                    <button 
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl active:scale-95 transition-all"
                        aria-label="Abrir Menu"
                    >
                        <Menu className="text-white" />
                    </button>
                </div>

                <div className="flex-grow bg-white/70 backdrop-blur-xl border border-white/30 rounded-3xl p-4 sm:p-6 lg:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.15)] flex flex-col overflow-y-auto">
                    {view === 'tracking' && <AttendanceTrackingScreen />}
                    {view === 'metrics' && user.role === 'admin' && <MetricsDashboard />}
                    {view === 'users' && user.role === 'admin' && <UserManagementScreen />}
                    {view === 'services' && user.role === 'admin' && <ServiceManagementScreen />}
                </div>
            </main>
        </div>
    );
};

export default RestrictedArea;