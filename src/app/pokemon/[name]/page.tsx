import * as React from 'react';
import { getPokemon, getPokemonSpecies, getEvolutionChain, EvolutionNode, getPokemonIdFromUrl, Pokemon, PokemonSpecies, EvolutionChain as EvolutionChainType, EnrichedEvolutionNode } from '@/lib/pokemon';
import { notFound } from 'next/navigation';
import { Header } from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { PokemonPageClient } from './page-client';
import { PokemonImage } from '@/components/pokemon-image';
import { TypeBadge } from '@/components/type-badge';

const Stat = ({ name, value }: { name: string; value: number }) => (
  <div className="grid grid-cols-4 items-center gap-2">
    <span className="text-sm font-medium capitalize text-muted-foreground col-span-1">{name.replace('-', ' ')}</span>
    <div className="col-span-3 flex items-center gap-2">
      <span className="font-bold text-base w-10 text-right">{value}</span>
      <Progress value={(value / 255) * 100} className="w-full h-2" />
    </div>
  </div>
);

// This function recursively fetches pokemon data for the evolution chain
async function enrichEvolutionChain(node: EvolutionNode): Promise<EnrichedEvolutionNode | null> {
    const pokemon = await getPokemon(node.species.name);
    if (!pokemon) return null;
  
    const evolves_to = await Promise.all(
      node.evolves_to.map(async (evoNode) => enrichEvolutionChain(evoNode))
    );
  
    return {
      pokemon,
      evolves_to: evolves_to.filter((evo): evo is EnrichedEvolutionNode => evo !== null),
    };
  }

interface PokemonPageProps {
  params: { name: string };
}

export default async function PokemonPage({ params }: PokemonPageProps) {
    const pokemon = await getPokemon(params.name.toLowerCase());
    if (!pokemon) {
        notFound();
    }
    
    const species = await getPokemonSpecies(pokemon.id);
    const evolutionChain = species.evolution_chain.url ? await getEvolutionChain(species.evolution_chain.url) : null;
    
    let enrichedEvolutionChain: EnrichedEvolutionNode | null = null;
    if (evolutionChain) {
        enrichedEvolutionChain = await enrichEvolutionChain(evolutionChain.chain);
    }

    // Fetch previous and next pokemon names on the server
    const prevPokemonData = pokemon.id > 1 ? await getPokemon(pokemon.id - 1) : null;
    const nextPokemonData = await getPokemon(pokemon.id + 1);

    const description =
        species.flavor_text_entries.find((entry) => entry.language.name === 'en')?.flavor_text.replace(/[\n\f]/g, ' ') || 'No description available.';

    const imageUrl = pokemon.sprites.other['official-artwork'].front_default;
    const shinyImageUrl = pokemon.sprites.other['official-artwork'].front_shiny;

    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 py-8">
                <div className="container max-w-5xl space-y-8">
                    <div className="relative flex justify-between items-center">
                        {prevPokemonData ? (
                        <Button asChild variant="outline">
                            <Link href={`/pokemon/${prevPokemonData.name}`} className="flex items-center gap-2">
                            <ArrowLeft /> <span className="capitalize hidden sm:inline">{prevPokemonData.name}</span>
                            </Link>
                        </Button>
                        ) : (
                        <div />
                        )}
                        {nextPokemonData ? (
                        <Button asChild variant="outline">
                            <Link href={`/pokemon/${nextPokemonData.name}`} className="flex items-center gap-2">
                            <span className="capitalize hidden sm:inline">{nextPokemonData.name}</span> <ArrowRight />
                            </Link>
                        </Button>
                        ) : (
                        <div />
                        )}
                    </div>

                    <Card>
                        <div className="grid md:grid-cols-2 gap-4 md:gap-8 p-4 md:p-8">
                            <PokemonImage
                                name={pokemon.name}
                                defaultUrl={imageUrl}
                                shinyUrl={shinyImageUrl}
                            />
                            <div className="space-y-4">
                                <div className="flex flex-wrap items-baseline gap-4">
                                <h1 className="text-4xl md:text-5xl font-bold capitalize font-headline">{pokemon.name}</h1>
                                <span className="text-2xl font-bold text-muted-foreground">#{String(pokemon.id).padStart(4, '0')}</span>
                                </div>
                                <div className="flex gap-2">
                                {pokemon.types.map((t) => (
                                    <TypeBadge key={t.type.name} typeName={t.type.name} className="text-base px-4 py-1"/>
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

                        {enrichedEvolutionChain && (
                            <div className="p-4 md:p-8 border-t">
                                <h2 className="text-3xl font-bold mb-4 font-headline text-center">Evolution Chain</h2>
                                <PokemonPageClient enrichedEvolutionChain={enrichedEvolutionChain} currentPokemonName={pokemon.name} />
                            </div>
                        )}
                    </Card>
                </div>
            </main>
        </div>
    );
}
