
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Pokemon } from '@/lib/pokemon';
import type { PokemonListItem } from '@/lib/pokemon';
import Image from 'next/image';
import { getPokemon } from '@/lib/pokemon';
import { Skeleton } from './ui/skeleton';

interface PokemonSelectorProps {
  pokemonList: PokemonListItem[];
  selectedPokemon: Pokemon | null;
  onSelectPokemon: (pokemon: Pokemon | null) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export function PokemonSelector({ pokemonList, selectedPokemon, onSelectPokemon, disabled, isLoading }: PokemonSelectorProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = async (name: string) => {
    if (!name) {
        onSelectPokemon(null);
        setOpen(false);
        return;
    }

    if (selectedPokemon?.name === name) {
        onSelectPokemon(null);
    } else {
        const data = await getPokemon(name);
        onSelectPokemon(data);
    }
    setOpen(false);
  };

  if (isLoading) {
    return <Skeleton className="h-14 w-full" />;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between h-14" disabled={disabled}>
          {selectedPokemon ? (
            <div className="flex items-center gap-2">
              <Image src={selectedPokemon.sprites.other['official-artwork'].front_default} alt={selectedPokemon.name} width={40} height={40} />
              <span className="capitalize">{selectedPokemon.name}</span>
            </div>
          ) : (
            'Select Pokémon...'
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Search Pokémon..." />
          <CommandList>
            <CommandEmpty>No Pokémon found.</CommandEmpty>
            <CommandGroup>
              {pokemonList.map((pokemon) => (
                <CommandItem
                  key={pokemon.name}
                  value={pokemon.name}
                  onSelect={(currentValue) => {
                    handleSelect(currentValue);
                  }}
                >
                  <Check className={cn('mr-2 h-4 w-4', selectedPokemon?.name === pokemon.name ? 'opacity-100' : 'opacity-0')} />
                  <span className="capitalize">{pokemon.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
