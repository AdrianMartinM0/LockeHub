export type UserRole = 'locked' | 'viewer' | 'player' | 'admin';

export interface GymConfig {
    id: number;
    name: string;
    leader: string;
    city: string;
    type: string;
    iconUrl?: string;
}

export interface RoomSettings {
    title: string;
    subtitle?: string;
    bannerUrl?: string;
    discordUrl?: string;
    downloadUrl?: string;
    roomPin: string;
    adminPin: string;
    gyms: GymConfig[];
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
    moves?: string[];
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
