import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getPokemonIdFromUrl, Pokemon, getPokemon } from '@/lib/pokemon';
import type { PokemonListItem } from '@/lib/pokemon';
import { Skeleton } from './ui/skeleton';
import { TypeBadge } from './type-badge';

interface PokemonCardProps {
  pokemon: PokemonListItem;
}

const CardSkeleton = () => (
    <Card className="overflow-hidden">
        <CardContent className="p-4 bg-secondary/50 aspect-square flex items-center justify-center relative">
            <Skeleton className="w-3/4 h-3/4" />
        </CardContent>
        <CardFooter className="p-3 flex justify-between items-center bg-card">
            <Skeleton className="w-1/2 h-6" />
            <Skeleton className="w-1/4 h-6" />
        </CardFooter>
    </Card>
);


export function PokemonCard({ pokemon: pokemonListItem }: PokemonCardProps) {
  const [details, setDetails] = useState<Pokemon | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // The URL can be for a pokemon or a pokemon's slot in a type
  const url = pokemonListItem.url || (pokemonListItem as any).pokemon?.url;
  const name = pokemonListItem.name || (pokemonListItem as any).pokemon?.name;
  
  const id = getPokemonIdFromUrl(url);
  const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

  useEffect(() => {
    const fetchDetails = async () => {
      setIsLoading(true);
      const pokemonDetails = await getPokemon(name);
      setDetails(pokemonDetails);
      setIsLoading(false);
    };

    if (name) {
      fetchDetails();
    }
  }, [name]);

  if (isLoading || !details) {
    return <CardSkeleton />;
  }

  return (
    <Link href={`/pokemon/${name}`} className="group block">
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary">
        <CardContent className="p-4 bg-secondary/50 aspect-square flex items-center justify-center relative">
          <Image
            src={imageUrl}
            alt={name}
            width={200}
            height={200}
            className="object-contain w-full h-full transition-transform duration-300 group-hover:scale-105"
            data-ai-hint="pokemon character"
            priority={parseInt(id) < 21}
          />
        </CardContent>
        <CardFooter className="p-3 flex justify-between items-center bg-card">
            <div className="flex flex-col gap-1.5">
                <h3 className="capitalize font-headline font-semibold text-lg">{name}</h3>
                <Badge variant="outline">#{id.padStart(4, '0')}</Badge>
            </div>
            <div className="flex flex-col items-end gap-1.5">
                {details.types.map((t) => (
                    <TypeBadge key={t.type.name} typeName={t.type.name} />
                ))}
            </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
