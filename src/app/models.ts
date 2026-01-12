export interface NamedApiResource {
  name: string;
  url: string;
}

export interface PokemonType {
  slot: number;
  type: NamedApiResource;
}

export interface PokemonAbility {
  is_hidden: boolean;
  slot: number;
  ability: NamedApiResource;
}

export interface PokemonStat {
  base_stat: number;
  effort: number;
  stat: NamedApiResource;
}

export interface PokemonSprites {
  front_default?: string | null;
  other?: {
    ['official-artwork']?: {
      front_default?: string | null;
    };
  };
}

export interface Pokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: PokemonType[];
  abilities: PokemonAbility[];
  stats: PokemonStat[];
  sprites: PokemonSprites;

  /**
   * Zusätzlich angereicherte Felder.
   */
  officialArt: string;
  flavorText: string;
}
