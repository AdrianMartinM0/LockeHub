import React, { useState } from 'react';

interface Props {
    onUnlock: (pin: string) => boolean;
    roomTitle: string;
}

export const RoomLockScreen: React.FC<Props> = ({ onUnlock, roomTitle }) => {
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const success = onUnlock(pin);
        if (!success) {
            setError(true);
            setPin('');
        }
    };

    return (
        <div className="min-h-screen bg-[#242730] flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-[#31353f] border border-white/10 rounded-2xl p-6 shadow-2xl text-center">
                <div className="w-12 h-12 rounded-xl bg-[#252830] border border-white/10 flex items-center justify-center mx-auto mb-4 text-xl">
                    🔒
                </div>
                <h1 className="text-base font-bold text-white tracking-tight">{roomTitle}</h1>
                <p className="text-xs text-[#9ca3af] mt-1 mb-5">
                    Esta partida es privada. Introduce el PIN de la sala para acceder.
                </p>

                <form onSubmit={handleSubmit} className="space-y-3">
                    <input
                        type="password"
                        autoFocus
                        maxLength={10}
                        value={pin}
                        onChange={(e) => {
                            setPin(e.target.value);
                            setError(false);
                        }}
                        placeholder="PIN de acceso"
                        className="w-full bg-[#252830] border border-white/10 rounded-xl px-4 py-2.5 text-center font-mono text-base tracking-widest text-white focus:outline-none focus:border-white/25"
                    />

                    {error && (
                        <p className="text-xs text-[#fca5a5] bg-[#3f2a2a]/60 border border-[#783e3e]/40 rounded-lg p-2">
                            PIN de sala incorrecto.
                        </p>
                    )}

                    <button
                        type="submit"
                        className="w-full py-2.5 bg-[#474e5d] hover:bg-[#525969] text-white text-xs font-bold rounded-xl border border-white/15 transition-colors"
                    >
                        Entrar a la Partida
                    </button>
                </form>
            </div>
        </div>
    );
};