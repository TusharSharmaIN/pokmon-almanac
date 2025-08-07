'use client';

import * as React from 'react';
import { EnrichedEvolutionNode } from '@/lib/pokemon';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// This is copied from the main page, we should refactor it into a shared component
const POKEMON_TYPE_COLORS_HSL: { [key: string]: { bg: string; text: string } } = {
    normal: { bg: 'hsl(0, 0%, 63%)', text: 'hsl(0, 0%, 100%)' },
    fire: { bg: 'hsl(13, 94%, 53%)', text: 'hsl(0, 0%, 100%)' },
    water: { bg: 'hsl(211, 79%, 56%)', text: 'hsl(0, 0%, 100%)' },
    electric: { bg: 'hsl(52, 95%, 58%)', text: 'hsl(52, 100%, 10%)' },
    grass: { bg: 'hsl(120, 57%, 49%)', text: 'hsl(0, 0%, 100%)' },
    ice: { bg: 'hsl(180, 52%, 82%)', text: 'hsl(180, 100%, 10%)' },
    fighting: { bg: 'hsl(0, 75%, 43%)', text: 'hsl(0, 0%, 100%)' },
    poison: { bg: 'hsl(279, 64%, 48%)', text: 'hsl(0, 0%, 100%)' },
    ground: { bg: 'hsl(45, 78%, 51%)', text: 'hsl(0, 0%, 100%)' },
    flying: { bg: 'hsl(227, 59%, 67%)', text: 'hsl(0, 0%, 100%)' },
    psychic: { bg: 'hsl(340, 82%, 61%)', text: 'hsl(0, 0%, 100%)' },
    bug: { bg: 'hsl(84, 76%, 51%)', text: 'hsl(84, 100%, 10%)' },
    rock: { bg: 'hsl(45, 61%, 41%)', text: 'hsl(0, 0%, 100%)' },
    ghost: { bg: 'hsl(275, 74%, 35%)', text: 'hsl(0, 0%, 100%)' },
    dragon: { bg: 'hsl(254, 84%, 44%)', text: 'hsl(0, 0%, 100%)' },
    dark: { bg: 'hsl(0, 0%, 44%)', text: 'hsl(0, 0%, 100%)' },
    steel: { bg: 'hsl(210, 14%, 73%)', text: 'hsl(210, 100%, 10%)' },
    fairy: { bg: 'hsl(330, 66%, 74%)', text: 'hsl(330, 100%, 10%)' },
  };
  
  const TypeBadge = ({ typeName }: { typeName: string }) => {
    const colors = POKEMON_TYPE_COLORS_HSL[typeName] || { bg: 'gray', text: 'white' };
    return (
      <Badge style={{ backgroundColor: colors.bg, color: colors.text }} className="capitalize text-xs px-2 py-0.5 border-none">
        {typeName}
      </Badge>
    );
  };

const EvolutionPokemon = ({ pokemon }: { pokemon: EnrichedEvolutionNode['pokemon'] }) => {
  const [hover, setHover] = React.useState(false);
  const primaryType = pokemon.types[0].type.name;
  const typeColor = POKEMON_TYPE_COLORS_HSL[primaryType]?.bg || 'hsl(var(--primary))';
  
  // To make the color transparent, we'll extract HSL values and add an alpha.
  const hoverBgColor = typeColor.replace('hsl(', 'hsla(').replace(')', ', 0.2)');

  return (
    <Link href={`/pokemon/${pokemon.name}`} className="z-10" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div className="flex flex-col items-center gap-2 group transform transition-transform duration-300 hover:scale-105">
        <div 
          className="bg-muted rounded-full p-2 sm:p-4 w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center transition-all"
          style={{ backgroundColor: hover ? hoverBgColor : undefined }}
        >
          <Image src={pokemon.sprites.other['official-artwork'].front_default} alt={pokemon.name} width={96} height={96} className="object-contain" />
        </div>
        <p className="capitalize font-headline font-semibold">{pokemon.name}</p>
        <div className="flex gap-1">
            {pokemon.types.map(t => <TypeBadge key={t.type.name} typeName={t.type.name} />)}
        </div>
      </div>
    </Link>
  );
};

const EvolutionBranch = ({ node }: { node: EnrichedEvolutionNode }) => {
  const hasMultipleEvolutions = node.evolves_to.length > 1;

  return (
    <div className="flex items-center justify-center gap-4 md:gap-8 flex-wrap">
      <EvolutionPokemon pokemon={node.pokemon} />
      {node.evolves_to.length > 0 && <ArrowRight className="h-8 w-8 text-muted-foreground shrink-0" />}
      
      {hasMultipleEvolutions ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {node.evolves_to.map((evo) => (
            <EvolutionBranch key={evo.pokemon.name} node={evo} />
          ))}
        </div>
      ) : (
        node.evolves_to.length > 0 && (
          <div className="flex flex-col gap-4">
            {node.evolves_to.map((evo) => (
              <EvolutionBranch key={evo.pokemon.name} node={evo} />
            ))}
          </div>
        )
      )}
    </div>
  );
};


interface EvolutionGraphProps {
    evolutionChain: EnrichedEvolutionNode;
}

const EvolutionGraph = ({ evolutionChain }: EvolutionGraphProps) => {
    return (
        <div className="flex items-center justify-center p-4 overflow-x-auto">
           <EvolutionBranch node={evolutionChain} />
        </div>
    );
};


interface PokemonPageClientProps {
  enrichedEvolutionChain: EnrichedEvolutionNode;
}

export function PokemonPageClient({ enrichedEvolutionChain }: PokemonPageClientProps) {
  return <EvolutionGraph evolutionChain={enrichedEvolutionChain} />;
}
