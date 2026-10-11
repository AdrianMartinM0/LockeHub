import React from 'react';
import type { Trainer, Pokemon } from '../../types/locke.types';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
    trainer: Trainer | null;
    isOpen: boolean;
    onClose: () => void;
    onRevive: (trainerId: string, pokemonId: string) => void;
    onDeleteFainted: (trainerId: string, pokemonId: string) => void;
}

export const GraveyardModal: React.FC<Props> = ({
                                                    trainer,
                                                    isOpen,
                                                    onClose,
                                                    onRevive,
                                                    onDeleteFainted,
                                                }) => {
    const { canEditTrainer } = useAuth();
    if (!isOpen || !trainer) return null;

    const editable = canEditTrainer(trainer.id);
    const partyFull = trainer.party.length >= 6;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1e2026]/75 backdrop-blur-sm">
            <div className="relative w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl border border-white/10 bg-[#31353f] shadow-2xl overflow-hidden text-[#e5e8ee]">

                {/* Cabecera */}
                <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#282b33]">
                    <div>
                        <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                            <span>Bajas de {trainer.name}</span>
                        </h2>
                        <p className="text-xs text-[#9ca3af]">
                            {trainer.graveyard.length} Pokémon caídos en combate
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-[#9ca3af] hover:text-white hover:bg-white/5 transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Lista de bajas */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
                    {partyFull && editable && (
                        <div className="p-2.5 rounded-xl bg-[#3f382a] border border-[#78663a] text-xs text-[#f3e1a7]">
                            ⚠️ El equipo ya tiene 6 Pokémon. Libera un espacio para poder revivir a uno de la lista.
                        </div>
                    )}

                    {trainer.graveyard.length === 0 ? (
                        <div className="text-center py-8 text-xs text-[#9ca3af] italic">
                            No hay bajas registradas para este entrenador. ¡Todos siguen en pie!
                        </div>
                    ) : (
                        trainer.graveyard.map((pkm: Pokemon) => (
                            <div
                                key={pkm.id}
                                className="flex items-center justify-between p-3 rounded-xl bg-[#272a33] border border-white/5"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 flex items-center justify-center bg-black/20 rounded-lg grayscale">
                                        <img src={pkm.spriteUrl} alt={pkm.name} className="w-10 h-10 object-contain pixelated opacity-80" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-xs font-bold text-white">{pkm.name}</span>
                                            {pkm.isShiny && <span className="text-[10px] text-[#f0c760]">✨</span>}
                                            <span className="text-[10px] text-[#9ca3af] font-mono">Nv.{pkm.level}</span>
                                        </div>
                                        <span className="text-[10px] font-mono text-[#9ca3af] capitalize mt-0.5 block">
                                          {pkm.species}
                                        </span>
                                    </div>
                                </div>

                                {editable && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => onRevive(trainer.id, pkm.id)}
                                            disabled={partyFull}
                                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#364539] hover:bg-[#435747] text-[#a6d4ae] border border-[#526b57] disabled:opacity-30 transition-colors"
                                            title="Devolver al equipo activo"
                                        >
                                            Revivir
                                        </button>
                                        <button
                                            onClick={() => onDeleteFainted(trainer.id, pkm.id)}
                                            className="px-2 py-1 text-xs text-[#9ca3af] hover:text-[#fca5a5] hover:bg-white/5 rounded-lg transition-colors"
                                            title="Eliminar registro"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Pie */}
                <div className="p-3 border-t border-white/10 bg-[#282b33] flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-1.5 text-xs font-medium text-[#9ca3af] hover:text-white"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};