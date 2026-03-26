import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@lib/supabase/client';
import type { User, UserRole } from '@shared/types/database';

interface AuthUser extends User {
    session?: any;
}

interface AuthContextType {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Restaurar sessão existente
    useEffect(() => {
        const restoreSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                
                if (session?.user) {
                    // Aqui você pode buscar dados adicionais do perfil se necessário
                    // Por enquanto usaremos o email para determinar o role ou metadados
                    setUser({
                        id: session.user.id,
                        email: session.user.email!,
                        role: (session.user.user_metadata?.role as UserRole) || 'OPERATOR',
                    });
                }
            } catch (error) {
                console.error('[AuthContext] Erro ao restaurar sessão:', error);
            } finally {
                setIsLoading(false);
            }
        };

        restoreSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setUser({
                    id: session.user.id,
                    email: session.user.email!,
                    role: (session.user.user_metadata?.role as UserRole) || 'OPERATOR',
                });
            } else {
                setUser(null);
            }
            setIsLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const login = async (email: string, password: string) => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                return { success: false, error: error.message };
            }

            if (data.user) {
                setUser({
                    id: data.user.id,
                    email: data.user.email!,
                    role: (data.user.user_metadata?.role as UserRole) || 'OPERATOR',
                });
                return { success: true };
            }

            return { success: false, error: 'Falha desconhecida' };
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Erro de login';
            return { success: false, error: message };
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            await supabase.auth.signOut();
            setUser(null);
        } catch (error) {
            console.error('[AuthContext] Erro ao fazer logout:', error);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de AuthProvider');
    }
    return context;
};