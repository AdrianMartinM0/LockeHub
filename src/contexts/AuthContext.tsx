import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AuthState } from '../types/locke.types';

interface AuthContextType {
    auth: AuthState;
    loginWithPin: (pin: string, trainers: { id: string; accessCode: string }[]) => boolean;
    logout: () => void;
    canEditTrainer: (trainerId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [auth, setAuth] = useState<AuthState>(() => {
        const saved = localStorage.getItem('locke_auth');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.role === 'admin' || parsed.role === 'player') {
                    return parsed;
                }
            } catch {
                return { role: 'locked' };
            }
        }
        return { role: 'locked' };
    });

    const ADMIN_PIN = '9999';

    useEffect(() => {
        localStorage.setItem('locke_auth', JSON.stringify(auth));
    }, [auth]);

    const loginWithPin = (pin: string, trainers: { id: string; accessCode: string }[]) => {
        const cleanPin = pin.trim().toUpperCase();

        // Comprobar PIN de Admin
        if (cleanPin === ADMIN_PIN) {
            setAuth({ role: 'admin' });
            return true;
        }

        // Comprobar PIN de Entrenador
        const trainer = trainers.find((t) => t.accessCode.toUpperCase() === cleanPin);
        if (trainer) {
            setAuth({ role: 'player', trainerId: trainer.id });
            return true;
        }

        return false;
    };

    const logout = () => {
        setAuth({ role: 'locked' });
        localStorage.removeItem('locke_auth');
    };

    const canEditTrainer = (trainerId: string) => {
        return auth.role === 'admin' || (auth.role === 'player' && auth.trainerId === trainerId);
    };

    return (
        <AuthContext.Provider value={{ auth, loginWithPin, logout, canEditTrainer }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};