import React, { useState } from 'react';
import type { RoomSettings } from '../../types/locke.types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    settings: RoomSettings;
    onSave: (newSettings: RoomSettings) => void;
}

export const RoomSettingsModal: React.FC<Props> = ({ isOpen, onClose, settings, onSave }) => {
    const [title, setTitle] = useState(settings.title);
    const [subtitle, setSubtitle] = useState(settings.subtitle || '');
    const [bannerData, setBannerData] = useState<string | undefined>(settings.bannerUrl);
    const [discordUrl, setDiscordUrl] = useState(settings.discordUrl || '');
    const [downloadUrl, setDownloadUrl] = useState(settings.downloadUrl || '');
    const [roomPin, setRoomPin] = useState(settings.roomPin);

    if (!isOpen) return null;

    const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setBannerData(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            title: title.trim(),
            subtitle: subtitle.trim() || undefined,
            bannerUrl: bannerData,
            discordUrl: discordUrl.trim() || undefined,
            downloadUrl: downloadUrl.trim() || undefined,
            roomPin: roomPin.trim() || '1234',
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#181a20]/80 backdrop-blur-sm">
            <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#31353f] p-5 shadow-2xl text-[#e5e8ee]">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-lg text-[#9ca3af] hover:text-white"
                >
                    ✕
                </button>

                <h2 className="text-sm font-bold text-white mb-4">Ajustes Globales del Panel (Admin)</h2>

                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <label className="block text-[10px] font-mono uppercase text-[#cbd5e1] font-semibold mb-1">
                            Nombre de la Partida
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-[#252830] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-mono uppercase text-[#cbd5e1] font-semibold mb-1">
                            Subtítulo / Regla Rápida
                        </label>
                        <input
                            type="text"
                            value={subtitle}
                            onChange={(e) => setSubtitle(e.target.value)}
                            placeholder="Ej: Randomlocke 30 vidas"
                            className="w-full bg-[#252830] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-[#6b7280] focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-mono uppercase text-[#cbd5e1] font-semibold mb-1">
                            Logo / Banner de la Partida
                        </label>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-[#252830] border border-white/10 flex items-center justify-center overflow-hidden font-bold text-xs text-[#9ca3af]">
                                {bannerData ? (
                                    <img src={bannerData} alt="Banner" className="w-full h-full object-cover" />
                                ) : (
                                    'LOGO'
                                )}
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleBannerUpload}
                                className="text-[11px] text-[#9ca3af] file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-[#424855] file:text-white hover:file:bg-[#4d5463] cursor-pointer"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block text-[10px] font-mono uppercase text-[#cbd5e1] font-semibold mb-1">
                                Enlace de Discord
                            </label>
                            <input
                                type="url"
                                value={discordUrl}
                                onChange={(e) => setDiscordUrl(e.target.value)}
                                placeholder="https://discord.gg/..."
                                className="w-full bg-[#252830] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-[#6b7280] focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-mono uppercase text-[#cbd5e1] font-semibold mb-1">
                                Descarga (Opcional)
                            </label>
                            <input
                                type="url"
                                value={downloadUrl}
                                onChange={(e) => setDownloadUrl(e.target.value)}
                                placeholder="https://..."
                                className="w-full bg-[#252830] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-[#6b7280] focus:outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-mono uppercase text-[#cbd5e1] font-semibold mb-1">
                            PIN de Sala General
                        </label>
                        <input
                            type="text"
                            value={roomPin}
                            onChange={(e) => setRoomPin(e.target.value)}
                            className="w-full bg-[#252830] border border-white/10 rounded-xl px-3 py-1.5 text-xs font-mono text-white focus:outline-none"
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-3 py-1.5 text-xs text-[#9ca3af] hover:text-white"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-1.5 text-xs font-bold rounded-xl bg-[#474e5d] hover:bg-[#525969] text-white"
                        >
                            Guardar Cambios
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};