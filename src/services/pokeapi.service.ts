export interface PokeAPISpeciesData {
    id: number;
    name: string;
    types: string[];
    abilities: string[];
    spriteNormal: string;
    spriteShiny: string;
}

export interface PokemonSuggestion {
    name: string;
    id: number;
    spriteThumb: string;
}

export interface GenericSuggestion {
    name: string;
    spriteThumb?: string;
}

// Cachés en memoria
let allPokemonCache: { name: string; url: string }[] | null = null;
let allAbilitiesCache: { name: string; url: string }[] | null = null;
let allItemsCache: { name: string; url: string }[] | null = null;
let allMovesCache: { name: string; url: string }[] | null = null;

export const loadPokemonIndex = async () => {
    if (allPokemonCache) return allPokemonCache;
    try {
        const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1025');
        if (!res.ok) return [];
        const data = await res.json();
        allPokemonCache = data.results;
        return data.results;
    } catch {
        return [];
    }
};

export const loadAbilitiesIndex = async () => {
    if (allAbilitiesCache) return allAbilitiesCache;
    try {
        const res = await fetch('https://pokeapi.co/api/v2/ability?limit=400');
        if (!res.ok) return [];
        const data = await res.json();
        allAbilitiesCache = data.results;
        return data.results;
    } catch {
        return [];
    }
};

export const loadItemsIndex = async () => {
    if (allItemsCache) return allItemsCache;
    try {
        const res = await fetch('https://pokeapi.co/api/v2/item?limit=2200');
        if (!res.ok) return [];
        const data = await res.json();
        allItemsCache = data.results;
        return data.results;
    } catch {
        return [];
    }
};

export const loadMovesIndex = async () => {
    if (allMovesCache) return allMovesCache;
    try {
        const res = await fetch('https://pokeapi.co/api/v2/move?limit=920');
        if (!res.ok) return [];
        const data = await res.json();
        allMovesCache = data.results;
        return data.results;
    } catch {
        return [];
    }
};

export const searchPokemonSuggestions = async (query: string): Promise<PokemonSuggestion[]> => {
    const cleanQuery = query.trim().toLowerCase();
    if (cleanQuery.length < 2) return [];

    const index = await loadPokemonIndex();
    const matches = index.filter((p) => p.name.includes(cleanQuery)).slice(0, 5);

    return matches.map((m) => {
        const parts = m.url.split('/').filter(Boolean);
        const id = parseInt(parts[parts.length - 1], 10);
        return {
            name: m.name,
            id,
            spriteThumb: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
        };
    });
};

export const searchAbilitySuggestions = async (query: string): Promise<string[]> => {
    const cleanQuery = query.trim().toLowerCase();
    if (cleanQuery.length < 2) return [];

    const index = await loadAbilitiesIndex();
    return index
        .filter((a) => a.name.includes(cleanQuery))
        .slice(0, 5)
        .map((a) => a.name.replace(/-/g, ' '));
};

export const searchItemSuggestions = async (query: string): Promise<GenericSuggestion[]> => {
    const cleanQuery = query.trim().toLowerCase();
    if (cleanQuery.length < 2) return [];

    const index = await loadItemsIndex();
    const matches = index.filter((i) => i.name.includes(cleanQuery)).slice(0, 5);

    return matches.map((m) => ({
        name: m.name.replace(/-/g, ' '),
        spriteThumb: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${m.name}.png`,
    }));
};

export const searchMoveSuggestions = async (query: string): Promise<string[]> => {
    const cleanQuery = query.trim().toLowerCase();
    if (cleanQuery.length < 2) return [];

    const index = await loadMovesIndex();
    return index
        .filter((m) => m.name.includes(cleanQuery))
        .slice(0, 5)
        .map((m) => m.name.replace(/-/g, ' '));
};

export const fetchPokemonData = async (queryOrId: string | number): Promise<PokeAPISpeciesData | null> => {
    try {
        const formattedQuery = String(queryOrId).trim().toLowerCase().replace(/\s+/g, '-');
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${formattedQuery}`);
        if (!res.ok) return null;

        const data = await res.json();
        const types = data.types.map((t: { type: { name: string } }) => t.type.name);
        const abilities = data.abilities.map((a: { ability: { name: string } }) => a.ability.name);

        const spriteNormal =
            data.sprites.other?.['showdown']?.front_default ||
            data.sprites.front_default ||
            '';

        const spriteShiny =
            data.sprites.other?.['showdown']?.front_shiny ||
            data.sprites.front_shiny ||
            spriteNormal;

        return {
            id: data.id,
            name: data.name,
            types,
            abilities,
            spriteNormal,
            spriteShiny,
        };
    } catch {
        return null;
    }
};