import * as React from 'react';
import { getPokemon, getPokemonSpecies, getEvolutionChain, EvolutionNode, Pokemon, PokemonSpecies, EnrichedEvolutionNode, getGenus } from '@/lib/pokemon';
import { notFound } from 'next/navigation';
import { Header } from '@/components/header';
import { Card, CardContent } from '@/components/ui/card';
import { POKEMON_TYPE_COLORS_HSL, TypeBadge } from '@/components/type-badge';
import { PokemonPageClient } from './page-client';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

const StatDots = ({ name, value, primaryColor }: { name: string; value: number, primaryColor: string }) => {
  const totalDots = 15; // Max value can be around 255, let's scale it to 15 dots
  const filledDots = Math.ceil((value / 255) * totalDots);

  return (
    <div className="grid grid-cols-3 items-center gap-2">
      <span className="text-sm font-medium capitalize text-muted-foreground col-span-1">{name.replace('special-attack', 'Sp. Atk').replace('special-defense', 'Sp. Def').replace('-', ' ')}</span>
      <div className="col-span-2 flex items-center gap-1">
        {Array.from({ length: totalDots }).map((_, i) => (
          <div
            key={i}
            className={cn('w-full h-2 rounded-full', i < filledDots ? '' : 'bg-muted')}
            style={{ backgroundColor: i < filledDots ? primaryColor : undefined }}
          />
        ))}
      </div>
    </div>
  );
};


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

    const description =
        species.flavor_text_entries.find((entry) => entry.language.name === 'en')?.flavor_text.replace(/[\n\f]/g, ' ') || 'No description available.';

    const imageUrl = pokemon.sprites.other['official-artwork'].front_default;

    const primaryType = pokemon.types[0].type.name;
    const typeColor = POKEMON_TYPE_COLORS_HSL[primaryType] || { bg: 'hsl(var(--primary))', text: 'hsl(var(--primary-foreground))' };
    const bgColor = typeColor.bg.replace('hsl(', 'hsla(').replace(')', ', 0.2)');

    const totalStats = pokemon.stats.reduce((acc, stat) => acc + stat.base_stat, 0);

    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 py-8" style={{ backgroundColor: bgColor }}>
                <div className="container max-w-5xl space-y-8">
                    {/* Top section with image, name, types */}
                    <div className="relative">
                        <div className="relative flex flex-col md:flex-row items-center gap-8">
                            <div className="flex-shrink-0">
                                <Image src={imageUrl} alt={pokemon.name} width={250} height={250} className="object-contain" priority />
                            </div>
                            <div className="flex flex-col items-center md:items-start text-center md:text-left">
                                <span className="text-2xl font-bold text-muted-foreground">#{String(pokemon.id).padStart(4, '0')}</span>
                                <h1 className="text-6xl font-extrabold capitalize font-headline tracking-tighter">{pokemon.name}</h1>
                                <div className="flex gap-2 mt-2">
                                    {pokemon.types.map((t) => (
                                        <TypeBadge key={t.type.name} typeName={t.type.name} className="text-base px-4 py-1" />
                                    ))}
                                </div>
                                 <p className="text-lg text-muted-foreground mt-1">{getGenus(species)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Left Column */}
                        <div className="md:col-span-1 space-y-8">
                            <Card>
                                <CardContent className="p-6">
                                    <h2 className="text-xl font-bold font-headline mb-4">Abilities</h2>
                                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                        {pokemon.abilities.map(a => <li key={a.ability.name} className="capitalize">{a.ability.name.replace('-', ' ')}{a.is_hidden ? ' (Hidden)' : ''}</li>)}
                                    </ul>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-6 grid grid-cols-2 gap-4 text-center">
                                    <div>
                                        <h3 className="text-xl font-bold font-headline">Height</h3>
                                        <p className="text-2xl text-muted-foreground">{(pokemon.height / 10).toFixed(1)} m</p>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold font-headline">Weight</h3>
                                        <p className="text-2xl text-muted-foreground">{(pokemon.weight / 10).toFixed(1)} kg</p>
                                    </div>
                                </CardContent>
                            </Card>
                             <Card>
                                <CardContent className="p-6 text-center">
                                    <h2 className="text-xl font-bold font-headline mb-2">Base Stat Total</h2>
                                    <p className="text-6xl font-bold" style={{color: typeColor.bg}}>{totalStats}</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column */}
                        <div className="md:col-span-2 space-y-8">
                           <Card>
                               <CardContent className="p-6">
                                   <p className="text-lg leading-relaxed">{description}</p>
                               </CardContent>
                           </Card>
                            <Card>
                                <CardContent className="p-6 space-y-4">
                                    <h2 className="text-xl font-bold font-headline mb-4">Stats</h2>
                                    {pokemon.stats.map((s) => (
                                        <StatDots key={s.stat.name} name={s.stat.name} value={s.base_stat} primaryColor={typeColor.bg} />
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Evolution Chain */}
                    {enrichedEvolutionChain && (
                        <Card>
                            <CardContent className="p-6">
                                <h2 className="text-3xl font-bold mb-4 font-headline text-center">Evolution Chain</h2>
                                <PokemonPageClient enrichedEvolutionChain={enrichedEvolutionChain} currentPokemonName={pokemon.name} />
                            </CardContent>
                        </Card>
                    )}
                </div>
            </main>
        </div>
    );
}
