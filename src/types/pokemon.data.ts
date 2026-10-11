import type { BadgeInfo } from './locke.types';

export interface StyledBadgeInfo extends BadgeInfo {
    activeColor: string;
    borderColor: string;
    bgTint: string;
}

export const KANTO_BADGES: StyledBadgeInfo[] = [
    { id: 0, name: 'Roca', leader: 'Brock', city: 'Plateada', type: 'rock', activeColor: '#bfa07a', borderColor: '#8c7050', bgTint: 'rgba(191, 160, 122, 0.16)' },
    { id: 1, name: 'Cascada', leader: 'Misty', city: 'Celeste', type: 'water', activeColor: '#72b7e8', borderColor: '#438ec4', bgTint: 'rgba(114, 183, 232, 0.16)' },
    { id: 2, name: 'Trueno', leader: 'Lt. Surge', city: 'Carmín', type: 'electric', activeColor: '#f0c760', borderColor: '#bd9635', bgTint: 'rgba(240, 199, 96, 0.16)' },
    { id: 3, name: 'Arcoíris', leader: 'Erika', city: 'Azulona', type: 'grass', activeColor: '#7ecd89', borderColor: '#4e9959', bgTint: 'rgba(126, 205, 137, 0.16)' },
    { id: 4, name: 'Alma', leader: 'Koga', city: 'Fucsia', type: 'poison', activeColor: '#cb8ee3', borderColor: '#965bb0', bgTint: 'rgba(203, 142, 227, 0.16)' },
    { id: 5, name: 'Pantano', leader: 'Sabrina', city: 'Azafrán', type: 'psychic', activeColor: '#f28cb6', borderColor: '#bf5481', bgTint: 'rgba(242, 140, 182, 0.16)' },
    { id: 6, name: 'Volcán', leader: 'Blaine', city: 'Canela', type: 'fire', activeColor: '#e8876e', borderColor: '#b5543c', bgTint: 'rgba(232, 135, 110, 0.16)' },
    { id: 7, name: 'Tierra', leader: 'Giovanni', city: 'Verde', type: 'ground', activeColor: '#c9a175', borderColor: '#946d42', bgTint: 'rgba(201, 161, 117, 0.16)' },
];

export const TYPE_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
    normal: { bg: 'rgba(148, 163, 184, 0.18)', text: '#cbd5e1', dot: '#94a3b8' },
    fire: { bg: 'rgba(239, 90, 80, 0.22)', text: '#fca5a5', dot: '#f87171' },
    water: { bg: 'rgba(56, 145, 240, 0.22)', text: '#93c5fd', dot: '#60a5fa' },
    electric: { bg: 'rgba(234, 185, 30, 0.22)', text: '#fde047', dot: '#facc15' },
    grass: { bg: 'rgba(60, 185, 95, 0.22)', text: '#86efac', dot: '#4ade80' },
    ice: { bg: 'rgba(56, 189, 230, 0.22)', text: '#a5f3fc', dot: '#38bdf8' },
    fighting: { bg: 'rgba(240, 120, 50, 0.22)', text: '#fdba74', dot: '#fb923c' },
    poison: { bg: 'rgba(175, 95, 230, 0.22)', text: '#d8b4fe', dot: '#c084fc' },
    ground: { bg: 'rgba(195, 135, 70, 0.22)', text: '#fed7aa', dot: '#f59e0b' },
    flying: { bg: 'rgba(130, 145, 245, 0.22)', text: '#c7d2fe', dot: '#818cf8' },
    psychic: { bg: 'rgba(240, 95, 160, 0.22)', text: '#f9a8d4', dot: '#f472b6' },
    bug: { bg: 'rgba(145, 195, 45, 0.22)', text: '#bef264', dot: '#a3e635' },
    rock: { bg: 'rgba(175, 165, 130, 0.22)', text: '#e7e5e4', dot: '#d6d3d1' },
    ghost: { bg: 'rgba(140, 105, 230, 0.22)', text: '#ddd6fe', dot: '#a78bfa' },
    dragon: { bg: 'rgba(110, 115, 240, 0.24)', text: '#c7d2fe', dot: '#6366f1' },
    steel: { bg: 'rgba(115, 140, 160, 0.22)', text: '#cbd5e1', dot: '#94a3b8' },
    fairy: { bg: 'rgba(245, 130, 190, 0.22)', text: '#fbcfe8', dot: '#f472b6' },
    dark: { bg: 'rgba(80, 85, 95, 0.35)', text: '#cbd5e1', dot: '#64748b' },
};

// Paleta de colores temáticos para entrenadores
export const TRAINER_PALETTES = [
    { name: 'Ámbar', border: '#b8944d', bgBadge: '#3b3425', text: '#e8ca7d' },
    { name: 'Menta', border: '#4a9978', bgBadge: '#233830', text: '#88dbb4' },
    { name: 'Lavanda', border: '#8b6fb5', bgBadge: '#332945', text: '#c6aee6' },
    { name: 'Coral', border: '#b5685a', bgBadge: '#3d2b27', text: '#e89e90' },
    { name: 'Cielo', border: '#5487b5', bgBadge: '#263445', text: '#93c2eb' },
];