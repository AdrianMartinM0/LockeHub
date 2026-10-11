import React, { useState } from 'react';
import type { Trainer } from '../../types/locke.types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onTrainerCreated: (newTrainer: Trainer) => void;
}

export const CreateTrainerModal: React.FC<Props> = ({ isOpen, onClose, onTrainerCreated }) => {
    const [name, setName] = useState('');
    const [lives, setLives] = useState(30);
    const [avatarData, setAvatarData] = useState<string | undefined>(undefined);

    const generateCode = () => {
        const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `PK-${randomHex}`;
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarData(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        const accessCode = generateCode();
        const newTrainer: Trainer = {
            id: crypto.randomUUID(),
            name: name.trim(),
            avatarUrl: avatarData,
            accessCode,
            lives,
            maxLives: 30,
            badges: Array(8).fill(false),
            party: [],
            graveyard: [], // <-- Clave: inicializado para evitar el fallo de render
        };

        onTrainerCreated(newTrainer);
        setName('');
        setLives(30);
        setAvatarData(undefined);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#181a20]/80 backdrop-blur-sm">
            <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-[#31353f] p-5 shadow-2xl text-[#e5e8ee]">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-lg text-[#9ca3af] hover:text-white"
                >
                    ✕
                </button>

                <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-[#252830] border border-white/10 flex items-center justify-center text-sm font-mono font-bold text-[#7ecd89]">
                        +
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-white tracking-tight">Nuevo Entrenador</h2>
                        <p className="text-xs text-[#9ca3af]">Añade a un compañero a la partida</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3.5">
                    <div>
                        <label className="block text-[10px] font-mono text-[#cbd5e1] uppercase mb-1 font-semibold">
                            Nombre
                        </label>
                        <input
                            type="text"
                            autoFocus
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ej: Marcos"
                            className="w-full bg-[#252830] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-[#6b7280] focus:outline-none focus:border-white/25"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-mono text-[#cbd5e1] uppercase mb-1 font-semibold">
                            Foto de Perfil (Opcional)
                        </label>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#252830] border border-white/10 flex items-center justify-center overflow-hidden font-bold text-xs text-[#9ca3af]">
                                {avatarData ? (
                                    <img src={avatarData} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    (name.slice(0, 2) || '??').toUpperCase()
                                )}
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="text-[11px] text-[#9ca3af] file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-[#424855] file:text-white hover:file:bg-[#4d5463] cursor-pointer"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-mono text-[#cbd5e1] uppercase mb-1 font-semibold">
                            Vidas Iniciales
                        </label>
                        <input
                            type="number"
                            min={1}
                            max={30}
                            value={lives}
                            onChange={(e) => setLives(Number(e.target.value))}
                            className="w-full bg-[#252830] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-white/25"
                        />
                    </div>

                    <div className="rounded-xl border border-white/5 bg-[#252830] p-2.5 text-[11px] text-[#9ca3af]">
                        ℹ️ Se generará automáticamente un código único para que el jugador pueda acceder a su ficha.
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-1/2 py-2 rounded-xl border border-white/10 text-xs font-semibold text-[#cbd5e1] hover:bg-white/5 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="w-1/2 py-2 rounded-xl bg-[#474e5d] hover:bg-[#525969] border border-white/15 text-xs font-bold text-white transition-colors"
                        >
                            Crear Perfil
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};