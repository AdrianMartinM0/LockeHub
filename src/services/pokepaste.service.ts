import { fetchPokemonData } from './pokeapi.service';
import type { Pokemon } from '../types/locke.types';

export interface ParsedShowdownSlot {
    nickname?: string;
    species: string;
    gender?: 'M' | 'F' | 'N';
    heldItem?: string;
    ability?: string;
    level: number;
    isShiny: boolean;
    moves: string[];
}

export const parseShowdownText = (rawText: string): ParsedShowdownSlot[] => {
    const blocks = rawText
        .trim()
        .split(/\n\s*\n/)
        .map((b) => b.trim())
        .filter(Boolean);

    const parsedList: ParsedShowdownSlot[] = [];

    for (const block of blocks.slice(0, 6)) {
        const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
        if (lines.length === 0) continue;

        const firstLine = lines[0];
        let heldItem: string | undefined = undefined;
        let namePart = firstLine;

        // Detectar item tras @
        if (firstLine.includes('@')) {
            const parts = firstLine.split('@');
            namePart = parts[0].trim();
            heldItem = parts[1].trim();
        }

        // Detectar género
        let gender: 'M' | 'F' | 'N' = 'N';
        if (/\(M\)$/i.test(namePart)) {
            gender = 'M';
            namePart = namePart.replace(/\(M\)$/i, '').trim();
        } else if (/\(F\)$/i.test(namePart)) {
            gender = 'F';
            namePart = namePart.replace(/\(F\)$/i, '').trim();
        }

        // Detectar Mote y Especie
        let nickname: string | undefined = undefined;
        let species = namePart;

        const speciesMatch = namePart.match(/^(.*?)\s*\((.*?)\)$/);
        if (speciesMatch) {
            nickname = speciesMatch[1].trim();
            species = speciesMatch[2].trim();
        }

        let ability: string | undefined = undefined;
        let level = 50;
        let isShiny = false;
        const moves: string[] = [];

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];

            if (line.toLowerCase().startsWith('ability:')) {
                ability = line.split(':')[1].trim();
            } else if (line.toLowerCase().startsWith('level:')) {
                const lvlParsed = parseInt(line.split(':')[1].trim(), 10);
                if (!isNaN(lvlParsed)) level = Math.max(1, Math.min(100, lvlParsed));
            } else if (line.toLowerCase().startsWith('shiny:')) {
                isShiny = line.split(':')[1].trim().toLowerCase() === 'yes';
            } else if (line.startsWith('-')) {
                if (moves.length < 4) {
                    moves.push(line.replace(/^-+\s*/, '').trim());
                }
            }
        }

        parsedList.push({
            nickname: nickname || species.toUpperCase(),
            species,
            gender,
            heldItem,
            ability,
            level,
            isShiny,
            moves,
        });
    }

    return parsedList;
};

export const convertPokepasteToTeam = async (rawText: string): Promise<Pokemon[]> => {
    const parsedSlots = parseShowdownText(rawText);
    const team: Pokemon[] = [];

    for (const slot of parsedSlots) {
        const apiData = await fetchPokemonData(slot.species);

        const types = apiData ? apiData.types : ['normal'];
        const spriteUrl = apiData
            ? slot.isShiny
                ? apiData.spriteShiny
                : apiData.spriteNormal
            : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png`;

        team.push({
            id: crypto.randomUUID(),
            species: apiData ? apiData.name : slot.species.toLowerCase(),
            name: slot.nickname || slot.species.toUpperCase(),
            gender: slot.gender,
            level: slot.level,
            isShiny: slot.isShiny,
            spriteUrl,
            types,
            ability: slot.ability,
            heldItem: slot.heldItem,
            moves: slot.moves,
            status: 'party',
        });
    }

    return team;
};