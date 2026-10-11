import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import type { Trainer } from '../../types/locke.types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    trainers: Trainer[];
}

export const LoginModal: React.FC<Props> = ({ isOpen, onClose, trainers }) => {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const { loginAsAdmin, loginWithCode } = useAuth();

    if (!isOpen) return null;

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const cleanCode = code.trim().toUpperCase();

        if (loginAsAdmin(cleanCode)) {
            onClose();
            setCode('');
            return;
        }

        const success = loginWithCode(cleanCode, trainers);
        if (success) {
            onClose();
            setCode('');
            return;
        }

        setError('Código incorrecto. Usa el PIN de Admin (9999) o la clave PK de tu entrenador.');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1e2026]/75 backdrop-blur-sm">
            <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-[#31353f] p-6 shadow-2xl text-[#e5e8ee]">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-7 h-7 rounded-lg flex items-center justify-center text-[#9ca3af] hover:text-white hover:bg-white/5 transition-colors"
                >
                    ✕
                </button>

                <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 rounded-xl bg-[#262830] border border-white/10 flex items-center justify-center text-sm font-mono font-bold text-[#f0c760]">
                        PK
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-white tracking-tight">Acceso a la Partida</h2>
                        <p className="text-xs text-[#9ca3af]">Edita tu perfil o entra como Administrador</p>
                    </div>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-[11px] font-mono text-[#cbd5e1] uppercase mb-1.5 font-semibold">
                            Código / PIN
                        </label>
                        <input
                            type="text"
                            autoFocus
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="Ej: PK-ADRI o 9999"
                            className="w-full rounded-xl border border-white/10 bg-[#252830] px-4 py-2.5 text-center text-base font-mono tracking-wider text-white uppercase placeholder:text-[#6b7280] focus:border-white/25 focus:outline-none"
                        />
                    </div>

                    {error && (
                        <p className="text-xs text-[#fca5a5] bg-[#3f2a2a]/60 border border-[#b5543c]/40 rounded-xl p-2.5 text-center">
                            {error}
                        </p>
                    )}

                    <div className="rounded-xl border border-white/5 bg-[#272a33] p-3 text-xs text-[#9ca3af]">
                        PIN de administrador maestro por defecto: <code className="text-[#f0c760] font-mono font-bold">9999</code>.
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-1/2 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-[#cbd5e1] hover:bg-white/5 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="w-1/2 py-2.5 rounded-xl bg-[#474e5d] hover:bg-[#525969] border border-white/15 text-xs font-bold text-white transition-colors"
                        >
                            Entrar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};