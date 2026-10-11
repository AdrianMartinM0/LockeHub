import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AuthState, RoomSettings, Trainer } from '../types/locke.types';

interface AuthContextType {
    auth: AuthState;
    loginWithPin: (pin: string, trainers: Trainer[], settings: RoomSettings) => boolean;
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
                if (['admin', 'player', 'viewer'].includes(parsed.role)) {
                    return parsed;
                }
            } catch {
                return { role: 'locked' };
            }
        }
        return { role: 'locked' };
    });

    useEffect(() => {
        localStorage.setItem('locke_auth', JSON.stringify(auth));
    }, [auth]);

    const loginWithPin = (pin: string, trainers: Trainer[], settings: RoomSettings) => {
        const cleanPin = pin.trim().toUpperCase();

        // 1. PIN de Administrador (definido en settings de la BD)
        if (settings.adminPin && cleanPin === settings.adminPin.trim().toUpperCase()) {
            setAuth({ role: 'admin' });
            return true;
        }

        // 2. PIN / Código de Entrenador (acceso personal del jugador)
        const trainer = trainers.find((t) => t.accessCode.trim().toUpperCase() === cleanPin);
        if (trainer) {
            setAuth({ role: 'player', trainerId: trainer.id });
            return true;
        }

        // 3. PIN General de Sala (acceso espectador solo lectura)
        if (settings.roomPin && cleanPin === settings.roomPin.trim().toUpperCase()) {
            setAuth({ role: 'viewer' });
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
