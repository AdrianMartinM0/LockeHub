Documentación del Frontend y Hoja de Ruta BackendProyecto: Locke Tracker (Pokémon Añil)Stack Frontend: React + TypeScript + Vite + Tailwind CSS + PokéAPI v2Destino Backend: Supabase (PostgreSQL + RLS + Storage)1. Resumen Ejecutivo del FrontendLa aplicación es un tracker interactivo en tiempo real diseñado para seguir una partida cooperativa/competitiva de Pokémon Añil Randomlocke. Toda la experiencia visual y funcional está finalizada en el cliente, con persistencia temporal en estado reactivo y sesión en localStorage.Principios de DiseñoPaleta Cálida Neutra ("Warm Mid-tone Grey"): Fondos en #242730 y tarjetas en #31353f con bordes suaves al 10% de opacidad blanca (border-white/10). Sin neones ni estridencias de plantilla.Acentos Mate Orgánicos: Colores pastel distintivos por tipo elemental y medalla de Kanto, además de asignación cromática dinámica por entrenador (ámbar, menta, lavanda, coral, cielo).Flujo Slot a Slot: No existen formularios genéricos de equipo; la interacción se realiza directamente sobre cada uno de los 6 slots activos o sobre los Pokémon caídos.Seguridad por PIN de Entrada Única: Acceso bloqueado por defecto. No existe modo espectador anónimo. Se requiere PIN de Admin (9999) o código de jugador (PK-XXXX).2. Arquitectura de Componentes2.1. Capa de Autenticación y Entradasrc/contexts/AuthContext.tsxGestiona el estado de sesión AuthState (locked | player | admin).Persiste la sesión en localStorage bajo la clave locke_auth.Valida el PIN de Admin (9999) y los códigos de entrenador (PK-XXXX).Proporciona la utilidad canEditTrainer(trainerId) que restringe las acciones de mutación en la interfaz.src/components/common/PinAuthScreen.tsxPantalla de guardia inicial. Si auth.role === 'locked', bloquea cualquier vista o métrica hasta introducir un código válido.2.2. Navegación y Configuración Globalsrc/components/common/Navbar.tsxBarra fija superior con logo personalizado de la sala, título, subtítulo, botón de información (i) y sesión activa.Muestra accesos rápidos de administrador para crear entrenadores y abrir la configuración de sala (⚙️).src/components/common/InfoModal.tsxModal informativo que resume las reglas del Locke y ofrece enlaces externos (Discord del grupo y descarga del juego).src/components/admin/RoomSettingsModal.tsxPermite al administrador editar el título de la sala, subtítulo, enlace de Discord, URL de descarga y subir el logotipo/banner mediante FileReader (Base64).2.3. Panel de Métricas ProminenteSección de KPIs en src/App.tsxCuadrícula de 4 tarjetas a todo el ancho:Entrenadores: Recuento total de participantes.Vidas Grupales: Suma acumulada de vidas restantes de todos los jugadores.Medallas Totales: Medallas conseguidas frente al total teórico (entrenadores * 8).Bajas Registradas: Total global de Pokémon caídos en el cementerio.2.4. Gestión de Entrenadoressrc/components/trainers/TrainerCard.tsxRepresenta a un jugador con avatar, vidas, medallas y sus 6 slots.Botón de Bajas (Bajas: X) que abre el cementerio del jugador.Contador manual de vidas (+ y -) restringido por permisos.8 botones de medallas de Kanto con estilo individualizado (Gimnasios 1 al 8) interactivos.Botón de ajustes de entrenador visible únicamente para el Admin.src/components/admin/CreateTrainerModal.tsxAlta de entrenador con nombre, foto de perfil (Base64), vidas iniciales (por defecto 30) y generación automática de PIN PK-XXXX. Inicializa party: [] y graveyard: [].src/components/admin/EditTrainerModal.tsxModificación de datos de perfil, reemplazo de foto, regeneración de código de acceso y eliminación completa con confirmación.2.5. Ciclo de Vida del Pokémon (Slots y Cementerio)src/components/trainers/PokemonSlotModal.tsxModal unificado para añadir o editar cualquier slot:Búsqueda reactiva en PokéAPI: Escribe $\ge 2$ caracteres y sugiere especies en tiempo real con sprite en miniatura.Buscador global de habilidades: Desplegable de PokéAPI adaptado a Randomlocke o entrada de texto libre.Buscador global de objetos equipados: Desplegable de ítems de PokéAPI con sprite.Toggle Shiny: Botón interactivo tipo píldora (✨ Shiny) que se enciende en tono dorado pastel sin alterar su texto.Acción "Dar de Baja": Mueve el Pokémon al cementerio en 1 clic (sin alert ni prompt).Acción "Liberar": Elimina el slot del equipo sin contar como baja.src/components/trainers/FaintModal.tsxModal rápido que se dispara automáticamente cuando un entrenador pierde una vida (-1), preguntando si algún Pokémon del equipo ha caído para mandarlo a bajas o solo restar vida.src/components/trainers/GraveyardModal.tsxHistorial de caídos del entrenador con sprites en escala de grises.Botón Revivir: Valida si el equipo tiene hueco ($< 6$) y devuelve al Pokémon al equipo activo.Botón Eliminar: Purga registros erróneos del cementerio.3. Integración con PokéAPI (src/services/pokeapi.service.ts)Para evitar peticiones pesadas o bloqueos de red:Caché en Memoria: Las listas completas de especies (/pokemon?limit=1025), habilidades (/ability?limit=400) y objetos (/item?limit=2200) se cargan una sola vez bajo demanda y se mantienen en variables de módulo.Filtrado en Cliente: Las búsquedas son instantáneas y no consumen cuota de red repetitiva.Imágenes de PokéAPI:Sprites normales y variocolor extraídos prioritariamente de other.showdown.front_default (sprites animados/pixel-art de alta fidelidad) con fallback a los frontales estáticos clásicos.Sprites de objetos tomados directamente del CDN oficial (/sprites/items/{nombre}.png).4. Modelos de Datos Actuales (src/types/locke.types.ts)export type UserRole = 'locked' | 'player' | 'admin';

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
level: number;
isShiny: boolean;
spriteUrl: string;
types: string[];
ability?: string;
heldItem?: string;
status: 'party' | 'fainted';
faintedAt?: string;
}

export interface Trainer {
id: string;
name: string;
avatarUrl?: string;
accessCode: string;
lives: number;
maxLives: number;
badges: boolean[]; // Array de 8 posiciones booleanas
party: Pokemon[];
graveyard: Pokemon[];
}

export interface AuthState {
role: UserRole;
trainerId?: string;
}
5. Preparación para el Backend (Supabase)La arquitectura del frontend está desacoplada mediante funciones controladoras en src/App.tsx, lo que permitirá sustituir el estado local de useState por un cliente de Supabase (@supabase/supabase-js) sin alterar los componentes visuales.5.1. Tablas Relacionales para PostgreSQL-- 1. Tabla de Configuración de la Sala
   CREATE TABLE room_settings (
   id INT PRIMARY KEY DEFAULT 1,
   title TEXT NOT NULL DEFAULT 'Pokémon Añil Locke',
   subtitle TEXT,
   banner_url TEXT,
   discord_url TEXT,
   download_url TEXT,
   updated_at TIMESTAMPTZ DEFAULT NOW(),
   CONSTRAINT single_room_row CHECK (id = 1)
   );

-- 2. Tabla de Entrenadores
CREATE TABLE trainers (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
name TEXT NOT NULL,
avatar_url TEXT,
access_code TEXT UNIQUE NOT NULL,
lives INT NOT NULL DEFAULT 30,
max_lives INT NOT NULL DEFAULT 30,
badges BOOLEAN[] NOT NULL DEFAULT '{false,false,false,false,false,false,false,false}',
created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de Pokémon (Cubre Party y Graveyard)
CREATE TABLE pokemons (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
trainer_id UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
species TEXT NOT NULL,
name TEXT NOT NULL,
level INT NOT NULL DEFAULT 5,
is_shiny BOOLEAN NOT NULL DEFAULT FALSE,
sprite_url TEXT NOT NULL,
types TEXT[] NOT NULL DEFAULT '{}',
ability TEXT,
held_item TEXT,
status TEXT NOT NULL DEFAULT 'party' CHECK (status IN ('party', 'fainted')),
fainted_at TIMESTAMPTZ,
created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pokemons_trainer_status ON pokemons(trainer_id, status);
5.2. Mapeo de Acciones del Frontend a SupabaseAcción FrontendControlador ActualOperación SupabaseLogin con PINloginWithPinQuery a trainers por access_code o comprobación de clave adminModificar VidashandleUpdateLivesUPDATE trainers SET lives = $1 WHERE id = $2Conmutar MedallahandleToggleBadgeUPDATE trainers SET badges = $1 WHERE id = $2Guardar/Editar SlothandleSaveSlotUPSERT en pokemonsLiberar PokémonhandleDeleteSlotDELETE FROM pokemons WHERE id = $1Baja directahandleDirectFaintUPDATE pokemons SET status = 'fainted', fainted_at = NOW() WHERE id = $1Revivir PokémonhandleReviveUPDATE pokemons SET status = 'party', fainted_at = NULL WHERE id = $1Ajustes de SalaRoomSettingsModalUPDATE room_settings SET ... WHERE id = 15.3. Paso a Soporte en Tiempo Real (Realtime)El siguiente paso consistirá en suscribir el cliente a los canales de Supabase Realtime:supabase
.channel('locke-updates')
.on('postgres_changes', { event: '*', schema: 'public', table: 'trainers' }, fetchTrainers)
.on('postgres_changes', { event: '*', schema: 'public', table: 'pokemons' }, fetchTrainers)
.subscribe();
Esto permitirá que cuando cualquier participante actualice sus vidas, medallas o sufra una baja, el panel de todos los demás jugadores se refresque de forma instantánea sin recargar la página.