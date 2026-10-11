import { supabase } from './supabase';
import type { RoomSettings, Trainer, Pokemon, GymConfig } from '../types/locke.types';

export const DEFAULT_GYMS: GymConfig[] = [
  { id: 0, name: 'Roca', leader: 'Brock', city: 'Plateada', type: 'rock' },
  { id: 1, name: 'Cascada', leader: 'Misty', city: 'Celeste', type: 'water' },
  { id: 2, name: 'Trueno', leader: 'Lt. Surge', city: 'Carmín', type: 'electric' },
  { id: 3, name: 'Arcoíris', leader: 'Erika', city: 'Azulona', type: 'grass' },
  { id: 4, name: 'Alma', leader: 'Koga', city: 'Fucsia', type: 'poison' },
  { id: 5, name: 'Pantano', leader: 'Sabrina', city: 'Azafrán', type: 'psychic' },
  { id: 6, name: 'Volcán', leader: 'Blaine', city: 'Canela', type: 'fire' },
  { id: 7, name: 'Tierra', leader: 'Giovanni', city: 'Verde', type: 'ground' },
];

interface DBRoomSettings {
  id: string;
  title: string;
  subtitle: string | null;
  banner_url: string | null;
  discord_url: string | null;
  download_url: string | null;
  room_pin: string | null;
  admin_pin: string | null;
  gyms: GymConfig[] | null;
}

interface DBTrainer {
  id: string;
  name: string;
  avatar_url: string | null;
  access_code: string;
  lives: number;
  max_lives: number;
  badges: boolean[];
}

interface DBPokemon {
  id: string;
  trainer_id: string;
  species: string;
  name: string;
  gender: 'M' | 'F' | 'N';
  level: number;
  is_shiny: boolean;
  sprite_url: string;
  types: string[];
  ability: string | null;
  held_item: string | null;
  moves: string[];
  status: 'party' | 'fainted';
  fainted_at: string | null;
}

export const lockeService = {
  async getRoomSettings(): Promise<RoomSettings | null> {
    const { data, error } = await supabase
      .from('room_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;
    const row = data as DBRoomSettings;
    return {
      title: row.title,
      subtitle: row.subtitle || undefined,
      bannerUrl: row.banner_url || undefined,
      discordUrl: row.discord_url || undefined,
      downloadUrl: row.download_url || undefined,
      roomPin: row.room_pin || '1234',
      adminPin: row.admin_pin || '9999',
      gyms: row.gyms && row.gyms.length === 8 ? row.gyms : DEFAULT_GYMS,
    };
  },

  async updateRoomSettings(settings: RoomSettings): Promise<boolean> {
    const { data: existing } = await supabase.from('room_settings').select('id').limit(1).maybeSingle();
    const payload = {
      title: settings.title,
      subtitle: settings.subtitle || null,
      banner_url: settings.bannerUrl || null,
      discord_url: settings.discordUrl || null,
      download_url: settings.downloadUrl || null,
      room_pin: settings.roomPin,
      admin_pin: settings.adminPin,
      gyms: settings.gyms,
    };

    if (existing?.id) {
      const { error } = await supabase.from('room_settings').update(payload).eq('id', existing.id);
      return !error;
    } else {
      const { error } = await supabase.from('room_settings').insert([payload]);
      return !error;
    }
  },

  async getFullTrainers(): Promise<Trainer[]> {
    const { data: tData, error: tError } = await supabase
      .from('trainers')
      .select('*')
      .order('created_at', { ascending: true });

    if (tError || !tData) return [];

    const { data: pData, error: pError } = await supabase
      .from('pokemon')
      .select('*')
      .order('created_at', { ascending: true });

    const allPokemon = (pError || !pData ? [] : pData) as DBPokemon[];

    return (tData as DBTrainer[]).map((t) => {
      const trainerPkms = allPokemon.filter((p) => p.trainer_id === t.id);
      
      const mapPkm = (p: DBPokemon): Pokemon => ({
        id: p.id,
        species: p.species,
        name: p.name,
        gender: p.gender,
        level: p.level,
        isShiny: p.is_shiny,
        spriteUrl: p.sprite_url,
        types: p.types || [],
        ability: p.ability || undefined,
        heldItem: p.held_item || undefined,
        moves: p.moves || [],
        status: p.status,
        faintedAt: p.fainted_at || undefined,
      });

      return {
        id: t.id,
        name: t.name,
        avatarUrl: t.avatar_url || undefined,
        accessCode: t.access_code,
        lives: t.lives,
        maxLives: t.max_lives,
        badges: t.badges || Array(8).fill(false),
        party: trainerPkms.filter((p) => p.status === 'party').map(mapPkm),
        graveyard: trainerPkms.filter((p) => p.status === 'fainted').map(mapPkm),
      };
    });
  },

  async createTrainer(trainer: Trainer): Promise<boolean> {
    const { error } = await supabase.from('trainers').insert([{
      id: trainer.id,
      name: trainer.name,
      avatar_url: trainer.avatarUrl || null,
      access_code: trainer.accessCode,
      lives: trainer.lives,
      max_lives: trainer.maxLives,
      badges: trainer.badges,
    }]);
    return !error;
  },

  async updateTrainer(trainer: Trainer): Promise<boolean> {
    const { error } = await supabase.from('trainers').update({
      name: trainer.name,
      avatar_url: trainer.avatarUrl || null,
      access_code: trainer.accessCode,
      lives: trainer.lives,
      max_lives: trainer.maxLives,
      badges: trainer.badges,
    }).eq('id', trainer.id);
    return !error;
  },

  async deleteTrainer(id: string): Promise<boolean> {
    const { error } = await supabase.from('trainers').delete().eq('id', id);
    return !error;
  },

  async updateTrainerLives(id: string, lives: number): Promise<boolean> {
    const { error } = await supabase.from('trainers').update({ lives: Math.max(0, lives) }).eq('id', id);
    return !error;
  },

  async updateTrainerBadges(id: string, badges: boolean[]): Promise<boolean> {
    const { error } = await supabase.from('trainers').update({ badges }).eq('id', id);
    return !error;
  },

  async savePokemonSlot(trainerId: string, pkm: Pokemon): Promise<boolean> {
    const payload = {
      id: pkm.id,
      trainer_id: trainerId,
      species: pkm.species,
      name: pkm.name,
      gender: pkm.gender || 'N',
      level: pkm.level,
      is_shiny: pkm.isShiny,
      sprite_url: pkm.spriteUrl,
      types: pkm.types,
      ability: pkm.ability || null,
      held_item: pkm.heldItem || null,
      moves: pkm.moves || [],
      status: pkm.status,
      fainted_at: pkm.faintedAt || null,
    };
    const { error } = await supabase.from('pokemon').upsert(payload);
    return !error;
  },

  async deletePokemon(pokemonId: string): Promise<boolean> {
    const { error } = await supabase.from('pokemon').delete().eq('id', pokemonId);
    return !error;
  },

  async markPokemonFainted(pokemonId: string): Promise<boolean> {
    const { error } = await supabase
      .from('pokemon')
      .update({ status: 'fainted', fainted_at: new Date().toISOString() })
      .eq('id', pokemonId);
    return !error;
  },

  async revivePokemon(pokemonId: string): Promise<boolean> {
    const { error } = await supabase
      .from('pokemon')
      .update({ status: 'party', fainted_at: null })
      .eq('id', pokemonId);
    return !error;
  },

  async replaceTeam(trainerId: string, newParty: Pokemon[]): Promise<boolean> {
    await supabase.from('pokemon').delete().eq('trainer_id', trainerId).eq('status', 'party');
    if (newParty.length === 0) return true;

    const rows = newParty.map((p) => ({
      id: p.id,
      trainer_id: trainerId,
      species: p.species,
      name: p.name,
      gender: p.gender || 'N',
      level: p.level,
      is_shiny: p.isShiny,
      sprite_url: p.spriteUrl,
      types: p.types,
      ability: p.ability || null,
      held_item: p.heldItem || null,
      moves: p.moves || [],
      status: 'party',
    }));

    const { error } = await supabase.from('pokemon').insert(rows);
    return !error;
  },

  subscribeToChanges(onUpdate: () => void) {
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        onUpdate();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
