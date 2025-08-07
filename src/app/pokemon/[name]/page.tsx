import * as React from 'react';
import { getPokemon, getPokemonSpecies, getEvolutionChain, EvolutionNode, getPokemonIdFromUrl } from '@/lib/pokemon';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Header } from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';

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
    <Badge style={{ backgroundColor: colors.bg, color: colors.text }} className="capitalize text-base px-4 py-1 border-none">
      {typeName}
    </Badge>
  );
};

const Stat = ({ name, value }: { name: string; value: number }) => (
  <div className="grid grid-cols-4 items-center gap-2">
    <span className="text-sm font-medium capitalize text-muted-foreground col-span-1">{name.replace('-', ' ')}</span>
    <div className="col-span-3 flex items-center gap-2">
      <span className="font-bold text-base w-10 text-right">{value}</span>
      <Progress value={(value / 255) * 100} className="w-full h-2" />
    </div>
  </div>
);

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


const EvolutionNodeDisplay = ({ node }: { node: EvolutionNode }) => {
  const hasEvolutions = node.evolves_to.length > 0;
  const isBranching = node.evolves_to.length > 1;

  if (isBranching) {
    const angleStep = 360 / node.evolves_to.length;
    return (
      <div className="flex items-center justify-center">
        <div className="relative w-96 h-96 flex items-center justify-center">
          <EvolutionPokemon name={node.species.name} url={node.species.url} />
          {node.evolves_to.map((nextNode, index) => {
            const angle = angleStep * index - 90; // -90 to start from top
            const radius = 180; // pixels
            const x = radius * Math.cos((angle * Math.PI) / 180);
            const y = radius * Math.sin((angle * Math.PI) / 180);
            return (
              <React.Fragment key={nextNode.species.name}>
                <div
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-primary"
                  style={{
                    transform: `translate(${x * 0.55}px, ${y * 0.55}px) rotate(${angle + 90}deg)`,
                  }}
                >
                  <ArrowRight size={32} />
                </div>
                <div
                  className="absolute top-1/2 left-1/2"
                  style={{ transform: `translate(-50%, -50%) translate(${x}px, ${y}px)` }}
                >
                  <EvolutionNodeDisplay node={nextNode} />
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center">
      <EvolutionPokemon name={node.species.name} url={node.species.url} />
      {hasEvolutions && (
        <>
          <div className="w-8 sm:w-16 mx-2 sm:mx-4 flex justify-center text-primary">
            <ArrowRight size={32} />
          </div>
          <div className="flex flex-col gap-4">
            {node.evolves_to.map((nextNode) => (
              <EvolutionNodeDisplay key={nextNode.species.name} node={nextNode} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default async function PokemonPage({ params }: { params: { name:string } }) {
  const pokemon = await getPokemon(params.name.toLowerCase());
  if (!pokemon) {
    notFound();
  }
  const species = await getPokemonSpecies(pokemon.id);
  const evolutionChain = await getEvolutionChain(species.evolution_chain.url);

  const description =
    species.flavor_text_entries.find((entry) => entry.language.name === 'en')?.flavor_text.replace(/[\n\f]/g, ' ') || 'No description available.';

  const prevPokemon = await getPokemon(pokemon.id - 1);
  const nextPokemon = await getPokemon(pokemon.id + 1);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-8">
        <div className="container max-w-5xl space-y-8">
          <div className="relative flex justify-between items-center">
            {prevPokemon ? (
              <Button asChild variant="outline">
                <Link href={`/pokemon/${prevPokemon.name}`} className="flex items-center gap-2">
                  <ArrowLeft /> <span className="capitalize hidden sm:inline">{prevPokemon.name}</span>
                </Link>
              </Button>
            ) : (
              <div />
            )}
            {nextPokemon ? (
              <Button asChild variant="outline">
                <Link href={`/pokemon/${nextPokemon.name}`} className="flex items-center gap-2">
                  <span className="capitalize hidden sm:inline">{nextPokemon.name}</span> <ArrowRight />
                </Link>
              </Button>
            ) : (
              <div />
            )}
          </div>

          <Card>
            <div className="grid md:grid-cols-2 gap-4 md:gap-8 p-4 md:p-8">
              <div className="flex flex-col items-center">
                <div className="bg-muted rounded-lg aspect-square w-full max-w-sm flex items-center justify-center p-8">
                  <Image src={pokemon.sprites.other['official-artwork'].front_default} alt={pokemon.name} width={400} height={400} className="object-contain" priority />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex flex-wrap items-baseline gap-4">
                  <h1 className="text-4xl md:text-5xl font-bold capitalize font-headline">{pokemon.name}</h1>
                  <span className="text-2xl font-bold text-muted-foreground">#{String(pokemon.id).padStart(4, '0')}</span>
                </div>
                <div className="flex gap-2">
                  {pokemon.types.map((t) => (
                    <TypeBadge key={t.type.name} typeName={t.type.name} />
                  ))}
                </div>
                <p className="text-base leading-relaxed">{description}</p>

                <Card className="bg-background/50 p-4">
                  <CardHeader className="p-0 mb-4"><CardTitle>Base Stats</CardTitle></CardHeader>
                  <CardContent className="space-y-2 p-0">
                    {pokemon.stats.map((s) => (
                      <Stat key={s.stat.name} name={s.stat.name} value={s.base_stat} />
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>

            {evolutionChain && evolutionChain.chain.evolves_to.length > 0 && (
              <div className="p-4 md:p-8 border-t overflow-x-auto">
                <h2 className="text-3xl font-bold mb-12 font-headline text-center">Evolution Chain</h2>
                <div className="flex items-center justify-center min-w-[500px] py-16">
                  <EvolutionNodeDisplay node={evolutionChain.chain} />
                </div>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
