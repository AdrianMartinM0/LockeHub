import React, { useState, useEffect, useRef } from 'react';
import type { Trainer } from '../../types/locke.types';

interface Props {
    trainer: Trainer | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdateTrainer: (updated: Trainer) => void;
    onDeleteTrainer: (trainerId: string) => void;
}

export const EditTrainerModal: React.FC<Props> = ({
    trainer,
    isOpen,
    onClose,
    onUpdateTrainer,
    onDeleteTrainer,
}) => {
    const [name, setName] = useState('');
    const [avatarData, setAvatarData] = useState<string | undefined>(undefined);
    const [accessCode, setAccessCode] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (trainer) {
            setName(trainer.name);
            setAvatarData(trainer.avatarUrl);
            setAccessCode(trainer.accessCode);
        }
    }, [trainer, isOpen]);

    if (!isOpen || !trainer) return null;

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarData(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveAvatar = () => {
        setAvatarData(undefined);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleRegenerateCode = () => {
        const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
        setAccessCode(`PK-${randomHex}`);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdateTrainer({
            ...trainer,
            name: name.trim(),
            avatarUrl: avatarData,
            accessCode,
        });
        onClose();
    };

    const handleDelete = () => {
        if (confirm(`¿Eliminar definitivamente a ${trainer.name}? Se perderán sus datos y bajas.`)) {
            onDeleteTrainer(trainer.id);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#181a20]/80 backdrop-blur-sm">
            <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-[#31353f] p-5 shadow-2xl text-[#e5e8ee]">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-lg text-[#9ca3af] hover:text-white"
                >
                    ✕
                </button>

                <h2 className="text-sm font-bold text-white mb-4">Ajustes de Entrenador (Admin)</h2>

                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-mono text-[#cbd5e1] uppercase mb-1 font-semibold">
                            Nombre
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-[#252830] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                            required
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-[10px] font-mono text-[#cbd5e1] uppercase font-semibold">
                                Foto de Perfil
                            </label>
                            {avatarData && (
                                <button
                                    type="button"
                                    onClick={handleRemoveAvatar}
                                    className="text-[10px] text-red-400 hover:underline"
                                >
                                    Quitar foto
                                </button>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-[#252830] border border-white/10 flex items-center justify-center overflow-hidden font-bold text-xs text-[#9ca3af] flex-shrink-0">
                                {avatarData ? (
                                    <img src={avatarData} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    name.slice(0, 2).toUpperCase()
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="text-[11px] text-[#9ca3af] file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-[#424855] file:text-white hover:file:bg-[#4d5463] cursor-pointer"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-mono text-[#cbd5e1] uppercase mb-1 font-semibold">
                            PIN de Acceso del Jugador
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={accessCode}
                                readOnly
                                className="flex-1 bg-[#252830] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white select-all"
                            />
                            <button
                                type="button"
                                onClick={handleRegenerateCode}
                                className="px-3 py-1.5 bg-[#424855] hover:bg-[#4d5463] text-xs font-semibold text-white rounded-xl transition-colors cursor-pointer"
                                title="Generar nuevo PIN"
                            >
                                Regenerar
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-white/10">
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="px-3 py-1.5 text-xs text-[#fca5a5] hover:bg-[#3f2a2a] rounded-lg transition-colors border border-[#783e3e]/40 cursor-pointer"
                        >
                            Eliminar
                        </button>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-3 py-1.5 text-xs text-[#9ca3af] hover:text-white"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-1.5 text-xs font-bold rounded-xl bg-[#474e5d] hover:bg-[#525969] text-white transition-colors cursor-pointer"
                            >
                                Guardar
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};
