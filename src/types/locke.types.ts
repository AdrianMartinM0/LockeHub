export type UserRole = 'locked' | 'player' | 'admin';

export interface RoomSettings {
    title: string;
    subtitle?: string;
    bannerUrl?: string;
    discordUrl?: string;
    downloadUrl?: string;
}

export interface Pokemon {
    id: string;
    species: string;
    name: string;
    gender?: 'M' | 'F' | 'N';
    level: number;
    isShiny: boolean;
    spriteUrl: string;
    types: string[];
    ability?: string;
    heldItem?: string;
    moves?: string[]; // Hasta 4 movimientos
    status: 'party' | 'fainted';
    faintCause?: string;
    faintedAt?: string;
}

export interface Trainer {
    id: string;
    name: string;
    avatarUrl?: string;
    accessCode: string;
    lives: number;
    maxLives: number;
    badges: boolean[];
    party: Pokemon[];
    graveyard: Pokemon[];
}

export interface AuthState {
    role: UserRole;
    trainerId?: string;
}