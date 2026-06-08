import React, { createContext, useContext, useEffect, useState } from 'react';
import { ApiClient } from '@lib/api';
import type { User, UserRole } from '@shared/types/database';

const AUTH_TOKEN_KEY = 'jabprev_auth_token';

interface AuthUser extends User {
  serviceIds?: string[];
  name?: string;
  avatarUrl?: string;
}

interface AuthContextType {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    updateProfile: (data: { name?: string; password?: string; avatarUrl?: string }) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const parseJwtPayload = (token: string): { id: string; email: string; name?: string; role?: UserRole; serviceIds?: string[]; avatarUrl?: string } | null => {
        try {
            const payload = token.split('.')[1];
            if (!payload) return null;
            const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
            const decoded = JSON.parse(atob(normalized));
            return decoded;
        } catch {
            return null;
        }
    };

    // Restaurar sessão existente via JWT local
    useEffect(() => {
        const restoreSession = () => {
            try {
                const token = localStorage.getItem(AUTH_TOKEN_KEY);
                if (token) {
                    ApiClient.setToken(token);
                    const payload = parseJwtPayload(token);
                    if (payload?.id && payload?.email) {
                        const role = payload.role || 'user';
                        if (!['user', 'operator', 'admin'].includes(role)) {
                            localStorage.removeItem(AUTH_TOKEN_KEY);
                            ApiClient.setToken('');
                            setUser(null);
                            return;
                        }

                        setUser({
                            id: payload.id,
                            email: payload.email,
                            name: payload.name,
                            role,
                            serviceIds: payload.serviceIds || [],
                            avatarUrl: payload.avatarUrl,
                        });
                    }
                }
            } catch (error) {
                console.error('[AuthContext] Erro ao restaurar sessão JWT:', error);
                localStorage.removeItem(AUTH_TOKEN_KEY);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        restoreSession();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            setIsLoading(true);
            const response = await ApiClient.login(email, password) as {
                token: string;
                user: { id: string; email: string; name: string; role: UserRole; serviceIds?: string[]; avatarUrl?: string };
            };

            if (!response?.token || !response?.user) {
                return { success: false, error: 'Resposta de login inválida' };
            }

            ApiClient.setToken(response.token);
            localStorage.setItem(AUTH_TOKEN_KEY, response.token);

            setUser({
                id: response.user.id,
                email: response.user.email,
                name: response.user.name,
                role: response.user.role,
                serviceIds: response.user.serviceIds || [],
                avatarUrl: response.user.avatarUrl,
            });

            return { success: true };
        } catch (error) {
            const rawMessage = error instanceof Error ? error.message : 'Erro de login';
            const message = /Failed to fetch|NetworkError|Load failed/i.test(rawMessage)
                ? 'Nao foi possivel conectar ao servidor. Tente novamente em instantes.'
                : rawMessage;
            return { success: false, error: message };
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            await ApiClient.logout();
        } catch {
            // Mesmo se a API falhar, logout local deve acontecer.
        } finally {
            ApiClient.setToken('');
            localStorage.removeItem(AUTH_TOKEN_KEY);
            setUser(null);
        }
    };

    const updateProfile = async (data: { name?: string; password?: string; avatarUrl?: string }) => {
        try {
            setIsLoading(true);
            const response = await ApiClient.updateProfile(data);
            
            if (response.token) {
                ApiClient.setToken(response.token);
                localStorage.setItem(AUTH_TOKEN_KEY, response.token);
            }
            
            if (response.user) {
                setUser({
                    id: response.user.id,
                    email: response.user.email,
                    name: response.user.name,
                    role: response.user.role,
                    serviceIds: response.user.serviceIds || [],
                    avatarUrl: response.user.avatarUrl,
                });
            }
            
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message || 'Erro ao atualizar perfil' };
        } finally {
            setIsLoading(false);
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
                updateProfile,
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