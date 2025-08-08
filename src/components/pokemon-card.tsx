import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { getPokemonIdFromUrl, Pokemon, getPokemon } from '@/lib/pokemon';
import type { PokemonListItem } from '@/lib/pokemon';
import { Skeleton } from './ui/skeleton';
import { TypeBadge } from './type-badge';

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


export function PokemonCard({ pokemon: pokemonListItem }: { pokemon: PokemonListItem }) {
  const [details, setDetails] = useState<Pokemon | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // The URL can be for a pokemon or a pokemon's slot in a type
  const url = pokemonListItem.url;
  const name = pokemonListItem.name;
  
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
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary hover:-translate-y-1">
        <CardContent className="p-4 bg-secondary/50 aspect-square flex items-center justify-center relative">
          <div className="absolute top-2 right-2 z-10 text-5xl font-bold text-foreground/10">
            #{id.padStart(4, '0')}
          </div>
          <Image
            src={imageUrl}
            alt={name}
            width={200}
            height={200}
            className="object-contain w-full h-full transition-transform duration-300 group-hover:scale-110 z-20"
            data-ai-hint="pokemon character"
            priority={parseInt(id) < 21}
          />
        </CardContent>
        <CardFooter className="p-3 flex justify-between items-center bg-card">
            <h3 className="capitalize font-headline font-semibold text-lg">{name}</h3>
            <div className="flex gap-1.5">
                {details.types.map((t) => (
                    <TypeBadge key={t.type.name} typeName={t.type.name} />
                ))}
            </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
