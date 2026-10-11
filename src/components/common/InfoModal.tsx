import React from 'react';
import type { RoomSettings } from '../../types/locke.types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    settings: RoomSettings;
}

export const InfoModal: React.FC<Props> = ({ isOpen, onClose, settings }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#181a20]/80 backdrop-blur-sm">
            <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-[#31353f] p-5 shadow-2xl text-[#e5e8ee]">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-lg text-[#9ca3af] hover:text-white"
                >
                    ✕
                </button>

                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-xl bg-[#252830] border border-white/10 flex items-center justify-center font-mono font-bold text-xs text-[#72b7e8]">
                        i
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-white tracking-tight">{settings.title}</h2>
                        <p className="text-xs text-[#9ca3af]">{settings.subtitle || 'Información de la partida'}</p>
                    </div>
                </div>

                <div className="space-y-3 text-xs text-[#cbd5e1] py-1">
                    <div className="p-3 bg-[#252830] rounded-xl border border-white/5 space-y-1">
                        <span className="font-semibold text-white block">Reglas activas:</span>
                        <ul className="list-disc list-inside space-y-0.5 text-[#9ca3af] text-[11px]">
                            <li>Contador inicial de 30 vidas.</li>
                            <li>Revivir permitido tras derrotar gimnasios.</li>
                            <li>Primer encuentro de ruta y randomizer completo.</li>
                        </ul>
                    </div>

                    {settings.discordUrl && (
                        <a
                            href={settings.discordUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-between p-2.5 rounded-xl bg-[#292f3d] hover:bg-[#32394a] border border-[#44516e]/40 text-[#a5b4fc] transition-colors"
                        >
              <span className="flex items-center gap-2 font-semibold">
                <span>💬</span> Discord del Grupo
              </span>
                            <span className="text-[10px] font-mono">Unirse →</span>
                        </a>
                    )}

                    {settings.downloadUrl && (
                        <a
                            href={settings.downloadUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-between p-2.5 rounded-xl bg-[#27332d] hover:bg-[#2f3d36] border border-[#3f5749]/40 text-[#86efac] transition-colors"
                        >
              <span className="flex items-center gap-2 font-semibold">
                <span>📦</span> Descarga del Juego / Parche
              </span>
                            <span className="text-[10px] font-mono">Descargar →</span>
                        </a>
                    )}
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-[#474e5d] text-white hover:bg-[#525969]"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};