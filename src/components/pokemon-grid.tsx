'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { PokemonCard } from './pokemon-card';
import { getPokemonList, getPokemon, PokemonListResponse, PokemonListItem, getPokemonTypes, getPokemonByType, Pokedex, getPokedexes, getPokemonByPokedex } from '@/lib/pokemon';
import { useDebounce } from '@/hooks/use-debounce';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, ListFilter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function PokemonGrid({ initialPokemon }: { initialPokemon: PokemonListResponse }) {
  const [allPokemon, setAllPokemon] = useState<PokemonListItem[]>(initialPokemon.results);
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
      const filteredPokedexes = pokedexesData.filter(p => !p.name.includes('updated') && !p.name.includes('extended') && !p.name.includes('letsgo') && p.name !== 'national' && !p.name.includes('conquest'))
      setPokedexes(filteredPokedexes);
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

    if (type === 'all') {
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

    if (pokedex === 'all') {
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
        setSelectedType('');
        setSelectedPokedex('');

        const result = await getPokemon(debouncedSearchTerm.toLowerCase());
        if (result) {
          setFilteredPokemon([{ name: result.name, url: `https://pokeapi.co/api/v2/pokemon/${result.id}/` }]);
          setHasMore(false);
        } else {
          setFilteredPokemon([]);
          setNotFound(true);
        }
        setIsLoading(false);
      } else if (!selectedType && !selectedPokedex) {
        // Reset to the full list when search is cleared and no filter is selected
        setFilteredPokemon(allPokemon);
        setHasMore(!!initialPokemon.next);
        setNotFound(false);
      }
    };

    searchPokemon();
  }, [debouncedSearchTerm, allPokemon, initialPokemon.next, selectedType, selectedPokedex]);


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
        <div className="flex-1 md:max-w-[200px]">
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
        </div>
        <div className="flex-1 md:max-w-[200px]">
          <Select onValueChange={handlePokedexChange} value={selectedPokedex}>
            <SelectTrigger className="w-full bg-card focus:border-primary capitalize">
              <ListFilter className="h-5 w-5 text-muted-foreground mr-2" />
              <SelectValue placeholder="Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              {pokedexes.map((pokedex) => (
                <SelectItem key={pokedex.name} value={pokedex.name} className="capitalize">
                  {pokedex.name.replace('-', ' ')}
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
            if (filteredPokemon.length === index + 1 && !debouncedSearchTerm && !selectedType && !selectedPokedex) {
              return (
                <div ref={lastPokemonElementRef} key={(pokemon as any).pokemon?.name || pokemon.name}>
                  <PokemonCard pokemon={pokemon} />
                </div>
              );
            } else {
              return <PokemonCard key={(pokemon as any).pokemon?.name || pokemon.name} pokemon={pokemon} />;
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
