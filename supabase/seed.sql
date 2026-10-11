INSERT INTO public.room_settings (title, subtitle)
VALUES ('LockeHub - Pokémon Añil', 'Nuzlocke Cooperativo')
ON CONFLICT DO NOTHING;

INSERT INTO public.trainers (name, access_code, lives, max_lives, badges)
VALUES ('Adrián', 'PK-ADRI', 30, 30, ARRAY[false, false, false, false, false, false, false, false])
ON CONFLICT (access_code) DO NOTHING;

INSERT INTO public.pokemon (
    trainer_id, species, name, gender, level, is_shiny, sprite_url, types, ability, held_item, moves, status
)
SELECT 
    id, 'Charizard', 'Fénix', 'M', 36, false, 
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/6.gif', 
    ARRAY['Fire', 'Flying'], 'Blaze', 'Charcoal', 
    ARRAY['Flamethrower', 'Wing Attack', 'Slash', 'Dragon Breath'], 'party'
FROM public.trainers 
WHERE access_code = 'PK-ADRI'
LIMIT 1;
