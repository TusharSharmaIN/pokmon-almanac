'use client';

import * as React from 'react';
import { getPokemon, Pokemon } from '@/lib/pokemon';
import Image from 'next/image';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { TypeBadge } from '@/components/type-badge';

const VariationCard = ({ name }: { name: string }) => {
    const [pokemon, setPokemon] = React.useState<Pokemon | null>(null);

    React.useEffect(() => {
        getPokemon(name).then(setPokemon);
    }, [name]);

    if (!pokemon) {
        return (
            <div className="flex flex-col items-center gap-2">
                <Skeleton className="w-32 h-32 rounded-lg" />
                <Skeleton className="w-24 h-6" />
                <Skeleton className="w-20 h-5" />
            </div>
        )
    }

    const imageUrl = pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.other.dream_world.front_default;

    return (
        <Link href={`/pokemon/${pokemon.name}`} className="group">
            <div className="flex flex-col items-center gap-2 transform transition-transform duration-300 hover:scale-105">
                <div className="bg-muted rounded-lg p-2 w-40 h-40 flex items-center justify-center transition-all group-hover:bg-muted/50">
                    <Image src={imageUrl} alt={pokemon.name} width={120} height={120} className="object-contain" />
                </div>
                <p className="capitalize font-headline font-semibold">{pokemon.name.replace('-', ' ')}</p>
                <div className="flex gap-1">
                    {pokemon.types.map(t => <TypeBadge key={t.type.name} typeName={t.type.name} />)}
                </div>
            </div>
        </Link>
    );
};


interface VariationsProps {
    forms: { name: string; url: string }[];
}

export function Variations({ forms }: VariationsProps) {
  return (
    <div className="flex items-center justify-center flex-wrap gap-8">
        {forms.map(form => <VariationCard key={form.name} name={form.name} />)}
    </div>
  );
}
