import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getPokemonIdFromUrl } from '@/lib/pokemon';
import type { PokemonListItem } from '@/lib/pokemon';

interface PokemonCardProps {
  pokemon: PokemonListItem;
}

export function PokemonCard({ pokemon }: PokemonCardProps) {
  const id = getPokemonIdFromUrl(pokemon.url);
  const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

  return (
    <Link href={`/pokemon/${pokemon.name}`} className="group block">
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary">
        <CardContent className="p-4 bg-secondary/50 aspect-square flex items-center justify-center relative">
          <Image
            src={imageUrl}
            alt={pokemon.name}
            width={200}
            height={200}
            className="object-contain w-full h-full transition-transform duration-300 group-hover:scale-105"
            data-ai-hint="pokemon character"
            priority={parseInt(id) < 21}
          />
        </CardContent>
        <CardFooter className="p-3 flex justify-between items-center bg-card">
          <h3 className="capitalize font-headline font-semibold text-lg">{pokemon.name}</h3>
          <Badge variant="outline">#{id.padStart(4, '0')}</Badge>
        </CardFooter>
      </Card>
    </Link>
  );
}
