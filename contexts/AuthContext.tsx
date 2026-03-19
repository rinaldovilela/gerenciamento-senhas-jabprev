
import React, { createContext, useContext, useState, useCallback } from 'react';
import type { User } from '../types';

// Mock users database
const MOCK_USERS: Record<string, { password: string; user: User }> = {
    'admin@gov.br': {
        password: 'admin',
        user: { id: 'user-1', email: 'admin@gov.br', role: 'ADMIN' },
    },
    'operator@gov.br': {
        password: 'operator',
        user: { id: 'user-2', email: 'operator@gov.br', role: 'OPERATOR' },
    },
};

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    const login = useCallback(async (email: string, password: string): Promise<boolean> => {
        return new Promise(resolve => {
            setTimeout(() => { // Simulate network delay
                const userData = MOCK_USERS[email];
                if (userData && userData.password === password) {
                    setUser(userData.user);
                    resolve(true);
                } else {
                    setUser(null);
                    resolve(false);
                }
            }, 500);
        });
    }, []);

    const logout = useCallback(() => {
        setUser(null);
    }, []);

    const isAuthenticated = !!user;

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};