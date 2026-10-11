import React, { useState } from 'react';

interface Props {
    roomTitle: string;
    onLogin: (pin: string) => boolean;
}

export const PinAuthScreen: React.FC<Props> = ({ roomTitle, onLogin }) => {
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const success = onLogin(pin);
        if (!success) {
            setError(true);
            setPin('');
        }
    };

    return (
        <div className="min-h-screen bg-[#242730] flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-[#31353f] border border-white/10 rounded-2xl p-6 shadow-2xl text-center text-[#e5e8ee]">

                <div className="w-12 h-12 rounded-xl bg-[#252830] border border-white/10 flex items-center justify-center mx-auto mb-4 text-xl shadow-inner">
                    🔒
                </div>

                <h1 className="text-base font-bold text-white tracking-tight">{roomTitle}</h1>
                <p className="text-xs text-[#9ca3af] mt-1 mb-5">
                    Acceso privado. Introduce tu clave de entrenador o el PIN de administración.
                </p>

                <form onSubmit={handleSubmit} className="space-y-3.5">
                    <div>
                        <input
                            type="text"
                            autoFocus
                            value={pin}
                            onChange={(e) => {
                                setPin(e.target.value);
                                setError(false);
                            }}
                            placeholder="Ej: PK-ADRI o 9999"
                            className="w-full bg-[#252830] border border-white/10 rounded-xl px-4 py-2.5 text-center font-mono text-base tracking-widest text-white uppercase placeholder:text-[#6b7280] focus:outline-none focus:border-white/25"
                        />
                    </div>

                    {error && (
                        <p className="text-xs text-[#fca5a5] bg-[#3f2a2a]/60 border border-[#783e3e]/40 rounded-xl p-2.5">
                            Código no reconocido. Revisa las letras o números.
                        </p>
                    )}

                    <button
                        type="submit"
                        className="w-full py-2.5 bg-[#474e5d] hover:bg-[#525969] text-white text-xs font-bold rounded-xl border border-white/15 transition-colors shadow-sm"
                    >
                        Entrar a la Partida
                    </button>
                </form>
            </div>
        </div>
    );
};