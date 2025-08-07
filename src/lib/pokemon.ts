const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';

export interface PokemonListItem {
  name: string;
  url: string;
}

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonListItem[];
}

export const getPokemonList = async (limit = 20, offset = 0): Promise<PokemonListResponse> => {
  const response = await fetch(`${POKEAPI_BASE_URL}/pokemon?limit=${limit}&offset=${offset}`);
  if (!response.ok) {
    throw new Error('Failed to fetch Pokémon list');
  }
  return response.json();
};

export interface Pokemon {
  id: number;
  name: string;
  sprites: {
    other: {
      'dream_world': {
        front_default: string;
      };
      'official-artwork': {
        front_default: string;
        front_shiny: string;
      };
    };
  };
  types: {
    type: {
      name: string;
    };
  }[];
  stats: {
    stat: {
      name: string;
    };
    base_stat: number;
  }[];
  abilities: {
    ability: {
      name: string;
    };
    is_hidden: boolean;
  }[];
}

export const getPokemon = async (nameOrId: string | number): Promise<Pokemon | null> => {
  try {
    const response = await fetch(`${POKEAPI_BASE_URL}/pokemon/${nameOrId}`);
    if (!response.ok) {
      return null;
    }
    return response.json();
  } catch (error) {
    return null;
  }
};

export interface PokemonSpecies {
  flavor_text_entries: {
    flavor_text: string;
    language: {
      name: string;
    };
    version: {
      name: string;
    };
  }[];
  evolution_chain: {
    url: string;
  };
}

export const getPokemonSpecies = async (nameOrId: string | number): Promise<PokemonSpecies> => {
  const response = await fetch(`${POKEAPI_BASE_URL}/pokemon-species/${nameOrId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch Pokémon species data');
  }
  return response.json();
};

export interface EvolutionNode {
  species: {
    name: string;
    url: string;
  };
  evolves_to: EvolutionNode[];
}

export interface EnrichedEvolutionNode {
  pokemon: Pokemon;
  evolves_to: EnrichedEvolutionNode[];
}

export interface EvolutionChain {
  id: number;
  chain: EvolutionNode;
}

export const getEvolutionChain = async (url: string): Promise<EvolutionChain> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch evolution chain data');
  }
  return response.json();
};

export const getPokemonIdFromUrl = (url: string): string => {
  if (!url) return '';
  const parts = url.split('/');
  return parts[parts.length - 2];
};

export interface PokemonType {
  name: string;
  url: string;
}

export const getPokemonTypes = async (): Promise<PokemonType[]> => {
  const response = await fetch(`${POKEAPI_BASE_URL}/type`);
  if (!response.ok) {
    throw new Error('Failed to fetch Pokémon types');
  }
  const data = await response.json();
  // Filter out 'unknown' and 'shadow' types as they are special cases
  return data.results.filter((type: PokemonType) => type.name !== 'unknown' && type.name !== 'shadow');
};

export const getPokemonByType = async (typeName: string): Promise<PokemonListItem[]> => {
  const response = await fetch(`${POKEAPI_BASE_URL}/type/${typeName}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch Pokémon of type ${typeName}`);
  }
  const data = await response.json();
  return data.pokemon.map((p: any) => p);
};
