import React, { useState, useRef } from 'react';
import type { RoomSettings, GymConfig } from '../../types/locke.types';
import { TYPE_STYLES } from '../../types/pokemon.data';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    settings: RoomSettings;
    onSave: (newSettings: RoomSettings) => void;
}

export const RoomSettingsModal: React.FC<Props> = ({ isOpen, onClose, settings, onSave }) => {
    const [tab, setTab] = useState<'general' | 'gyms'>('general');

    // General
    const [title, setTitle] = useState(settings.title);
    const [subtitle, setSubtitle] = useState(settings.subtitle || '');
    const [bannerData, setBannerData] = useState<string | undefined>(settings.bannerUrl);
    const [discordUrl, setDiscordUrl] = useState(settings.discordUrl || '');
    const [downloadUrl, setDownloadUrl] = useState(settings.downloadUrl || '');
    const [roomPin, setRoomPin] = useState(settings.roomPin || '1234');
    const [adminPin, setAdminPin] = useState(settings.adminPin || '9999');
    const bannerFileInputRef = useRef<HTMLInputElement>(null);

    // Gimnasios
    const [gyms, setGyms] = useState<GymConfig[]>(settings.gyms || []);
    const [selectedGymIdx, setSelectedGymIdx] = useState<number>(0);
    const gymFileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const currentGym = gyms[selectedGymIdx] || gyms[0];
    const currentStyle = TYPE_STYLES[currentGym?.type?.toLowerCase()] || { bg: 'rgba(255,255,255,0.1)', text: '#fff', dot: '#94a3b8' };

    const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => setBannerData(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleRemoveBanner = () => {
        setBannerData(undefined);
        if (bannerFileInputRef.current) {
            bannerFileInputRef.current.value = '';
        }
    };

    const handleGymChange = (field: keyof GymConfig, value: string) => {
        setGyms((prev) => {
            const next = [...prev];
            next[selectedGymIdx] = { ...next[selectedGymIdx], [field]: value };
            return next;
        });
    };

    const handleGymIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => handleGymChange('iconUrl', reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleRemoveGymIcon = () => {
        handleGymChange('iconUrl', '');
        if (gymFileInputRef.current) {
            gymFileInputRef.current.value = '';
        }
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
            adminPin: adminPin.trim() || '9999',
            gyms,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
            <div className="relative w-full max-w-xl max-h-[92vh] flex flex-col rounded-3xl border border-white/10 bg-[#1c1f26] shadow-2xl text-slate-100 overflow-hidden">
                
                {/* Cabecera */}
                <div className="px-6 pt-5 pb-4 border-b border-white/10 bg-[#171920] flex items-center justify-between">
                    <div className="flex items-center gap-1.5 p-1 bg-[#242731] border border-white/10 rounded-xl">
                        <button
                            type="button"
                            onClick={() => setTab('general')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                tab === 'general'
                                    ? 'bg-[#3b4252] text-white shadow-sm'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            ⚙️ Sala & Pines
                        </button>
                        <button
                            type="button"
                            onClick={() => setTab('gyms')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                tab === 'gyms'
                                    ? 'bg-[#3b4252] text-white shadow-sm'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            🏅 Estuche de Medallas
                        </button>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
                    {tab === 'general' ? (
                        <>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1.5 font-semibold">
                                        Título del Reto
                                    </label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full bg-[#14161c] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-400/50"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1.5 font-semibold">
                                        Subtítulo / Modalidad
                                    </label>
                                    <input
                                        type="text"
                                        value={subtitle}
                                        onChange={(e) => setSubtitle(e.target.value)}
                                        placeholder="Ej: Dual Locke 30 vidas"
                                        className="w-full bg-[#14161c] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-400/50"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
                                <div className="bg-[#14161c] border border-white/5 p-3.5 rounded-2xl space-y-1.5">
                                    <label className="block text-[10px] font-mono uppercase text-slate-400 font-semibold">
                                        PIN Espectador (Viewer)
                                    </label>
                                    <input
                                        type="text"
                                        value={roomPin}
                                        onChange={(e) => setRoomPin(e.target.value)}
                                        className="w-full bg-[#1e222b] border border-white/10 rounded-lg px-3 py-1.5 text-xs font-mono text-center text-white focus:outline-none"
                                        required
                                    />
                                    <span className="text-[10px] text-slate-500 block">Solo lectura</span>
                                </div>

                                <div className="bg-[#14161c] border border-red-500/20 p-3.5 rounded-2xl space-y-1.5">
                                    <label className="block text-[10px] font-mono uppercase text-red-300 font-semibold">
                                        PIN Administrador
                                    </label>
                                    <input
                                        type="text"
                                        value={adminPin}
                                        onChange={(e) => setAdminPin(e.target.value)}
                                        className="w-full bg-[#1e222b] border border-red-500/30 rounded-lg px-3 py-1.5 text-xs font-mono text-center text-red-200 focus:outline-none"
                                        required
                                    />
                                    <span className="text-[10px] text-red-400/60 block">Control total</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                                        Discord
                                    </label>
                                    <input
                                        type="url"
                                        value={discordUrl}
                                        onChange={(e) => setDiscordUrl(e.target.value)}
                                        placeholder="https://discord.gg/..."
                                        className="w-full bg-[#14161c] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                                        Descarga / ROM
                                    </label>
                                    <input
                                        type="url"
                                        value={downloadUrl}
                                        onChange={(e) => setDownloadUrl(e.target.value)}
                                        placeholder="https://..."
                                        className="w-full bg-[#14161c] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-[10px] font-mono uppercase text-slate-400 font-semibold">
                                        Logo / Banner de la Partida
                                    </label>
                                    {bannerData && (
                                        <button
                                            type="button"
                                            onClick={handleRemoveBanner}
                                            className="text-[10px] text-red-400 hover:underline"
                                        >
                                            Quitar imagen
                                        </button>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 bg-[#14161c] p-2.5 rounded-2xl border border-white/5">
                                    <div className="w-10 h-10 rounded-xl bg-[#20242e] border border-white/10 flex items-center justify-center overflow-hidden font-bold text-xs text-slate-400 flex-shrink-0">
                                        {bannerData ? (
                                            <img src={bannerData} alt="Logo" className="w-full h-full object-cover" />
                                        ) : (
                                            'LOGO'
                                        )}
                                    </div>
                                    <input
                                        ref={bannerFileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleBannerUpload}
                                        className="text-[11px] text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:bg-[#2b303c] file:text-white cursor-pointer"
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        /* PESTAÑA: ESTUCHE DE MEDALLAS */
                        <div className="space-y-5">
                            <div>
                                <span className="block text-[11px] font-mono uppercase text-slate-400 font-semibold mb-2">
                                    Selecciona una medalla para editar:
                                </span>
                                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 bg-[#14161c] p-3 rounded-2xl border border-white/5">
                                    {gyms.map((gym, idx) => {
                                        const isSelected = selectedGymIdx === idx;
                                        const typeStyle = TYPE_STYLES[gym.type?.toLowerCase()] || { bg: 'rgba(255,255,255,0.08)', text: '#d1d5db', dot: '#94a3b8' };

                                        return (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedGymIdx(idx);
                                                    if (gymFileInputRef.current) gymFileInputRef.current.value = '';
                                                }}
                                                className={`relative p-2 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                                                    isSelected
                                                        ? 'scale-105 shadow-lg'
                                                        : 'opacity-70 hover:opacity-100 hover:border-white/20'
                                                }`}
                                                style={{
                                                    backgroundColor: isSelected ? typeStyle.bg : 'rgba(255,255,255,0.02)',
                                                    borderColor: isSelected ? typeStyle.dot : 'rgba(255,255,255,0.08)',
                                                    boxShadow: isSelected ? `0 0 16px ${typeStyle.dot}35` : 'none',
                                                }}
                                            >
                                                <div className="w-7 h-7 flex items-center justify-center mb-1">
                                                    {gym.iconUrl ? (
                                                        <img src={gym.iconUrl} alt={gym.name} className="w-full h-full object-contain pixelated drop-shadow" />
                                                    ) : (
                                                        <span className="text-xs font-mono font-black" style={{ color: typeStyle.text }}>
                                                            {idx + 1}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-[9px] font-mono truncate w-full text-center text-slate-300">
                                                    {gym.name || `#${idx + 1}`}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {currentGym && (
                                <div
                                    className="p-5 rounded-2xl border space-y-4 transition-all"
                                    style={{
                                        backgroundColor: 'rgba(20, 22, 28, 0.7)',
                                        borderColor: currentStyle.dot,
                                    }}
                                >
                                    <div className="flex items-center justify-between pb-3 border-b border-white/5">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: currentStyle.dot }} />
                                            <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                                                Gimnasio #{selectedGymIdx + 1} • {currentGym.name || 'Sin nombre'}
                                            </span>
                                        </div>
                                        <span
                                            className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold"
                                            style={{ backgroundColor: currentStyle.bg, color: currentStyle.text }}
                                        >
                                            {currentGym.type}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-[10px] text-slate-400 mb-1 font-semibold">
                                                Nombre de Medalla
                                            </label>
                                            <input
                                                type="text"
                                                value={currentGym.name}
                                                onChange={(e) => handleGymChange('name', e.target.value)}
                                                placeholder="Ej: Roca"
                                                className="w-full bg-[#171920] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[10px] text-slate-400 mb-1 font-semibold">
                                                Líder
                                            </label>
                                            <input
                                                type="text"
                                                value={currentGym.leader}
                                                onChange={(e) => handleGymChange('leader', e.target.value)}
                                                placeholder="Ej: Brock"
                                                className="w-full bg-[#171920] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[10px] text-slate-400 mb-1 font-semibold">
                                                Ciudad / Ubicación
                                            </label>
                                            <input
                                                type="text"
                                                value={currentGym.city}
                                                onChange={(e) => handleGymChange('city', e.target.value)}
                                                placeholder="Ej: Plateada"
                                                className="w-full bg-[#171920] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                        <div>
                                            <label className="block text-[10px] text-slate-400 mb-1 font-semibold">
                                                Tipo Elemental
                                            </label>
                                            <select
                                                value={currentGym.type.toLowerCase()}
                                                onChange={(e) => handleGymChange('type', e.target.value)}
                                                className="w-full bg-[#171920] border border-white/10 rounded-xl px-3 py-2 text-xs text-white capitalize focus:outline-none"
                                            >
                                                {['normal','fire','water','electric','grass','ice','fighting','poison','ground','flying','psychic','bug','rock','ghost','dragon','steel','fairy','dark'].map(t => (
                                                    <option key={t} value={t}>{t}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <label className="block text-[10px] text-slate-400 font-semibold">
                                                    Icono Personalizado (PNG)
                                                </label>
                                                {currentGym.iconUrl && (
                                                    <button
                                                        type="button"
                                                        onClick={handleRemoveGymIcon}
                                                        className="text-[10px] text-red-400 hover:underline"
                                                    >
                                                        Quitar icono
                                                    </button>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-[#14161c] border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                    {currentGym.iconUrl ? (
                                                        <img src={currentGym.iconUrl} alt="Icono" className="w-full h-full object-contain pixelated" />
                                                    ) : (
                                                        <span className="text-[10px] font-mono text-slate-500">#{selectedGymIdx + 1}</span>
                                                    )}
                                                </div>
                                                <input
                                                    ref={gymFileInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleGymIconUpload}
                                                    className="w-full text-[11px] text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:bg-[#2b303c] file:text-white cursor-pointer"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <span className="text-[11px] text-slate-500 font-mono">
                            Los cambios se guardan directamente en Supabase
                        </span>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-xs font-semibold rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
                            >
                                Guardar Ajustes
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};
