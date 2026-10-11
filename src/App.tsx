import { useState, useEffect, useCallback } from 'react';
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
import { lockeService, DEFAULT_GYMS } from './services/locke.service';
import type { Pokemon, Trainer, RoomSettings } from './types/locke.types';

function AppContent() {
    const { auth, loginWithPin } = useAuth();

    const [settings, setSettings] = useState<RoomSettings>({
        title: 'Pokémon Añil Locke',
        subtitle: 'Tracker Multijugador Cooperativo',
        discordUrl: 'https://discord.gg/pokemon',
        roomPin: '1234',
        adminPin: '9999',
        gyms: DEFAULT_GYMS,
    });

    const [trainers, setTrainers] = useState<Trainer[]>([]);
    const [loading, setLoading] = useState(true);

    const refreshData = useCallback(async () => {
        const [sData, tData] = await Promise.all([
            lockeService.getRoomSettings(),
            lockeService.getFullTrainers(),
        ]);
        if (sData) setSettings(sData);
        setTrainers(tData);
        setLoading(false);
    }, []);

    useEffect(() => {
        refreshData();
        const unsubscribe = lockeService.subscribeToChanges(() => {
            refreshData();
        });
        return () => unsubscribe();
    }, [refreshData]);

    // Modales
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

    if (loading) {
        return (
            <div className="min-h-screen bg-[#242730] flex items-center justify-center text-slate-300 font-mono text-sm">
                Conectando con Supabase...
            </div>
        );
    }

    if (auth.role === 'locked') {
        return (
            <PinAuthScreen
                roomTitle={settings.title}
                onLogin={(pin) => loginWithPin(pin, trainers, settings)}
            />
        );
    }

    const handleSaveSettings = async (newS: RoomSettings) => {
        setSettings(newS);
        await lockeService.updateRoomSettings(newS);
        refreshData();
    };

    const handleCreateTrainer = async (newT: Trainer) => {
        setTrainers((prev) => [...prev, newT]);
        await lockeService.createTrainer(newT);
        refreshData();
    };

    const handleUpdateTrainer = async (up: Trainer) => {
        setTrainers((prev) => prev.map((t) => (t.id === up.id ? up : t)));
        await lockeService.updateTrainer(up);
        refreshData();
    };

    const handleDeleteTrainer = async (id: string) => {
        setTrainers((prev) => prev.filter((t) => t.id !== id));
        await lockeService.deleteTrainer(id);
        refreshData();
    };

    const handleUpdateLives = async (trainerId: string, delta: number) => {
        const current = trainers.find((t) => t.id === trainerId);
        if (!current) return;
        const newLives = Math.max(0, current.lives + delta);

        setTrainers((prev) =>
            prev.map((t) => (t.id === trainerId ? { ...t, lives: newLives } : t))
        );

        await lockeService.updateTrainerLives(trainerId, newLives);

        if (delta < 0 && current.party.length > 0) {
            setFaintingTrainer(current);
        }
        refreshData();
    };

    const handleToggleBadge = async (trainerId: string, badgeIndex: number) => {
        const current = trainers.find((t) => t.id === trainerId);
        if (!current) return;
        const newBadges = [...current.badges];
        newBadges[badgeIndex] = !newBadges[badgeIndex];

        setTrainers((prev) =>
            prev.map((t) => (t.id === trainerId ? { ...t, badges: newBadges } : t))
        );

        await lockeService.updateTrainerBadges(trainerId, newBadges);
        refreshData();
    };

    const handleSaveSlot = async (trainerId: string, updatedPokemon: Pokemon) => {
        await lockeService.savePokemonSlot(trainerId, updatedPokemon);
        refreshData();
    };

    const handleDeleteSlot = async (_trainerId: string, pokemonId: string) => {
        await lockeService.deletePokemon(pokemonId);
        refreshData();
    };

    const handleDirectFaint = async (_trainerId: string, pokemonId: string) => {
        await lockeService.markPokemonFainted(pokemonId);
        refreshData();
    };

    const handleRevive = async (_trainerId: string, pokemonId: string) => {
        await lockeService.revivePokemon(pokemonId);
        refreshData();
    };

    const handleDeleteFainted = async (_trainerId: string, pokemonId: string) => {
        await lockeService.deletePokemon(pokemonId);
        refreshData();
    };

    const handleApplyTeam = async (trainerId: string, newParty: Pokemon[]) => {
        await lockeService.replaceTeam(trainerId, newParty);
        refreshData();
    };

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

                <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {trainers.map((trainer, index) => (
                        <TrainerCard
                            key={trainer.id}
                            trainer={trainer}
                            trainerIndex={index}
                            gyms={settings.gyms}
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

            <InfoModal
                isOpen={isInfoOpen}
                onClose={() => setIsInfoOpen(false)}
                settings={settings}
            />

            <RoomSettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                settings={settings}
                onSave={handleSaveSettings}
            />

            <CreateTrainerModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onTrainerCreated={handleCreateTrainer}
            />

            <EditTrainerModal
                trainer={editingTrainer}
                isOpen={!!editingTrainer}
                onClose={() => setEditingTrainer(null)}
                onUpdateTrainer={handleUpdateTrainer}
                onDeleteTrainer={handleDeleteTrainer}
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
