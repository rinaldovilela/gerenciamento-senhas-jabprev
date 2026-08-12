import React, { useEffect, useState } from 'react';
import { z } from 'zod';
import { useAuth } from '@features/auth/contexts/AuthContext';

const REMEMBERED_EMAIL_KEY = 'jabprev_remembered_email';

const loginSchema = z.object({
    email: z.string().trim().email('Informe um e-mail valido.'),
    password: z.string().min(8, 'A senha deve ter no minimo 8 caracteres.'),
});

export interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    /** Mensagem contextual opcional (ex.: sessao expirada). */
    message?: string;
}

/**
 * Modal de login sobreposto, usado para exigir uma sessao valida antes de
 * emitir senha sem tirar o operador da tela atual do totem.
 */
const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess, message }) => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reaproveita o e-mail lembrado pela tela de login da area restrita.
    useEffect(() => {
        if (!isOpen) return;

        const remembered = localStorage.getItem(REMEMBERED_EMAIL_KEY);
        setEmail(remembered || '');
        setPassword('');
        setError('');
        setFieldErrors({});
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
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

        setIsSubmitting(true);
        const result = await login(parsed.data.email, parsed.data.password);
        setIsSubmitting(false);

        if (result.success) {
            localStorage.setItem(REMEMBERED_EMAIL_KEY, parsed.data.email);
            setPassword('');
            onSuccess();
            return;
        }

        setError(result.error || 'Nao foi possivel entrar. Verifique suas credenciais.');
    };

    return (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-200/60 p-6 sm:p-8 max-w-md w-full shadow-2xl animate-fade-in-up flex flex-col gap-6 text-slate-800">
                <div className="flex flex-col gap-2.5">
                    <img src="/logo-jabprev.png" alt="JaboataoPrev" className="h-10 w-auto object-contain self-start mb-1" />
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">
                        Identificacao do atendente
                    </h2>
                    <p className="text-sm font-semibold text-slate-500 leading-relaxed">
                        {message || 'Faca login com suas credenciais para iniciar o atendimento e emitir senhas.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div>
                        <label htmlFor="login-modal-email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                            E-mail
                        </label>
                        <input
                            id="login-modal-email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            autoFocus
                            required
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-4 focus:ring-jaboatao-blue/10 focus:border-jaboatao-blue focus:bg-white placeholder:text-slate-400 text-sm sm:text-base text-slate-800 transition-all duration-200"
                            placeholder="exemplo@jaboataoprev.pe.gov.br"
                        />
                        {fieldErrors.email && <p className="mt-1.5 text-xs font-semibold text-red-500">{fieldErrors.email}</p>}
                    </div>

                    <div>
                        <label htmlFor="login-modal-password" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                            Senha
                        </label>
                        <input
                            id="login-modal-password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-4 focus:ring-jaboatao-blue/10 focus:border-jaboatao-blue focus:bg-white placeholder:text-slate-400 text-sm sm:text-base text-slate-800 transition-all duration-200"
                            placeholder="********"
                        />
                        {fieldErrors.password && <p className="mt-1.5 text-xs font-semibold text-red-500">{fieldErrors.password}</p>}
                    </div>

                    {error && (
                        <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-xs font-semibold text-red-600">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3 justify-end items-center">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-600 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-3 text-xs font-black uppercase tracking-widest text-white rounded-xl shadow-lg shadow-blue-950/15 bg-gradient-to-r from-jaboatao-blue to-[#2B6CB0] hover:shadow-xl active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Entrando...' : 'Entrar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginModal;
