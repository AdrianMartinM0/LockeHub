import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navbar } from './components/common/Navbar';
import { PinAuthScreen } from './components/common/PinAuthScreen';
import { InfoModal } from './components/common/InfoModal';
import { RoomSettingsModal } from './components/admin/RoomSettingsModal';
import { TrainerCard } from './components/trainers/TrainerCard';
import { CreateTrainerModal } from './components/admin/CreateTrainerModal';
import { EditTrainerModal } from './components/admin/EditTrainerModal';
import { PokemonSlotModal } from './components/trainers/PokemonSlotModal';
import { GraveyardModal } from './components/trainers/GraveyardModal';
import { FaintModal } from './components/trainers/FaintModal';
import { PokepasteModal } from './components/trainers/PokepasteModal';
import type { Pokemon, Trainer, RoomSettings } from './types/locke.types';

function AppContent() {
    const { auth, loginWithPin } = useAuth();

    // Configuración de la partida
    const [settings, setSettings] = useState<RoomSettings>({
        title: 'Pokémon Añil Locke',
        subtitle: 'Tracker Multijugador Cooperativo',
        discordUrl: 'https://discord.gg/pokemon',
    });

    const [trainers, setTrainers] = useState<Trainer[]>([
        {
            id: '1',
            name: 'Adrián',
            accessCode: 'PK-ADRI',
            lives: 30,
            maxLives: 30,
            badges: [true, true, false, false, false, false, false, false],
            party: [
                {
                    id: 'p1',
                    species: 'charizard',
                    name: 'Charizard',
                    level: 36,
                    isShiny: false,
                    ability: 'blaze',
                    heldItem: 'leftovers',
                    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png',
                    types: ['fire', 'flying'],
                    status: 'party',
                },
            ],
            graveyard: [],
        },
    ]);

    // Estados de Modales
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isInfoOpen, setIsInfoOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null);
    const [viewingGraveTrainer, setViewingGraveTrainer] = useState<Trainer | null>(null);
    const [faintingTrainer, setFaintingTrainer] = useState<Trainer | null>(null);
    const [pokepasteTrainer, setPokepasteTrainer] = useState<Trainer | null>(null);

    const [selectedSlotData, setSelectedSlotData] = useState<{
        trainer: Trainer;
        pokemon: Pokemon | null;
        slotIndex: number;
    } | null>(null);

    // SI NO HAY SESIÓN: Mostrar pantalla de PIN obligatoria
    if (auth.role === 'locked') {
        return (
            <PinAuthScreen
                roomTitle={settings.title}
                onLogin={(pin) => loginWithPin(pin, trainers)}
            />
        );
    }

    // Actualizar vidas
    const handleUpdateLives = (trainerId: string, delta: number) => {
        setTrainers((prev) =>
            prev.map((t) => {
                if (t.id !== trainerId) return t;
                const newLives = Math.max(0, t.lives + delta);
                return { ...t, lives: newLives };
            })
        );

        if (delta < 0) {
            const current = trainers.find((t) => t.id === trainerId);
            if (current && current.party.length > 0) {
                setFaintingTrainer(current);
            }
        }
    };

    // Guardar Slot individual
    const handleSaveSlot = (trainerId: string, updatedPokemon: Pokemon) => {
        setTrainers((prev) =>
            prev.map((t) => {
                if (t.id !== trainerId) return t;
                const existingIndex = t.party.findIndex((p) => p.id === updatedPokemon.id);
                const newParty = [...t.party];

                if (existingIndex >= 0) {
                    newParty[existingIndex] = updatedPokemon;
                } else {
                    if (newParty.length < 6) {
                        newParty.push(updatedPokemon);
                    }
                }
                return { ...t, party: newParty };
            })
        );
    };

    // Aplicar equipo completo importado desde Poképaste
    const handleApplyTeam = (trainerId: string, newParty: Pokemon[]) => {
        setTrainers((prev) =>
            prev.map((t) => (t.id === trainerId ? { ...t, party: newParty } : t))
        );
    };

    const handleDeleteSlot = (trainerId: string, pokemonId: string) => {
        setTrainers((prev) =>
            prev.map((t) => (t.id === trainerId ? { ...t, party: t.party.filter((p) => p.id !== pokemonId) } : t))
        );
    };

    const handleDirectFaint = (trainerId: string, pokemonId: string) => {
        setTrainers((prev) =>
            prev.map((t) => {
                if (t.id !== trainerId) return t;
                const pkm = t.party.find((p) => p.id === pokemonId);
                if (!pkm) return t;

                const faintedPkm: Pokemon = {
                    ...pkm,
                    status: 'fainted',
                    faintedAt: new Date().toISOString(),
                };

                return {
                    ...t,
                    party: t.party.filter((p) => p.id !== pokemonId),
                    graveyard: [faintedPkm, ...t.graveyard],
                };
            })
        );
    };

    const handleRevive = (trainerId: string, pokemonId: string) => {
        setTrainers((prev) =>
            prev.map((t) => {
                if (t.id !== trainerId || t.party.length >= 6) return t;
                const pkm = t.graveyard.find((p) => p.id === pokemonId);
                if (!pkm) return t;

                const revivedPkm: Pokemon = {
                    ...pkm,
                    status: 'party',
                    faintedAt: undefined,
                };

                return {
                    ...t,
                    graveyard: t.graveyard.filter((p) => p.id !== pokemonId),
                    party: [...t.party, revivedPkm],
                };
            })
        );
    };

    const handleDeleteFainted = (trainerId: string, pokemonId: string) => {
        setTrainers((prev) =>
            prev.map((t) => {
                if (t.id !== trainerId) return t;
                return {
                    ...t,
                    graveyard: t.graveyard.filter((p) => p.id !== pokemonId),
                };
            })
        );
    };

    const handleToggleBadge = (trainerId: string, badgeIndex: number) => {
        setTrainers((prev) =>
            prev.map((t) => {
                if (t.id !== trainerId) return t;
                const newBadges = [...t.badges];
                newBadges[badgeIndex] = !newBadges[badgeIndex];
                return { ...t, badges: newBadges };
            })
        );
    };

    // Métricas Globales
    const totalLives = trainers.reduce((acc, t) => acc + t.lives, 0);
    const totalBadges = trainers.reduce((acc, t) => acc + t.badges.filter(Boolean).length, 0);
    const totalFainted = trainers.reduce((acc, t) => acc + t.graveyard.length, 0);

    return (
        <div className="min-h-screen pb-20">
            <Navbar
                trainers={trainers}
                settings={settings}
                onOpenCreate={() => setIsCreateOpen(true)}
                onOpenInfo={() => setIsInfoOpen(true)}
                onOpenSettings={() => setIsSettingsOpen(true)}
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
                {/* PANEL PRINCIPAL DE MÉTRICAS */}
                <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="rounded-2xl border border-white/10 bg-[#31353f] p-4 shadow-sm flex flex-col justify-between">
                        <span className="text-[11px] font-mono uppercase text-[#9ca3af] font-semibold">Entrenadores</span>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-2xl sm:text-3xl font-black font-mono text-white">{trainers.length}</span>
                            <span className="text-xs text-[#9ca3af]">en juego</span>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-[#31353f] p-4 shadow-sm flex flex-col justify-between">
                        <span className="text-[11px] font-mono uppercase text-[#9ca3af] font-semibold">Vidas Grupales</span>
                        <div className="mt-2 flex items-baseline gap-1.5">
                            <span className="text-sm">♥</span>
                            <span className="text-2xl sm:text-3xl font-black font-mono text-[#f87171]">{totalLives}</span>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-[#31353f] p-4 shadow-sm flex flex-col justify-between">
                        <span className="text-[11px] font-mono uppercase text-[#9ca3af] font-semibold">Medallas Totales</span>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-2xl sm:text-3xl font-black font-mono text-[#f0c760]">{totalBadges}</span>
                            <span className="text-xs text-[#9ca3af]">de {trainers.length * 8}</span>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-[#31353f] p-4 shadow-sm flex flex-col justify-between">
                        <span className="text-[11px] font-mono uppercase text-[#9ca3af] font-semibold">Bajas Registradas</span>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-2xl sm:text-3xl font-black font-mono text-[#fca5a5]">{totalFainted}</span>
                            <span className="text-xs text-[#9ca3af]">caídos</span>
                        </div>
                    </div>
                </section>

                {/* Grid de Jugadores */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {trainers.map((trainer, index) => (
                        <TrainerCard
                            key={trainer.id}
                            trainer={trainer}
                            trainerIndex={index}
                            onSelectSlot={(t, pkm, slotIdx) => setSelectedSlotData({ trainer: t, pokemon: pkm, slotIndex: slotIdx })}
                            onToggleBadge={handleToggleBadge}
                            onUpdateLives={handleUpdateLives}
                            onOpenGraveyard={(t) => setViewingGraveTrainer(t)}
                            onEditTrainer={(t) => setEditingTrainer(t)}
                            onOpenPokepaste={(t) => setPokepasteTrainer(t)}
                        />
                    ))}
                </section>
            </main>

            {/* Modales */}
            <InfoModal
                isOpen={isInfoOpen}
                onClose={() => setIsInfoOpen(false)}
                settings={settings}
            />

            <RoomSettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                settings={settings}
                onSave={(newS) => setSettings(newS)}
            />

            <CreateTrainerModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onTrainerCreated={(newT) => setTrainers((prev) => [...prev, newT])}
            />

            <EditTrainerModal
                trainer={editingTrainer}
                isOpen={!!editingTrainer}
                onClose={() => setEditingTrainer(null)}
                onUpdateTrainer={(up) => setTrainers((prev) => prev.map((t) => (t.id === up.id ? up : t)))}
                onDeleteTrainer={(id) => setTrainers((prev) => prev.filter((t) => t.id !== id))}
            />

            <PokemonSlotModal
                trainer={selectedSlotData?.trainer || null}
                pokemon={selectedSlotData?.pokemon || null}
                slotIndex={selectedSlotData?.slotIndex || 0}
                isOpen={!!selectedSlotData}
                onClose={() => setSelectedSlotData(null)}
                onSave={handleSaveSlot}
                onDelete={handleDeleteSlot}
                onFaint={handleDirectFaint}
            />

            <PokepasteModal
                trainer={pokepasteTrainer}
                isOpen={!!pokepasteTrainer}
                onClose={() => setPokepasteTrainer(null)}
                onApplyTeam={handleApplyTeam}
            />

            <GraveyardModal
                trainer={viewingGraveTrainer}
                isOpen={!!viewingGraveTrainer}
                onClose={() => setViewingGraveTrainer(null)}
                onRevive={handleRevive}
                onDeleteFainted={handleDeleteFainted}
            />

            <FaintModal
                trainer={faintingTrainer}
                isOpen={!!faintingTrainer}
                onClose={() => setFaintingTrainer(null)}
                onConfirmFaint={handleDirectFaint}
            />
        </div>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}