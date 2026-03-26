import React, { useState } from 'react';
import { useAuth } from '@features/auth/contexts/AuthContext';
import { TRANSLATIONS } from '@shared/constants';
import type { Language } from '@shared/types';


const JaboataoPrevLogo: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`flex items-center ${className}`}>
        <img src="/logo-jabprev.png" alt="JaboatãoPrev" className="h-16 w-auto object-contain" />
    </div>
);


interface LoginScreenProps {
    onLoginSuccess: () => void;
    onBack: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, onBack }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const language: Language = 'pt'; // Simplified

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        const success = await login(email, password);
        setIsLoading(false);
        if (success) {
            onLoginSuccess();
        } else {
            setError(TRANSLATIONS.loginError[language]);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8 bg-app-bg">
             <header className="absolute top-0 left-0 p-3 sm:p-4 md:p-8">
                <button onClick={onBack} className="flex items-center gap-2 py-2 px-3 sm:px-4 rounded-lg bg-white hover:bg-slate-50 transition-colors text-text-primary border border-border-color text-sm sm:text-base">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
                    {TRANSLATIONS.back[language]}
                </button>
            </header>
            <div className="w-full max-w-md bg-white p-6 sm:p-8 md:p-12 rounded-2xl shadow-xl border border-border-color">
                <div className="flex justify-center mb-8">
                    <JaboataoPrevLogo />
                </div>
                <h1 className="font-montserrat text-xl sm:text-2xl font-semibold text-center text-text-primary mb-2">
                    {TRANSLATIONS.restrictedAccess[language]}
                </h1>
                <p className="text-center text-sm sm:text-base text-text-secondary mb-6 sm:mb-8">
                    {language === 'pt' ? 'Faça login para continuar.' : 'Please log in to continue.'}
                </p>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
                            {TRANSLATIONS.email[language]}
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 sm:p-3 bg-white border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-jaboatao-blue placeholder:text-text-secondary text-sm sm:text-base text-text-primary"
                            placeholder="admin@gov.br"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-2">
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
                            className="w-full p-2 sm:p-3 bg-white border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-jaboatao-blue placeholder:text-text-secondary text-sm sm:text-base text-text-primary"
                            placeholder="••••••••"
                        />
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-lg font-medium text-white bg-jaboatao-blue hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-jaboatao-blue disabled:bg-jaboatao-blue/50"
                        >
                            {isLoading ? (language === 'pt' ? 'Entrando...' : 'Logging in...') : TRANSLATIONS.login[language]}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default LoginScreen;