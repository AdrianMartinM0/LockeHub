import React, { useState } from 'react';
import type { Trainer, Pokemon } from '../../types/locke.types';

interface Props {
    trainer: Trainer | null;
    isOpen: boolean;
    onClose: () => void;
    onConfirmFaint: (trainerId: string, pokemonId: string) => void;
}

export const FaintModal: React.FC<Props> = ({ trainer, isOpen, onClose, onConfirmFaint }) => {
    const [selectedId, setSelectedId] = useState('');

    if (!isOpen || !trainer) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedId) {
            onConfirmFaint(trainer.id, selectedId);
        }
        setSelectedId('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#181a20]/80 backdrop-blur-sm">
            <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-[#31353f] p-5 shadow-2xl text-[#e5e8ee]">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-[#3f2a2a] border border-[#783e3e] flex items-center justify-center text-sm font-bold text-[#fca5a5]">
                        ♥
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-white">Vida restada (-1)</h2>
                        <p className="text-xs text-[#9ca3af]">¿Ha caído algún Pokémon del equipo?</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3.5">
                    <div>
                        <label className="block text-[11px] font-mono text-[#cbd5e1] uppercase mb-1 font-semibold">
                            Pokémon Caído
                        </label>
                        <select
                            value={selectedId}
                            onChange={(e) => setSelectedId(e.target.value)}
                            className="w-full bg-[#252830] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/25"
                        >
                            <option value="">Ninguno (solo restar vida)</option>
                            {trainer.party.map((pkm: Pokemon) => (
                                <option key={pkm.id} value={pkm.id}>
                                    {pkm.name} (Nv.{pkm.level} - {pkm.species})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-1/2 py-2 text-xs font-semibold rounded-xl border border-white/10 text-[#9ca3af] hover:text-white transition-colors"
                        >
                            Solo restar vida
                        </button>
                        <button
                            type="submit"
                            className="w-1/2 py-2 text-xs font-bold rounded-xl bg-[#474e5d] hover:bg-[#525969] text-white transition-colors"
                        >
                            {selectedId ? 'Mover a Bajas' : 'Aceptar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};