import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import type { Trainer, RoomSettings } from '../../types/locke.types';

interface Props {
    trainers: Trainer[];
    settings: RoomSettings;
    onOpenCreate: () => void;
    onOpenInfo: () => void;
    onOpenSettings: () => void;
}

export const Navbar: React.FC<Props> = ({
                                            trainers,
                                            settings,
                                            onOpenCreate,
                                            onOpenInfo,
                                            onOpenSettings,
                                        }) => {
    const { auth, logout } = useAuth();
    const currentTrainer = trainers.find((t) => t.id === auth.trainerId);

    return (
        <header className="sticky top-0 z-40 border-b border-white/10 bg-[#2b2e36]/95 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">

                {/* Identidad con Logo */}
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#3a3f4b] border border-white/15 flex items-center justify-center overflow-hidden text-xs font-mono font-bold text-white shadow-inner">
                        {settings.bannerUrl ? (
                            <img src={settings.bannerUrl} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                            'PK'
                        )}
                    </div>
                    <div>
                        <span className="font-semibold text-sm text-white block leading-tight">{settings.title}</span>
                        {settings.subtitle && (
                            <span className="text-[10px] text-[#9ca3af] block leading-tight">{settings.subtitle}</span>
                        )}
                    </div>
                </div>

                {/* Acciones & Estado del Usuario */}
                <div className="flex items-center gap-2">
                    {/* Botón de información (i) */}
                    <button
                        onClick={onOpenInfo}
                        title="Información y enlaces"
                        className="w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs bg-[#373c47] hover:bg-[#404653] text-[#72b7e8] border border-white/10 transition-colors"
                    >
                        i
                    </button>

                    {/* Indicador de quién está conectado */}
                    <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-white bg-[#373c47] border border-white/15 px-2.5 py-1 rounded-md">
              {auth.role === 'admin'
                  ? '🛡️ Admin'
                  : auth.role === 'player'
                      ? `👤 ${currentTrainer?.name || 'Entrenador'}`
                      : 'Espectador'}
            </span>
                        <button
                            onClick={logout}
                            className="text-xs text-[#abb2bf] hover:text-white px-2 py-1 transition-colors"
                            title="Cambiar de usuario o salir"
                        >
                            Salir
                        </button>
                    </div>

                    {/* Botones exclusivos de Admin */}
                    {auth.role === 'admin' && (
                        <>
                            <button
                                onClick={onOpenSettings}
                                title="Configuración global del panel"
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs bg-[#373c47] hover:bg-[#404653] text-white border border-white/15 transition-colors"
                            >
                                ⚙️
                            </button>
                            <button
                                onClick={onOpenCreate}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#494f5d] hover:bg-[#535a6b] text-white border border-white/20 transition-colors"
                            >
                                + Entrenador
                            </button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};