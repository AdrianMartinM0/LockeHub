import React, { useState } from 'react';
import type { Pokemon, Trainer } from '../../types/locke.types';
import { fetchPokemonData, fetchItemSprite, type PokeAPISpeciesData } from '../../services/pokeapi.service';
import { TYPE_STYLES } from '../../types/pokemon.data';

interface Props {
    trainer: Trainer | null;
    isOpen: boolean;
    onClose: () => void;
    onSaveParty: (trainerId: string, party: Pokemon[]) => void;
    onDirectFaint: (trainerId: string, pokemonId: string, cause: string) => void;
}

export const EditPartyModal: React.FC<Props> = ({
                                                    trainer,
                                                    isOpen,
                                                    onClose,
                                                    onSaveParty,
                                                    onDirectFaint,
                                                }) => {
    if (!isOpen || !trainer) return null;

    const [party, setParty] = useState<Pokemon[]>([...trainer.party]);

    // Búsqueda PokéAPI
    const [searchTerm, setSearchTerm] = useState('');
    const [apiData, setApiData] = useState<PokeAPISpeciesData | null>(null);
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState('');

    // Formulario nuevo
    const [nickname, setNickname] = useState('');
    const [level, setLevel] = useState(15);
    const [isShiny, setIsShiny] = useState(false);
    const [selectedAbility, setSelectedAbility] = useState('');
    const [itemName, setItemName] = useState('');

    // Edición de Pokémon existente
    const [editingPokemonId, setEditingPokemonId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editLevel, setEditLevel] = useState(1);
    const [editItem, setEditItem] = useState('');
    const [editAbility, setEditAbility] = useState('');

    const handleSearchSpecies = async () => {
        if (!searchTerm.trim()) return;
        setSearching(true);
        setSearchError('');
        setApiData(null);

        const data = await fetchPokemonData(searchTerm);
        if (!data) {
            setSearchError('No se encontró el Pokémon. Revisa el nombre o ID en inglés.');
        } else {
            setApiData(data);
            setSelectedAbility(data.abilities[0] || '');
            if (!nickname) setNickname(data.name.toUpperCase());
        }
        setSearching(false);
    };

    const handleAddSlot = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!apiData) return;
        if (party.length >= 6) {
            setSearchError('El equipo ya tiene 6 Pokémon.');
            return;
        }

        let itemSprite: string | undefined = undefined;
        if (itemName.trim()) {
            itemSprite = await fetchItemSprite(itemName);
        }

        const newSlot: Pokemon = {
            id: crypto.randomUUID(),
            species: apiData.name,
            name: nickname.trim() || apiData.name.toUpperCase(),
            level: Math.max(1, Math.min(100, Number(level) || 1)),
            isShiny,
            spriteUrl: isShiny ? apiData.spriteShiny : apiData.spriteNormal,
            types: apiData.types,
            ability: selectedAbility,
            heldItem: itemName.trim() || undefined,
            status: 'party',
        };

        setParty([...party, newSlot]);
        setApiData(null);
        setSearchTerm('');
        setNickname('');
        setIsShiny(false);
        setItemName('');
    };

    const handleStartEdit = (pkm: Pokemon) => {
        setEditingPokemonId(pkm.id);
        setEditName(pkm.name);
        setEditLevel(pkm.level);
        setEditItem(pkm.heldItem || '');
        setEditAbility(pkm.ability || '');
    };

    const handleApplyEdit = () => {
        if (!editingPokemonId) return;
        setParty(
            party.map((p) =>
                p.id === editingPokemonId
                    ? {
                        ...p,
                        name: editName.trim() || p.name,
                        level: Math.max(1, Math.min(100, Number(editLevel) || 1)),
                        heldItem: editItem.trim() || undefined,
                        ability: editAbility.trim() || undefined,
                    }
                    : p
            )
        );
        setEditingPokemonId(null);
    };

    const handleRemoveSlot = (id: string) => {
        setParty(party.filter((p) => p.id !== id));
    };

    const handleFaintFromModal = (pkm: Pokemon) => {
        const cause = prompt(`¿Causa de la muerte de ${pkm.name}? (Opcional)`) || '';
        onDirectFaint(trainer.id, pkm.id, cause);
        setParty(party.filter((p) => p.id !== pkm.id));
    };

    const handleSave = () => {
        onSaveParty(trainer.id, party);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#1e2026]/75 backdrop-blur-sm">
            <div className="w-full sm:max-w-xl max-h-[92vh] sm:max-h-[85vh] flex flex-col rounded-t-2xl sm:rounded-2xl border border-white/10 bg-[#31353f] shadow-2xl overflow-hidden text-[#e5e8ee]">

                {/* Cabecera */}
                <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#282b33]">
                    <div>
                        <h2 className="text-sm sm:text-base font-bold text-white">Equipo de {trainer.name}</h2>
                        <p className="text-xs text-[#9ca3af]">Añade, edita niveles o da de baja miembros ({party.length}/6)</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-[#9ca3af] hover:text-white"
                    >
                        ✕
                    </button>
                </div>

                {/* Contenido scrolleable */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">

                    {/* Formulario Añadir */}
                    {party.length < 6 && (
                        <div className="rounded-xl border border-white/10 bg-[#272a33] p-4 space-y-3">
              <span className="text-[11px] font-mono uppercase text-[#cbd5e1] font-semibold tracking-wider block">
                + Añadir Pokémon con PokéAPI
              </span>

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="ej: lucario, gengar, 25..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearchSpecies())}
                                    className="flex-1 bg-[#1f2127] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-[#6b7280] focus:border-white/25 focus:outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={handleSearchSpecies}
                                    disabled={searching || !searchTerm.trim()}
                                    className="px-3.5 py-2 bg-[#424855] hover:bg-[#4d5463] border border-white/10 disabled:opacity-40 text-xs font-semibold text-white rounded-xl transition-colors"
                                >
                                    {searching ? '...' : 'Buscar'}
                                </button>
                            </div>

                            {searchError && <p className="text-xs text-[#fca5a5]">{searchError}</p>}

                            {apiData && (
                                <form onSubmit={handleAddSlot} className="space-y-3 pt-3 border-t border-white/10">
                                    <div className="flex items-center gap-3 bg-[#1f2127] p-2.5 rounded-xl border border-white/5">
                                        <img
                                            src={isShiny ? apiData.spriteShiny : apiData.spriteNormal}
                                            alt={apiData.name}
                                            className="w-12 h-12 object-contain pixelated"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-white capitalize">{apiData.name}</span>
                                                {isShiny && <span className="text-[10px] text-[#f0c760]">✨ Variocolor</span>}
                                            </div>
                                            <div className="flex gap-1 mt-1">
                                                {apiData.types.map((t) => {
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

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                        <div>
                                            <label className="block text-[10px] text-[#9ca3af] mb-1 font-semibold">Mote</label>
                                            <input
                                                type="text"
                                                value={nickname}
                                                onChange={(e) => setNickname(e.target.value)}
                                                placeholder="Mote"
                                                className="w-full bg-[#1f2127] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[10px] text-[#9ca3af] mb-1 font-semibold">Nivel</label>
                                            <input
                                                type="number"
                                                min={1}
                                                max={100}
                                                value={level}
                                                onChange={(e) => setLevel(Number(e.target.value))}
                                                className="w-full bg-[#1f2127] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none"
                                            />
                                        </div>

                                        <div className="flex flex-col justify-end">
                                            <button
                                                type="button"
                                                onClick={() => setIsShiny(!isShiny)}
                                                className={`w-full py-1.5 px-2.5 rounded-lg text-xs font-semibold border transition-all ${
                                                    isShiny
                                                        ? 'bg-[#3b3524] border-[#8c7438] text-[#f0c760]'
                                                        : 'bg-[#1f2127] border-white/10 text-[#9ca3af] hover:text-white'
                                                }`}
                                            >
                                                {isShiny ? '✨ Shiny' : 'Normal'}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-[10px] text-[#9ca3af] mb-1 font-semibold">Habilidad</label>
                                            <select
                                                value={selectedAbility}
                                                onChange={(e) => setSelectedAbility(e.target.value)}
                                                className="w-full bg-[#1f2127] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white capitalize focus:outline-none"
                                            >
                                                {apiData.abilities.map((ab) => (
                                                    <option key={ab} value={ab}>
                                                        {ab.replace('-', ' ')}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] text-[#9ca3af] mb-1 font-semibold">Objeto</label>
                                            <input
                                                type="text"
                                                value={itemName}
                                                onChange={(e) => setItemName(e.target.value)}
                                                placeholder="ej: leftovers"
                                                className="w-full bg-[#1f2127] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full py-2 bg-[#424855] hover:bg-[#4d5463] text-white font-semibold text-xs rounded-xl border border-white/10 transition-colors"
                                    >
                                        + Añadir al Equipo
                                    </button>
                                </form>
                            )}
                        </div>
                    )}

                    {/* Lista actual con EDICIÓN DIRECTA */}
                    <div className="space-y-2">
            <span className="text-[11px] font-mono text-[#9ca3af] uppercase font-semibold block">
              Equipo Actual ({party.length}/6)
            </span>

                        {party.length === 0 ? (
                            <p className="text-xs text-[#6b7280] italic py-3 text-center">No hay ningún Pokémon en el equipo.</p>
                        ) : (
                            party.map((pkm) => {
                                const isEditing = editingPokemonId === pkm.id;

                                return (
                                    <div
                                        key={pkm.id}
                                        className="p-3 rounded-xl bg-[#272a33] border border-white/5 space-y-2.5"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2.5">
                                                <img src={pkm.spriteUrl} alt={pkm.name} className="w-10 h-10 object-contain pixelated" />
                                                <div>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-xs font-bold text-white">{pkm.name}</span>
                                                        {pkm.isShiny && <span className="text-[10px] text-[#f0c760]">✨</span>}
                                                        <span className="text-[10px] text-[#9ca3af] font-mono">Nv.{pkm.level}</span>
                                                    </div>
                                                    <p className="text-[10px] text-[#9ca3af] capitalize">
                                                        {pkm.ability ? `Hab: ${pkm.ability.replace('-', ' ')}` : pkm.species}
                                                        {pkm.heldItem ? ` • 📦 ${pkm.heldItem}` : ''}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Botones de acción del Pokémon */}
                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() => isEditing ? setEditingPokemonId(null) : handleStartEdit(pkm)}
                                                    className="px-2 py-1 text-[11px] text-[#d1d5db] bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10"
                                                >
                                                    {isEditing ? 'Cerrar' : 'Editar'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleFaintFromModal(pkm)}
                                                    className="px-2 py-1 text-[11px] text-[#fca5a5] bg-[#3f2a2a]/40 hover:bg-[#3f2a2a] rounded-lg transition-colors border border-[#783e3e]/30"
                                                    title="Declarar muerto y mandar al cementerio"
                                                >
                                                    Baja
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveSlot(pkm.id)}
                                                    className="px-2 py-1 text-[11px] text-[#9ca3af] hover:text-white rounded-lg transition-colors"
                                                    title="Liberar sin registrar baja"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        </div>

                                        {/* Formulario de edición rápida del Pokémon */}
                                        {isEditing && (
                                            <div className="pt-2 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-2">
                                                <div>
                                                    <label className="block text-[9px] text-[#9ca3af] mb-0.5">Mote</label>
                                                    <input
                                                        type="text"
                                                        value={editName}
                                                        onChange={(e) => setEditName(e.target.value)}
                                                        className="w-full bg-[#1f2127] border border-white/10 rounded px-2 py-1 text-xs text-white"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[9px] text-[#9ca3af] mb-0.5">Nivel</label>
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        max={100}
                                                        value={editLevel}
                                                        onChange={(e) => setEditLevel(Number(e.target.value))}
                                                        className="w-full bg-[#1f2127] border border-white/10 rounded px-2 py-1 text-xs font-mono text-white"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[9px] text-[#9ca3af] mb-0.5">Objeto</label>
                                                    <input
                                                        type="text"
                                                        value={editItem}
                                                        onChange={(e) => setEditItem(e.target.value)}
                                                        placeholder="objeto"
                                                        className="w-full bg-[#1f2127] border border-white/10 rounded px-2 py-1 text-xs text-white"
                                                    />
                                                </div>
                                                <div className="flex items-end">
                                                    <button
                                                        type="button"
                                                        onClick={handleApplyEdit}
                                                        className="w-full py-1 text-xs font-bold bg-[#474e5d] hover:bg-[#525969] text-white rounded transition-colors"
                                                    >
                                                        Guardar
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Pie de acción */}
                <div className="p-3 border-t border-white/10 bg-[#282b33] flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-medium text-[#9ca3af] hover:text-white"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-5 py-2 text-xs font-bold bg-[#474e5d] hover:bg-[#525969] text-white rounded-xl border border-white/15 transition-colors"
                    >
                        Guardar Equipo
                    </button>
                </div>
            </div>
        </div>
    );
};