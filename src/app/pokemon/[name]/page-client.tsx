'use client';

import * as React from 'react';
import { EvolutionNode, getPokemonIdFromUrl } from '@/lib/pokemon';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const EvolutionPokemon = ({ name, url }: { name: string; url: string }) => {
  const id = getPokemonIdFromUrl(url);
  const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
  
  return (
    <Link href={`/pokemon/${name}`} className="z-10">
      <div className="flex flex-col items-center gap-2 group transform transition-transform duration-300 hover:scale-105">
        <div className="bg-muted rounded-full p-2 sm:p-4 w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center transition-all group-hover:bg-primary/20">
          <Image src={imageUrl} alt={name} width={96} height={96} className="object-contain" />
        </div>
        <p className="capitalize font-headline font-semibold">{name}</p>
      </div>
    </Link>
  );
};

const EvolutionBranch = ({ node }: { node: EvolutionNode }) => {
  return (
    <div className="flex items-center justify-center gap-4 md:gap-8 flex-wrap">
      <EvolutionPokemon name={node.species.name} url={node.species.url} />
      {node.evolves_to.length > 0 && <ArrowRight className="h-8 w-8 text-muted-foreground shrink-0" />}
      {node.evolves_to.length > 0 && (
        <div className="flex flex-col gap-4">
          {node.evolves_to.map((evo) => (
            <EvolutionBranch key={evo.species.name} node={evo} />
          ))}
        </div>
      )}
    </div>
  );
};

interface EvolutionGraphProps {
    evolutionChain: EvolutionNode;
}

const EvolutionGraph = ({ evolutionChain }: EvolutionGraphProps) => {
    return (
        <div className="flex items-center justify-center p-4 overflow-x-auto">
           <EvolutionBranch node={evolutionChain} />
        </div>
    );
};


interface PokemonPageClientProps {
  evolutionChain: EvolutionNode;
}

export function PokemonPageClient({ evolutionChain }: PokemonPageClientProps) {
  return <EvolutionGraph evolutionChain={evolutionChain} />;
}
