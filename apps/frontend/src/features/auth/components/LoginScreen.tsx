import React, { useState } from 'react';
import { z } from 'zod';
import { useAuth } from '@features/auth/contexts/AuthContext';
import { TRANSLATIONS } from '@shared/constants';
import type { Language } from '@shared/types';


const JaboataoPrevLogo: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`flex items-center ${className}`}>
        <img src="/logo-jabprev.png" alt="JaboatãoPrev" className="h-16 w-auto object-contain" />
    </div>
);

const loginSchema = z.object({
    email: z.string().trim().email('Informe um e-mail valido.'),
    password: z.string().min(8, 'A senha deve ter no minimo 8 caracteres.'),
});


interface LoginScreenProps {
    onLoginSuccess: () => void;
    onBack: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, onBack }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const language: Language = 'pt'; // Simplified

    // Load remembered email
    React.useEffect(() => {
        const remembered = localStorage.getItem('jabprev_remembered_email');
        if (remembered) {
            setEmail(remembered);
            setRememberMe(true);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setFieldErrors({});

        const parsed = loginSchema.safeParse({ email, password });
        if (!parsed.success) {
            const formErrors = parsed.error.flatten().fieldErrors;
            setFieldErrors({
                email: formErrors.email?.[0],
                password: formErrors.password?.[0],
            });
            return;
        }

        setIsLoading(true);
        const result = await login(parsed.data.email, parsed.data.password);
        setIsLoading(false);
        if (result.success) {
            if (rememberMe) {
                localStorage.setItem('jabprev_remembered_email', parsed.data.email);
            } else {
                localStorage.removeItem('jabprev_remembered_email');
            }
            onLoginSuccess();
        } else {
            setError(result.error || TRANSLATIONS.loginError[language]);
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50 relative overflow-hidden">
            {/* Elementos decorativos de fundo no mobile/desktop */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-jaboatao-blue/5 blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-jaboatao-green-prev/5 blur-[120px] pointer-events-none"></div>

            {/* Back Button */}
            <header className="absolute top-0 left-0 p-4 sm:p-6 md:p-8 z-20">
                <button 
                    onClick={onBack} 
                    className="flex items-center gap-2 py-2 px-4 rounded-xl bg-white/80 backdrop-blur-md hover:bg-white transition-all text-text-primary border border-slate-100 shadow-sm hover:shadow-md text-sm sm:text-base active:scale-95 duration-200"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
                    {TRANSLATIONS.back[language]}
                </button>
            </header>

            {/* Left Column: Institutional Tech Visuals (Desktop only) */}
            <div className="hidden md:flex w-1/2 bg-gradient-to-br from-jaboatao-blue via-[#1B3E80] to-[#122A5C] text-white flex-col justify-between p-16 relative overflow-hidden">
                {/* Background image overlay */}
                <div 
                    className="absolute inset-0 opacity-10 bg-cover bg-center mix-blend-overlay pointer-events-none"
                    style={{ backgroundImage: "url('/images/Bandeira/bandeira.jpeg')" }}
                ></div>
                
                {/* Tech circles or design details */}
                <div className="absolute top-[20%] right-[-10%] w-96 h-96 rounded-full border border-white/5 pointer-events-none"></div>
                <div className="absolute top-[15%] right-[-15%] w-[500px] h-[500px] rounded-full border border-white/5 pointer-events-none"></div>
                
                {/* Top content */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
                        <img src="/logo-jabprev.png" alt="JaboatãoPrev" className="h-10 w-auto object-contain brightness-0 invert" />
                    </div>
                    <div>
                        <h2 className="font-montserrat font-bold text-lg leading-tight tracking-wider">JABOATÃO PREV</h2>
                        <p className="text-xs text-white/60 font-semibold uppercase tracking-widest">Previdência Social</p>
                    </div>
                </div>

                {/* Center Content */}
                <div className="relative z-10 my-auto">
                    <span className="inline-block px-3 py-1 bg-white/10 border border-white/10 text-xs font-semibold rounded-full uppercase tracking-wider mb-6">
                        Área Restrita
                    </span>
                    <h1 className="font-montserrat text-4xl lg:text-5xl font-extrabold leading-tight mb-6">
                        Plataforma de<br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-jaboatao-yellow to-amber-300">
                            Gestão de Senhas
                        </span>
                    </h1>
                    <p className="text-white/70 max-w-md text-base leading-relaxed">
                        Acesso exclusivo para servidores credenciados realizarem o controle de atendimento, chamadas de senhas e parametrização do sistema.
                    </p>
                </div>

                {/* Footer Content */}
                <div className="relative z-10 text-xs text-white/40 font-medium flex justify-between">
                    <span>© 2026 Jaboatão Prev. Todos os direitos reservados.</span>
                    <span>v2.4.0</span>
                </div>
            </div>

            {/* Right Column: Form Panel */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-16 z-10">
                <div className="w-full max-w-md bg-white/80 backdrop-blur-xl p-8 sm:p-12 rounded-3xl shadow-[0_20px_50px_rgba(32,79,161,0.05)] border border-white/40 transition-all duration-300 hover:shadow-[0_30px_60px_rgba(32,79,161,0.08)]">
                    
                    {/* Logo for mobile */}
                    <div className="flex md:hidden justify-center mb-8">
                        <img src="/logo-jabprev.png" alt="JaboatãoPrev" className="h-14 w-auto object-contain" />
                    </div>

                    <div className="mb-8 text-center md:text-left">
                        <h1 className="font-montserrat text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight mb-2">
                            {TRANSLATIONS.restrictedAccess[language]}
                        </h1>
                        <p className="text-sm sm:text-base text-text-secondary">
                            {language === 'pt' ? 'Faça login com suas credenciais para continuar.' : 'Please log in to continue.'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-2">
                                {TRANSLATIONS.email[language]}
                            </label>
                            <div className="relative">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-4 focus:ring-jaboatao-blue/10 focus:border-jaboatao-blue focus:bg-white placeholder:text-slate-400 text-sm sm:text-base text-text-primary transition-all duration-200"
                                    placeholder="exemplo@jaboataoprev.pe.gov.br"
                                />
                            </div>
                            {fieldErrors.email && <p className="mt-1.5 text-xs font-semibold text-red-500">{fieldErrors.email}</p>}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-2">
                                {TRANSLATIONS.password[language]}
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-4 focus:ring-jaboatao-blue/10 focus:border-jaboatao-blue focus:bg-white placeholder:text-slate-400 text-sm sm:text-base text-text-primary transition-all duration-200"
                                placeholder="••••••••"
                            />
                            {fieldErrors.password && <p className="mt-1.5 text-xs font-semibold text-red-500">{fieldErrors.password}</p>}
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2.5 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="w-4 h-4 rounded border-slate-300 text-[#204FA1] focus:ring-[#204FA1]/30 cursor-pointer transition-all"
                                />
                                <span className="text-xs font-bold text-slate-500 group-hover:text-slate-800 transition-colors select-none">
                                    Lembrar meu e-mail
                                </span>
                            </label>
                        </div>

                        {error && (
                            <div className="p-3 rounded-xl bg-red-50 border border-red-100 flex gap-2 items-center text-xs font-semibold text-red-600">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                <span>{error}</span>
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-jaboatao-blue/20 text-base font-bold text-white bg-jaboatao-blue hover:bg-[#1E4894] focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-jaboatao-blue disabled:bg-jaboatao-blue/50 active:scale-[0.98] transition-all duration-200"
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>{language === 'pt' ? 'Entrando...' : 'Logging in...'}</span>
                                    </div>
                                ) : (
                                    TRANSLATIONS.login[language]
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
export default LoginScreen;