import React from 'react';
import type { Trainer, Pokemon, GymConfig } from '../../types/locke.types';
import { useAuth } from '../../contexts/AuthContext';
import { TYPE_STYLES, TRAINER_PALETTES } from '../../types/pokemon.data';

interface Props {
    trainer: Trainer;
    trainerIndex?: number;
    gyms?: GymConfig[];
    onSelectSlot: (trainer: Trainer, pokemon: Pokemon | null, slotIndex: number) => void;
    onToggleBadge: (trainerId: string, badgeIndex: number) => void;
    onUpdateLives: (trainerId: string, delta: number) => void;
    onOpenGraveyard: (trainer: Trainer) => void;
    onEditTrainer?: (trainer: Trainer) => void;
    onOpenPokepaste?: (trainer: Trainer) => void;
}

export const TrainerCard: React.FC<Props> = ({
    trainer,
    trainerIndex = 0,
    gyms = [],
    onSelectSlot,
    onToggleBadge,
    onUpdateLives,
    onOpenGraveyard,
    onEditTrainer,
    onOpenPokepaste,
}) => {
    const { canEditTrainer, auth } = useAuth();
    const editable = canEditTrainer(trainer.id);
    const totalBadges = trainer.badges.filter(Boolean).length;
    const isDefeated = trainer.lives <= 0;

    const palette = TRAINER_PALETTES[trainerIndex % TRAINER_PALETTES.length];

    return (
        <div
            className={`rounded-2xl border transition-all shadow-md overflow-hidden ${
                isDefeated
                    ? 'border-[#543d3d] bg-[#332f30] opacity-65'
                    : editable
                        ? 'bg-[#353943]'
                        : 'bg-[#31353f] hover:border-white/20'
            }`}
            style={{
                borderColor: editable ? palette.border : 'rgba(255, 255, 255, 0.12)',
            }}
        >
            {/* Header del Entrenador */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/10">
                <div className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-xl border flex items-center justify-center font-mono text-xs font-bold shadow-inner overflow-hidden"
                        style={{
                            backgroundColor: palette.bgBadge,
                            borderColor: palette.border,
                            color: palette.text,
                        }}
                    >
                        {trainer.avatarUrl ? (
                            <img src={trainer.avatarUrl} alt={trainer.name} className="w-full h-full object-cover" />
                        ) : (
                            trainer.name.slice(0, 2).toUpperCase()
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-sm text-white tracking-tight">{trainer.name}</h3>
                            {editable && (
                                <span
                                    className="text-[10px] font-mono px-2 py-0.5 rounded-full border font-semibold"
                                    style={{
                                        backgroundColor: palette.bgBadge,
                                        borderColor: palette.border,
                                        color: palette.text,
                                    }}
                                >
                                    {auth.role === 'admin' ? 'ADMIN' : 'TÚ'}
                                </span>
                            )}
                        </div>

                        {/* Botones de acción */}
                        <div className="flex items-center gap-2 mt-1">
                            <button
                                onClick={() => onOpenGraveyard(trainer)}
                                className="px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold bg-[#3f2a2a]/60 hover:bg-[#3f2a2a] text-[#fca5a5] border border-[#783e3e]/50 transition-colors shadow-sm"
                            >
                                Bajas: {trainer.graveyard.length}
                            </button>

                            {auth.role === 'admin' && onEditTrainer && (
                                <button
                                    onClick={() => onEditTrainer(trainer)}
                                    className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
                                >
                                    ⚙️ Ajustes
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Vidas */}
                <div className="flex items-center gap-1 bg-[#252830] border border-white/10 rounded-xl p-1 shadow-inner">
                    {editable && (
                        <button
                            onClick={() => onUpdateLives(trainer.id, -1)}
                            disabled={trainer.lives <= 0}
                            className="w-6 h-6 rounded-lg flex items-center justify-center text-[#d1d5db] hover:text-white hover:bg-[#3f4452] disabled:opacity-20 text-xs transition-colors"
                        >
                            −
                        </button>
                    )}

                    <div className="px-2.5 font-mono text-xs font-bold text-[#f87171] flex items-center gap-1.5">
                        <span className="text-sm">♥</span>
                        <span>{trainer.lives}</span>
                    </div>

                    {editable && (
                        <button
                            onClick={() => onUpdateLives(trainer.id, 1)}
                            className="w-6 h-6 rounded-lg flex items-center justify-center text-[#d1d5db] hover:text-white hover:bg-[#3f4452] text-xs transition-colors"
                        >
                            +
                        </button>
                    )}
                </div>
            </div>

            <div className="p-4 space-y-4">
                {/* Medallas dinámicas de la sala */}
                <div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#b3b9c6] mb-2">
                        <span className="font-semibold text-slate-300">MEDALLAS</span>
                        <span className="font-bold text-white">{totalBadges} / 8</span>
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                        {Array.from({ length: 8 }).map((_, idx) => {
                            const gym = gyms[idx] || { name: `Medalla ${idx + 1}`, leader: '', type: 'normal' };
                            const hasBadge = trainer.badges[idx];
                            const typeStyle = TYPE_STYLES[gym.type?.toLowerCase()] || { bg: 'rgba(255,255,255,0.08)', text: '#d1d5db', dot: '#d1d5db' };

                            return (
                                <button
                                    key={idx}
                                    disabled={!editable}
                                    onClick={() => onToggleBadge(trainer.id, idx)}
                                    title={`${gym.name} - Líder: ${gym.leader || 'Desc.'} (${gym.city || ''})`}
                                    style={{
                                        backgroundColor: hasBadge ? typeStyle.bg : '#252830',
                                        borderColor: hasBadge ? typeStyle.dot : 'rgba(255, 255, 255, 0.08)',
                                        color: hasBadge ? typeStyle.text : '#6b7280',
                                    }}
                                    className={`py-2 px-1 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                                        hasBadge ? 'shadow-sm scale-[1.02]' : 'hover:border-white/20'
                                    } ${editable ? 'cursor-pointer active:scale-95' : 'cursor-default'}`}
                                >
                                    {gym.iconUrl ? (
                                        <img src={gym.iconUrl} alt={gym.name} className="w-5 h-5 object-contain pixelated mb-0.5" />
                                    ) : (
                                        <span className="text-xs font-mono font-black">{idx + 1}</span>
                                    )}
                                    <span className="text-[9px] font-medium truncate w-full mt-0.5">{gym.name}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Rejilla de Pokémon */}
                <div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#b3b9c6] mb-2">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-300">EQUIPO ({trainer.party.length}/6)</span>
                            {editable && <span className="text-[10px] text-[#9ca3af] hidden sm:inline">· Pulsa para editar</span>}
                        </div>

                        {editable && onOpenPokepaste && (
                            <button
                                type="button"
                                onClick={() => onOpenPokepaste(trainer)}
                                className="px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold bg-[#2a3442] hover:bg-[#344154] text-[#93c5fd] border border-[#3b5270]/50 transition-colors shadow-sm flex items-center gap-1"
                                title="Importar equipo desde Poképaste / Showdown"
                            >
                                <span>📋</span> Poképaste
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {Array.from({ length: 6 }).map((_, idx) => {
                            const pkm = trainer.party[idx];
                            const hasCustomNickname = pkm && pkm.name.trim().toLowerCase() !== pkm.species.trim().toLowerCase();

                            return (
                                <button
                                    key={idx}
                                    type="button"
                                    disabled={!editable}
                                    onClick={() => onSelectSlot(trainer, pkm || null, idx)}
                                    className={`rounded-xl border p-2.5 min-h-[120px] flex flex-col justify-between text-left transition-all ${
                                        pkm
                                            ? 'border-white/10 bg-[#272a33] hover:border-white/30 shadow-sm'
                                            : 'border-white/5 bg-[#23262e] border-dashed hover:border-white/20 flex items-center justify-center'
                                    } ${editable ? 'cursor-pointer active:scale-95' : 'cursor-default'}`}
                                >
                                    {pkm ? (
                                        <div className="w-full flex flex-col justify-between h-full space-y-1.5">
                                            <div className="flex items-start gap-2.5 w-full">
                                                <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-black/25 rounded-lg border border-white/5">
                                                    <img
                                                        src={pkm.spriteUrl}
                                                        alt={pkm.name}
                                                        className="w-12 h-12 object-contain pixelated drop-shadow"
                                                        loading="lazy"
                                                    />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-1">
                                                        <div className="flex items-center gap-1 min-w-0">
                                                            <p className="text-xs font-bold text-white truncate leading-tight">
                                                                {pkm.name}
                                                            </p>
                                                            {pkm.gender === 'M' && <span className="text-[10px] text-blue-400 font-bold leading-none">♂</span>}
                                                            {pkm.gender === 'F' && <span className="text-[10px] text-pink-400 font-bold leading-none">♀</span>}
                                                            {pkm.isShiny && <span className="text-[10px] text-amber-300 leading-none">✨</span>}
                                                        </div>

                                                        <span className="font-mono text-[9px] text-white bg-black/40 px-1 py-0.5 rounded border border-white/10 font-bold flex-shrink-0">
                                                            Nv.{pkm.level}
                                                        </span>
                                                    </div>

                                                    {hasCustomNickname && (
                                                        <p className="text-[10px] text-[#8c929e] font-mono capitalize truncate leading-tight">
                                                            {pkm.species}
                                                        </p>
                                                    )}

                                                    <div className="flex gap-1 mt-1 flex-wrap">
                                                        {pkm.types.map((type) => {
                                                            const style = TYPE_STYLES[type.toLowerCase()] || { bg: 'rgba(255,255,255,0.1)', text: '#e2e8f0', dot: '#94a3b8' };
                                                            return (
                                                                <span
                                                                    key={type}
                                                                    style={{ backgroundColor: style.bg, color: style.text }}
                                                                    className="text-[8px] uppercase font-mono font-bold px-1.5 py-0.5 rounded flex items-center gap-1"
                                                                >
                                                                    <span className="w-1 h-1 rounded-full" style={{ backgroundColor: style.dot }} />
                                                                    {type}
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between gap-1 text-[9px] font-mono pt-1 border-t border-white/5">
                                                {pkm.ability ? (
                                                    <span className="text-[#9ca3af] truncate">
                                                        Hab: <strong className="text-[#d1d5db] font-medium capitalize">{pkm.ability}</strong>
                                                    </span>
                                                ) : <span />}

                                                {pkm.heldItem && (
                                                    <span className="text-[#93c5fd] bg-[#1e2430] px-1.5 py-0.5 rounded border border-blue-500/20 truncate">
                                                        📦 {pkm.heldItem}
                                                    </span>
                                                )}
                                            </div>

                                            {pkm.moves && pkm.moves.length > 0 && (
                                                <div className="grid grid-cols-2 gap-1 pt-1 border-t border-white/5 text-[8.5px] font-mono text-[#9ca3af]">
                                                    {pkm.moves.slice(0, 4).map((m, mIdx) => (
                                                        <span
                                                            key={mIdx}
                                                            className="bg-[#1f2229] px-1.5 py-0.5 rounded truncate border border-white/5"
                                                            title={m}
                                                        >
                                                            • {m}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-[11px] font-mono text-[#6c7385]">+ Libre</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
