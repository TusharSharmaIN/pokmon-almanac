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
      'official-artwork': {
        front_default: string;
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
  const parts = url.split('/');
  return parts[parts.length - 2];
};
