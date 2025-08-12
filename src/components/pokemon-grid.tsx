'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { PokemonCard } from './pokemon-card';
import { getPokemonList, PokemonListItem, getPokemonTypes, getPokemonByType, Pokedex, getPokedexes, getPokemonByPokedex, getPokemon } from '@/lib/pokemon';
import { useDebounce } from '@/hooks/use-debounce';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, ListFilter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function PokemonGrid({ initialPokemon }: { initialPokemon: { results: PokemonListItem[], next: string | null } }) {
  const [allPokemon, setAllPokemon] = useState<PokemonListItem[]>(initialPokemon.results);
  const [fullPokemonList, setFullPokemonList] = useState<PokemonListItem[]>([]);
  const [filteredPokemon, setFilteredPokemon] = useState<PokemonListItem[]>(initialPokemon.results);
  const [searchTerm, setSearchTerm] = useState('');
  const [offset, setOffset] = useState(initialPokemon.results.length);
  const [hasMore, setHasMore] = useState(!!initialPokemon.next);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [notFound, setNotFound] = useState(false);
  const [types, setTypes] = useState<Pokedex[]>([]);
  const [selectedType, setSelectedType] = useState<string>('');
  const [pokedexes, setPokedexes] = useState<Pokedex[]>([]);
  const [selectedPokedex, setSelectedPokedex] = useState<string>('');


  useEffect(() => {
    const fetchData = async () => {
      const typesData = await getPokemonTypes();
      setTypes(typesData);
      const pokedexesData = await getPokedexes();
      const allowedPokedexes = [
        'kanto',
        'original-johto',
        'hoenn',
        'original-sinnoh',
        'original-unova',
        'kalos-central',
        'original-alola',
        'galar',
        'hisui',
        'paldea'
      ];
      const filteredPokedexes = pokedexesData.filter(p => allowedPokedexes.includes(p.name))
      setPokedexes(filteredPokedexes);
      // Fetch all pokemon for client-side search
      const allPokemonData = await getPokemonList(1500, 0);
      setFullPokemonList(allPokemonData.results);
    };
    fetchData();
  }, []);

  const observer = useRef<IntersectionObserver>();
  const lastPokemonElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !debouncedSearchTerm && !selectedType && !selectedPokedex) {
          loadMorePokemon();
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore, debouncedSearchTerm, selectedType, selectedPokedex]
  );

  const loadMorePokemon = async () => {
    setIsLoading(true);
    const data = await getPokemonList(20, offset);
    setAllPokemon((prev) => [...prev, ...data.results]);
    setFilteredPokemon((prev) => [...prev, ...data.results]);
    setOffset((prev) => prev + data.results.length);
    setHasMore(!!data.next);
    setIsLoading(false);
  };
  
  const handleTypeChange = async (type: string) => {
    setSelectedType(type);
    setSelectedPokedex('');
    setSearchTerm('');
    setNotFound(false);

    if (type === 'all' || !type) {
      setFilteredPokemon(allPokemon);
      setHasMore(!!initialPokemon.next);
      return;
    }
    
    setIsLoading(true);
    const byType = await getPokemonByType(type);
    setFilteredPokemon(byType);
    setHasMore(false);
    setIsLoading(false);
  }

  const handlePokedexChange = async (pokedex: string) => {
    setSelectedPokedex(pokedex);
    setSelectedType('');
    setSearchTerm('');
    setNotFound(false);

    if (pokedex === 'all' || !pokedex) {
        setFilteredPokemon(allPokemon);
        setHasMore(!!initialPokemon.next);
        return;
    }

    setIsLoading(true);
    const byPokedex = await getPokemonByPokedex(pokedex);
    setFilteredPokemon(byPokedex);
    setHasMore(false);
    setIsLoading(false);
}

  useEffect(() => {
    const searchPokemon = async () => {
      if (debouncedSearchTerm) {
        setIsLoading(true);
        setNotFound(false);
        const results = fullPokemonList.filter(p => p.name.includes(debouncedSearchTerm.toLowerCase()));

        if (results.length > 0) {
            setFilteredPokemon(results);
            setHasMore(false);
        } else {
            setFilteredPokemon([]);
            setNotFound(true);
        }
        setIsLoading(false);
      } else {
        setNotFound(false);
        // Re-apply filters when search is cleared
        if (selectedType && selectedType !== 'all') {
            handleTypeChange(selectedType);
        } else if (selectedPokedex && selectedPokedex !== 'all') {
            handlePokedexChange(selectedPokedex);
        } else {
            setFilteredPokemon(allPokemon);
            setHasMore(true);
        }
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    searchPokemon();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, fullPokemonList]);


  const formatPokedexName = (name: string) => {
    const cleanedName = name.replace('original-', '').replace('-central', '').replace('-', ' ');
    const words = cleanedName.split(' ');
    if (words.length > 1 && words[0] === 'johto') {
        return 'Johto'; // Special case for 'original johto' -> 'Johto'
    }
    if (words.length > 1 && words[0] === 'sinnoh') {
        return 'Sinnoh';
    }
    if (words.length > 1 && words[0] === 'unova') {
        return 'Unova';
    }
    if (words.length > 1 && words[0] === 'alola') {
        return 'Alola';
    }
    return cleanedName.charAt(0).toUpperCase() + cleanedName.slice(1);
  }


  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search Pokémon by name..."
            className="w-full pl-10 bg-card focus:border-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex-1 grid grid-cols-2 gap-4 md:max-w-[416px]">
          <Select onValueChange={handleTypeChange} value={selectedType}>
            <SelectTrigger className="w-full bg-card focus:border-primary capitalize">
              <ListFilter className="h-5 w-5 text-muted-foreground mr-2" />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {types.map((type) => (
                <SelectItem key={type.name} value={type.name} className="capitalize">
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select onValueChange={handlePokedexChange} value={selectedPokedex}>
            <SelectTrigger className="w-full bg-card focus:border-primary capitalize">
              <ListFilter className="h-5 w-5 text-muted-foreground mr-2" />
              <SelectValue placeholder="Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              {pokedexes.map((pokedex) => (
                <SelectItem key={pokedex.name} value={pokedex.name} className="capitalize">
                  {formatPokedexName(pokedex.name)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {notFound ? (
         <p className="text-center text-muted-foreground">No Pokémon found for &quot;{debouncedSearchTerm}&quot;.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {filteredPokemon.map((pokemon, index) => {
            const key = (pokemon as any).pokemon?.name || pokemon.name;
            if (filteredPokemon.length === index + 1 && !debouncedSearchTerm && !selectedType && !selectedPokedex) {
              return (
                <div ref={lastPokemonElementRef} key={key}>
                  <PokemonCard pokemon={pokemon} />
                </div>
              );
            } else {
              return <PokemonCard key={key} pokemon={pokemon} />;
            }
          })}
          {isLoading &&
            Array.from({ length: 10 }).map((_, i) => (
              <div key={`skeleton-${i}`} className="space-y-2">
                <Skeleton className="h-40 w-full rounded-lg" />
                <Skeleton className="h-8 w-full rounded-lg" />
              </div>
            ))}
        </div>
      )}
      {!hasMore && !isLoading && !debouncedSearchTerm && !selectedType && !selectedPokedex && (
        <p className="text-center text-muted-foreground">You've caught 'em all!</p>
      )}
    </div>
  );
}
