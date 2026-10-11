import React, { useState } from 'react';
import type { Trainer, Pokemon } from '../../types/locke.types';
import { convertPokepasteToTeam } from '../../services/pokepaste.service';

interface Props {
    trainer: Trainer | null;
    isOpen: boolean;
    onClose: () => void;
    onApplyTeam: (trainerId: string, newParty: Pokemon[]) => void;
}

export const PokepasteModal: React.FC<Props> = ({ trainer, isOpen, onClose, onApplyTeam }) => {
    const [pasteText, setPasteText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen || !trainer) return null;

    const handleImport = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pasteText.trim()) return;

        setLoading(true);
        setError('');

        try {
            let textToParse = pasteText.trim();

            // Si el usuario pegó una URL de pokepast.es, intentamos traer su versión /raw
            if (textToParse.startsWith('http') && textToParse.includes('pokepast.es')) {
                const rawUrl = textToParse.endsWith('/raw') ? textToParse : `${textToParse}/raw`;
                const res = await fetch(rawUrl);
                if (res.ok) {
                    textToParse = await res.text();
                } else {
                    throw new Error('No se pudo descargar el Poképaste desde el enlace.');
                }
            }

            const newParty = await convertPokepasteToTeam(textToParse);

            if (newParty.length === 0) {
                setError('No se detectó ningún Pokémon válido. Asegúrate de usar el formato Showdown / Poképaste.');
                setLoading(false);
                return;
            }

            onApplyTeam(trainer.id, newParty);
            setPasteText('');
            onClose();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Error al procesar el Poképaste.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#181a20]/80 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#31353f] shadow-2xl overflow-hidden text-[#e5e8ee]">

                {/* Cabecera */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#282b33]">
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[#252830] border border-white/10 flex items-center justify-center text-xs font-mono font-bold text-[#93c5fd]">
                            📋
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-white">Importar Poképaste / Showdown</h2>
                            <p className="text-[11px] text-[#9ca3af]">Actualiza el equipo de {trainer.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-[#9ca3af] hover:text-white">
                        ✕
                    </button>
                </div>

                {/* Formulario */}
                <form onSubmit={handleImport} className="p-4 space-y-3.5">
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-[10px] font-mono uppercase text-[#cbd5e1] font-semibold">
                                Pega el texto de tu equipo o el enlace de Pokepast.es
                            </label>
                            <span className="text-[10px] text-[#9ca3af]">Máximo 6 Pokémon</span>
                        </div>

                        <textarea
                            rows={9}
                            autoFocus
                            value={pasteText}
                            onChange={(e) => setPasteText(e.target.value)}
                            placeholder={`Ejemplo:\nCharizard @ Leftovers\nAbility: Blaze\nLevel: 36\nShiny: Yes\n\nVaporeon @ Sitrus Berry\nAbility: Water Absorb\nLevel: 35`}
                            className="w-full bg-[#252830] border border-white/10 rounded-xl p-3 font-mono text-xs text-white placeholder:text-[#6b7280] focus:outline-none focus:border-white/25 leading-relaxed resize-none"
                        />
                    </div>

                    {error && (
                        <p className="text-xs text-[#fca5a5] bg-[#3f2a2a]/60 border border-[#783e3e]/40 rounded-xl p-2.5">
                            {error}
                        </p>
                    )}

                    <div className="rounded-xl border border-white/5 bg-[#252830] p-2.5 text-[11px] text-[#9ca3af] space-y-1">
                        <p>💡 <strong>¿Cómo funciona?</strong></p>
                        <p>Se detectará automáticamente el mote, la especie, el nivel, la habilidad, el objeto y si es Shiny. Sustituirá tu equipo activo actual de hasta 6 miembros.</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-3 py-1.5 text-xs text-[#9ca3af] hover:text-white"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !pasteText.trim()}
                            className="px-4 py-2 text-xs font-bold rounded-xl bg-[#474e5d] hover:bg-[#525969] text-white disabled:opacity-40 transition-colors flex items-center gap-2"
                        >
                            {loading ? 'Cargando sprites...' : 'Actualizar Equipo'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};