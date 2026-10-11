-- 1. Tabla de configuración de la sala
CREATE TABLE IF NOT EXISTS public.room_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL DEFAULT 'LockeHub - Pokémon Añil',
    subtitle TEXT NOT NULL DEFAULT 'Dual Nuzlocke Challenge',
    banner_url TEXT,
    discord_url TEXT,
    download_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de entrenadores
CREATE TABLE IF NOT EXISTS public.trainers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    avatar_url TEXT,
    access_code TEXT UNIQUE NOT NULL,
    lives INTEGER NOT NULL DEFAULT 30,
    max_lives INTEGER NOT NULL DEFAULT 30,
    badges BOOLEAN[] NOT NULL DEFAULT ARRAY[false, false, false, false, false, false, false, false],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de Pokémon
CREATE TABLE IF NOT EXISTS public.pokemon (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trainer_id UUID NOT NULL REFERENCES public.trainers(id) ON DELETE CASCADE,
    species TEXT NOT NULL,
    name TEXT NOT NULL,
    gender CHAR(1) NOT NULL DEFAULT 'N' CHECK (gender IN ('M', 'F', 'N')),
    level INTEGER NOT NULL DEFAULT 5,
    is_shiny BOOLEAN NOT NULL DEFAULT false,
    sprite_url TEXT NOT NULL,
    types TEXT[] NOT NULL DEFAULT '{}',
    ability TEXT,
    held_item TEXT,
    moves TEXT[] NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'party' CHECK (status IN ('party', 'fainted')),
    fainted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Seguridad (Row Level Security) y permisos
ALTER TABLE public.room_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pokemon ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura pública room_settings" ON public.room_settings;
CREATE POLICY "Lectura pública room_settings" ON public.room_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Lectura pública trainers" ON public.trainers;
CREATE POLICY "Lectura pública trainers" ON public.trainers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Modificar trainers" ON public.trainers;
CREATE POLICY "Modificar trainers" ON public.trainers FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Lectura pública pokemon" ON public.pokemon;
CREATE POLICY "Lectura pública pokemon" ON public.pokemon FOR SELECT USING (true);

DROP POLICY IF EXISTS "Insertar pokemon" ON public.pokemon;
CREATE POLICY "Insertar pokemon" ON public.pokemon FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Actualizar pokemon" ON public.pokemon;
CREATE POLICY "Actualizar pokemon" ON public.pokemon FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Eliminar pokemon" ON public.pokemon;
CREATE POLICY "Eliminar pokemon" ON public.pokemon FOR DELETE USING (true);

-- 5. Publicación en tiempo real (Realtime)
ALTER PUBLICATION supabase_realtime ADD TABLE public.trainers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pokemon;
