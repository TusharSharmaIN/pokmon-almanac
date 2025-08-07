'use client';

import * as React from 'react';
import { EnrichedEvolutionNode } from '@/lib/pokemon';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TypeBadge, POKEMON_TYPE_COLORS_HSL } from '@/components/type-badge';

const EvolutionPokemon = ({ pokemon, isCurrent }: { pokemon: EnrichedEvolutionNode['pokemon'], isCurrent: boolean }) => {
  const [hover, setHover] = React.useState(false);
  const primaryType = pokemon.types[0].type.name;
  const typeColor = POKEMON_TYPE_COLORS_HSL[primaryType]?.bg || 'hsl(var(--primary))';
  
  const hoverBgColor = typeColor.replace('hsl(', 'hsla(').replace(')', ', 0.2)');
  const imageUrl = pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.other.dream_world.front_default;

  return (
    <Link href={`/pokemon/${pokemon.name}`} className="z-10" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div className="flex flex-col items-center gap-2 group transform transition-transform duration-300 hover:scale-105">
        <div 
          className={cn("bg-muted rounded-full p-2 sm:p-4 w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center transition-all", { 'border-4 border-primary/50 bg-primary/10': isCurrent })}
          style={{ backgroundColor: hover || isCurrent ? hoverBgColor : undefined }}
        >
          <Image src={imageUrl} alt={pokemon.name} width={96} height={96} className="object-contain" />
        </div>
        <p className="capitalize font-headline font-semibold">{pokemon.name}</p>
        <div className="flex gap-1">
            {pokemon.types.map(t => <TypeBadge key={t.type.name} typeName={t.type.name} />)}
        </div>
      </div>
    </Link>
  );
};

const EvolutionBranch = ({ node, currentPokemonName }: { node: EnrichedEvolutionNode, currentPokemonName: string }) => {
  const hasMultipleEvolutions = node.evolves_to.length > 1;

  return (
    <div className="flex items-center justify-center gap-4 md:gap-8 flex-wrap">
      <EvolutionPokemon pokemon={node.pokemon} isCurrent={node.pokemon.name === currentPokemonName} />
      {node.evolves_to.length > 0 && <ArrowRight className="h-8 w-8 text-muted-foreground shrink-0" />}
      
      {node.evolves_to.length > 0 && (
        <div 
            className={cn(
                "flex gap-4 md:gap-8",
                hasMultipleEvolutions ? "flex-col sm:flex-row" : "flex-col"
            )}
        >
          {node.evolves_to.map((evo) => (
            <EvolutionBranch key={evo.pokemon.name} node={evo} currentPokemonName={currentPokemonName} />
          ))}
        </div>
      )}
    </div>
  );
};


interface EvolutionGraphProps {
    evolutionChain: EnrichedEvolutionNode;
    currentPokemonName: string;
}

const EvolutionGraph = ({ evolutionChain, currentPokemonName }: EvolutionGraphProps) => {
    return (
        <div className="flex items-center justify-center p-4 overflow-x-auto">
           <EvolutionBranch node={evolutionChain} currentPokemonName={currentPokemonName} />
        </div>
    );
};


interface PokemonPageClientProps {
  enrichedEvolutionChain: EnrichedEvolutionNode;
  currentPokemonName: string;
}

export function PokemonPageClient({ enrichedEvolutionChain, currentPokemonName }: PokemonPageClientProps) {
  return <EvolutionGraph evolutionChain={enrichedEvolutionChain} currentPokemonName={currentPokemonName} />;
}
