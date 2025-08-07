'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { PokemonCard } from './pokemon-card';
import { getPokemonList, PokemonListResponse, PokemonListItem } from '@/lib/pokemon';
import { useDebounce } from '@/hooks/use-debounce';
import { Skeleton } from '@/components/ui/skeleton';
import { Search } from 'lucide-react';

export function PokemonGrid({ initialPokemon }: { initialPokemon: PokemonListResponse }) {
  const [allPokemon, setAllPokemon] = useState<PokemonListItem[]>(initialPokemon.results);
  const [filteredPokemon, setFilteredPokemon] = useState<PokemonListItem[]>(initialPokemon.results);
  const [searchTerm, setSearchTerm] = useState('');
  const [offset, setOffset] = useState(initialPokemon.results.length);
  const [hasMore, setHasMore] = useState(!!initialPokemon.next);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const observer = useRef<IntersectionObserver>();
  const lastPokemonElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !debouncedSearchTerm) {
          loadMorePokemon();
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore, debouncedSearchTerm]
  );

  const loadMorePokemon = async () => {
    setIsLoading(true);
    const data = await getPokemonList(20, offset);
    setAllPokemon((prev) => [...prev, ...data.results]);
    setOffset((prev) => prev + data.results.length);
    setHasMore(!!data.next);
    setIsLoading(false);
  };
  
  useEffect(() => {
    setFilteredPokemon(
      allPokemon.filter((p) =>
        p.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      )
    );
  }, [debouncedSearchTerm, allPokemon]);


  return (
    <div className="space-y-8">
      <div className="relative mx-auto max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search Pokémon by name..."
          className="w-full pl-10 bg-card focus:border-primary"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {filteredPokemon.map((pokemon, index) => {
          if (filteredPokemon.length === index + 1 && !debouncedSearchTerm) {
            return (
              <div ref={lastPokemonElementRef} key={pokemon.name}>
                <PokemonCard pokemon={pokemon} />
              </div>
            );
          } else {
            return <PokemonCard key={pokemon.name} pokemon={pokemon} />;
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
      {!hasMore && !isLoading && !debouncedSearchTerm && (
        <p className="text-center text-muted-foreground">You've caught 'em all!</p>
      )}
    </div>
  );
}
