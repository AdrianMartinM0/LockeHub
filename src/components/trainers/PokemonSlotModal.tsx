import React, { useState, useEffect, useRef } from 'react';
import type { Pokemon, Trainer } from '../../types/locke.types';
import {
    fetchPokemonData,
    searchPokemonSuggestions,
    searchAbilitySuggestions,
    searchItemSuggestions,
    searchMoveSuggestions,
    type PokeAPISpeciesData,
    type PokemonSuggestion,
    type GenericSuggestion,
} from '../../services/pokeapi.service';
import { TYPE_STYLES } from '../../types/pokemon.data';

interface Props {
    trainer: Trainer | null;
    pokemon: Pokemon | null;
    slotIndex: number;
    isOpen: boolean;
    onClose: () => void;
    onSave: (trainerId: string, updatedSlot: Pokemon) => void;
    onDelete: (trainerId: string, pokemonId: string) => void;
    onFaint: (trainerId: string, pokemonId: string) => void;
}

export const PokemonSlotModal: React.FC<Props> = ({
                                                      trainer,
                                                      pokemon,
                                                      slotIndex,
                                                      isOpen,
                                                      onClose,
                                                      onSave,
                                                      onDelete,
                                                      onFaint,
                                                  }) => {
    if (!isOpen || !trainer) return null;

    // Especie
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState<PokemonSuggestion[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);

    // Habilidad
    const [abilityTerm, setAbilityTerm] = useState('');
    const [abilitySuggestions, setAbilitySuggestions] = useState<string[]>([]);
    const [showAbilityDropdown, setShowAbilityDropdown] = useState(false);

    // Objeto
    const [itemTerm, setItemTerm] = useState('');
    const [itemSuggestions, setItemSuggestions] = useState<GenericSuggestion[]>([]);
    const [showItemDropdown, setShowItemDropdown] = useState(false);

    // Datos básicos
    const [species, setSpecies] = useState('');
    const [nickname, setNickname] = useState('');
    const [gender, setGender] = useState<'M' | 'F' | 'N'>('N');
    const [level, setLevel] = useState(15);
    const [isShiny, setIsShiny] = useState(false);
    const [spriteUrl, setSpriteUrl] = useState('');
    const [types, setTypes] = useState<string[]>([]);

    // 4 Movimientos
    const [moves, setMoves] = useState<string[]>(['', '', '', '']);
    const [activeMoveIdx, setActiveMoveIdx] = useState<number | null>(null);
    const [moveSuggestions, setMoveSuggestions] = useState<string[]>([]);

    const [loadingSelection, setLoadingSelection] = useState(false);
    const [searchError, setSearchError] = useState('');

    const dropdownRef = useRef<HTMLDivElement>(null);
    const abilityDropdownRef = useRef<HTMLDivElement>(null);
    const itemDropdownRef = useRef<HTMLDivElement>(null);
    const moveDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (pokemon) {
            setSpecies(pokemon.species);
            setSearchTerm(pokemon.species);
            setNickname(pokemon.name);
            setGender(pokemon.gender || 'N');
            setLevel(pokemon.level);
            setIsShiny(pokemon.isShiny);
            setSpriteUrl(pokemon.spriteUrl);
            setTypes(pokemon.types);
            setAbilityTerm(pokemon.ability || '');
            setItemTerm(pokemon.heldItem || '');

            const initialMoves = ['', '', '', ''];
            if (pokemon.moves) {
                pokemon.moves.forEach((m, i) => {
                    if (i < 4) initialMoves[i] = m;
                });
            }
            setMoves(initialMoves);
        } else {
            setSpecies('');
            setSearchTerm('');
            setNickname('');
            setGender('N');
            setLevel(5);
            setIsShiny(false);
            setSpriteUrl('');
            setTypes([]);
            setAbilityTerm('');
            setItemTerm('');
            setMoves(['', '', '', '']);
        }
        setSuggestions([]);
        setShowDropdown(false);
        setShowAbilityDropdown(false);
        setShowItemDropdown(false);
        setActiveMoveIdx(null);
        setSearchError('');
    }, [pokemon, isOpen]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
            }
            if (abilityDropdownRef.current && !abilityDropdownRef.current.contains(e.target as Node)) {
                setShowAbilityDropdown(false);
            }
            if (itemDropdownRef.current && !itemDropdownRef.current.contains(e.target as Node)) {
                setShowItemDropdown(false);
            }
            if (moveDropdownRef.current && !moveDropdownRef.current.contains(e.target as Node)) {
                setActiveMoveIdx(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearchTerm(val);
        if (val.trim().length >= 2) {
            const results = await searchPokemonSuggestions(val);
            setSuggestions(results);
            setShowDropdown(results.length > 0);
        } else {
            setSuggestions([]);
            setShowDropdown(false);
        }
    };

    const handleSelectSuggestion = async (sugg: PokemonSuggestion) => {
        setSearchTerm(sugg.name);
        setShowDropdown(false);
        setLoadingSelection(true);
        setSearchError('');

        const data: PokeAPISpeciesData | null = await fetchPokemonData(sugg.name);
        if (data) {
            setSpecies(data.name);
            setTypes(data.types);
            setSpriteUrl(isShiny ? data.spriteShiny : data.spriteNormal);
            if (!nickname || nickname.toLowerCase() === species.toLowerCase()) {
                setNickname(data.name.toUpperCase());
            }
        } else {
            setSearchError('Error cargando detalles del Pokémon.');
        }
        setLoadingSelection(false);
    };

    const handleAbilityChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setAbilityTerm(val);
        if (val.trim().length >= 2) {
            const results = await searchAbilitySuggestions(val);
            setAbilitySuggestions(results);
            setShowAbilityDropdown(results.length > 0);
        } else {
            setAbilitySuggestions([]);
            setShowAbilityDropdown(false);
        }
    };

    const handleItemChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setItemTerm(val);
        if (val.trim().length >= 2) {
            const results = await searchItemSuggestions(val);
            setItemSuggestions(results);
            setShowItemDropdown(results.length > 0);
        } else {
            setItemSuggestions([]);
            setShowItemDropdown(false);
        }
    };

    // Manejador de Movimientos con autocompletado
    const handleMoveChange = async (index: number, val: string) => {
        const updated = [...moves];
        updated[index] = val;
        setMoves(updated);
        setActiveMoveIdx(index);

        if (val.trim().length >= 2) {
            const results = await searchMoveSuggestions(val);
            setMoveSuggestions(results);
        } else {
            setMoveSuggestions([]);
        }
    };

    const handleSelectMove = (index: number, moveName: string) => {
        const updated = [...moves];
        updated[index] = moveName;
        setMoves(updated);
        setActiveMoveIdx(null);
    };

    const handleToggleShiny = () => {
        const nextShiny = !isShiny;
        setIsShiny(nextShiny);
        if (species) {
            fetchPokemonData(species).then((data) => {
                if (data) setSpriteUrl(nextShiny ? data.spriteShiny : data.spriteNormal);
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!species || !spriteUrl) {
            setSearchError('Debes seleccionar un Pokémon válido antes de guardar.');
            return;
        }

        const cleanedMoves = moves.map((m) => m.trim()).filter(Boolean);

        const updatedPokemon: Pokemon = {
            id: pokemon?.id || crypto.randomUUID(),
            species,
            name: nickname.trim() || species.toUpperCase(),
            gender,
            level: Math.max(1, Math.min(100, Number(level) || 1)),
            isShiny,
            spriteUrl,
            types: types.length > 0 ? types : ['normal'],
            ability: abilityTerm.trim() || undefined,
            heldItem: itemTerm.trim() || undefined,
            moves: cleanedMoves,
            status: 'party',
        };

        onSave(trainer.id, updatedPokemon);
        onClose();
    };

    const handleFaintAction = () => {
        if (!pokemon) return;
        onFaint(trainer.id, pokemon.id);
        onClose();
    };

    const handleDeleteAction = () => {
        if (!pokemon) return;
        if (confirm(`¿Liberar a ${pokemon.name}? No se guardará en bajas.`)) {
            onDelete(trainer.id, pokemon.id);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#181a20]/80 backdrop-blur-sm">
            <div className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl border border-white/10 bg-[#31353f] shadow-2xl overflow-hidden text-[#e5e8ee]">

                {/* Cabecera */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#282b33]">
                    <div>
                        <h2 className="text-sm font-bold text-white">
                            {pokemon ? `Editar Pokémon (Slot ${slotIndex + 1})` : `Añadir Pokémon (Slot ${slotIndex + 1})`}
                        </h2>
                        <p className="text-[11px] text-[#9ca3af]">Entrenador: {trainer.name}</p>
                    </div>
                    <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-[#9ca3af] hover:text-white">
                        ✕
                    </button>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-3.5">

                    {/* Especie */}
                    <div className="relative" ref={dropdownRef}>
                        <label className="block text-[10px] font-mono uppercase text-[#cbd5e1] font-semibold mb-1">
                            Especie (PokéAPI)
                        </label>
                        <input
                            type="text"
                            autoFocus={!pokemon}
                            placeholder="Escribe el nombre (ej: gengar, char...)"
                            value={searchTerm}
                            onChange={handleInputChange}
                            onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
                            className="w-full bg-[#252830] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-[#6b7280] focus:outline-none focus:border-white/25"
                        />

                        {loadingSelection && (
                            <span className="absolute right-3 top-7 text-[10px] text-[#9ca3af]">Cargando...</span>
                        )}

                        {showDropdown && suggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-[#252830] border border-white/15 rounded-xl shadow-2xl z-30 overflow-hidden divide-y divide-white/5">
                                {suggestions.map((sugg) => (
                                    <button
                                        key={sugg.id}
                                        type="button"
                                        onClick={() => handleSelectSuggestion(sugg)}
                                        className="w-full px-3 py-2 flex items-center gap-3 text-left hover:bg-white/10 transition-colors"
                                    >
                                        <img src={sugg.spriteThumb} alt={sugg.name} className="w-7 h-7 object-contain pixelated" />
                                        <span className="text-xs font-semibold capitalize text-white">{sugg.name}</span>
                                        <span className="text-[10px] font-mono text-[#9ca3af] ml-auto">#{sugg.id}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {searchError && <p className="text-xs text-[#fca5a5] mt-1">{searchError}</p>}
                    </div>

                    {/* Preview del Pokémon */}
                    {spriteUrl && (
                        <div className="flex items-center gap-3 bg-[#252830] p-2.5 rounded-xl border border-white/5">
                            <div className="w-12 h-12 flex items-center justify-center bg-black/20 rounded-lg">
                                <img src={spriteUrl} alt={species} className="w-12 h-12 object-contain pixelated" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-white capitalize">{species}</span>
                                    {isShiny && <span className="text-[10px] text-[#f0c760]">✨ Variocolor</span>}
                                </div>
                                <div className="flex gap-1 mt-1">
                                    {types.map((t) => {
                                        const style = TYPE_STYLES[t.toLowerCase()] || { bg: '#2b2e36', text: '#9ea4b0', dot: '#9ea4b0' };
                                        return (
                                            <span
                                                key={t}
                                                style={{ backgroundColor: style.bg, color: style.text }}
                                                className="text-[8px] uppercase font-mono font-bold px-1.5 py-0.5 rounded flex items-center gap-1"
                                            >
                        <span className="w-1 h-1 rounded-full" style={{ backgroundColor: style.dot }} />
                                                {t}
                      </span>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Mote, Género, Nivel y Shiny */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div>
                            <label className="block text-[10px] text-[#9ca3af] mb-1 font-semibold">Mote</label>
                            <input
                                type="text"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                placeholder="Mote"
                                className="w-full bg-[#252830] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] text-[#9ca3af] mb-1 font-semibold">Género</label>
                            <select
                                value={gender}
                                onChange={(e) => setGender(e.target.value as 'M' | 'F' | 'N')}
                                className="w-full bg-[#252830] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"
                            >
                                <option value="N">Neutro (-)</option>
                                <option value="M">Macho (♂)</option>
                                <option value="F">Hembra (♀)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-[10px] text-[#9ca3af] mb-1 font-semibold">Nivel</label>
                            <input
                                type="number"
                                min={1}
                                max={100}
                                value={level}
                                onChange={(e) => setLevel(Number(e.target.value))}
                                className="w-full bg-[#252830] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none"
                            />
                        </div>

                        <div className="flex flex-col justify-end">
                            <label className="block text-[10px] text-[#9ca3af] mb-1 font-semibold">Variocolor</label>
                            <button
                                type="button"
                                onClick={handleToggleShiny}
                                className={`w-full py-1.5 px-2 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1 transition-all ${
                                    isShiny
                                        ? 'bg-[#4a3f28] border-[#a38438] text-[#fae5a8] shadow-sm shadow-amber-500/10'
                                        : 'bg-[#252830] border-white/10 text-[#8c929e] hover:text-white hover:border-white/20'
                                }`}
                            >
                                <span>✨</span>
                                <span>Shiny</span>
                            </button>
                        </div>
                    </div>

                    {/* Habilidad & Objeto */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="relative" ref={abilityDropdownRef}>
                            <label className="block text-[10px] text-[#9ca3af] mb-1 font-semibold">Habilidad (PokéAPI)</label>
                            <input
                                type="text"
                                value={abilityTerm}
                                onChange={handleAbilityChange}
                                onFocus={() => abilitySuggestions.length > 0 && setShowAbilityDropdown(true)}
                                placeholder="ej: intimidate, multiscale..."
                                className="w-full bg-[#252830] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white capitalize focus:outline-none"
                            />
                            {showAbilityDropdown && abilitySuggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-[#252830] border border-white/15 rounded-xl shadow-2xl z-30 overflow-hidden divide-y divide-white/5">
                                    {abilitySuggestions.map((ab) => (
                                        <button
                                            key={ab}
                                            type="button"
                                            onClick={() => {
                                                setAbilityTerm(ab);
                                                setShowAbilityDropdown(false);
                                            }}
                                            className="w-full px-3 py-1.5 text-left text-xs capitalize text-white hover:bg-white/10 transition-colors"
                                        >
                                            {ab}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="relative" ref={itemDropdownRef}>
                            <label className="block text-[10px] text-[#9ca3af] mb-1 font-semibold">Objeto Equipado (PokéAPI)</label>
                            <input
                                type="text"
                                value={itemTerm}
                                onChange={handleItemChange}
                                onFocus={() => itemSuggestions.length > 0 && setShowItemDropdown(true)}
                                placeholder="ej: leftovers, choice band..."
                                className="w-full bg-[#252830] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white capitalize focus:outline-none"
                            />
                            {showItemDropdown && itemSuggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-[#252830] border border-white/15 rounded-xl shadow-2xl z-30 overflow-hidden divide-y divide-white/5">
                                    {itemSuggestions.map((it) => (
                                        <button
                                            key={it.name}
                                            type="button"
                                            onClick={() => {
                                                setItemTerm(it.name);
                                                setShowItemDropdown(false);
                                            }}
                                            className="w-full px-3 py-1.5 flex items-center gap-2 text-left text-xs capitalize text-white hover:bg-white/10 transition-colors"
                                        >
                                            {it.spriteThumb && (
                                                <img src={it.spriteThumb} alt="" className="w-4 h-4 object-contain pixelated" />
                                            )}
                                            <span>{it.name}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 4 Movimientos con Autocompletado */}
                    <div className="relative" ref={moveDropdownRef}>
                        <label className="block text-[10px] font-mono uppercase text-[#cbd5e1] font-semibold mb-1">
                            Movimientos / Ataques (4)
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {moves.map((move, idx) => (
                                <div key={idx} className="relative">
                                    <input
                                        type="text"
                                        value={move}
                                        onChange={(e) => handleMoveChange(idx, e.target.value)}
                                        onFocus={() => {
                                            setActiveMoveIdx(idx);
                                            if (move.trim().length >= 2) {
                                                searchMoveSuggestions(move).then(setMoveSuggestions);
                                            }
                                        }}
                                        placeholder={`Movimiento ${idx + 1}`}
                                        className="w-full bg-[#252830] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white capitalize focus:outline-none focus:border-white/25"
                                    />

                                    {activeMoveIdx === idx && moveSuggestions.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-[#252830] border border-white/15 rounded-xl shadow-2xl z-30 overflow-hidden divide-y divide-white/5 max-h-36 overflow-y-auto">
                                            {moveSuggestions.map((mSuggestion) => (
                                                <button
                                                    key={mSuggestion}
                                                    type="button"
                                                    onClick={() => handleSelectMove(idx, mSuggestion)}
                                                    className="w-full px-3 py-1.5 text-left text-xs capitalize text-white hover:bg-white/10 transition-colors"
                                                >
                                                    {mSuggestion}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/10">
                        {pokemon ? (
                            <div className="flex items-center gap-1.5">
                                <button
                                    type="button"
                                    onClick={handleFaintAction}
                                    className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-[#3f2a2a] hover:bg-[#523333] text-[#fca5a5] border border-[#783e3e]/40 transition-colors"
                                >
                                    Dar de Baja
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDeleteAction}
                                    className="px-2.5 py-1.5 text-xs text-[#9ca3af] hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    Liberar
                                </button>
                            </div>
                        ) : <div />}

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-3 py-1.5 text-xs text-[#9ca3af] hover:text-white"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-1.5 text-xs font-bold rounded-xl bg-[#474e5d] hover:bg-[#525969] text-white transition-colors"
                            >
                                Guardar Slot
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};