import * as React from 'react';
import { getPokemon, getPokemonSpecies, getEvolutionChain, EvolutionNode, Pokemon, PokemonSpecies, EnrichedEvolutionNode, getGenus, getSpeciesFromUrl } from '@/lib/pokemon';
import { notFound } from 'next/navigation';
import { Header } from '@/components/header';
import { Card, CardContent } from '@/components/ui/card';
import { POKEMON_TYPE_COLORS_HSL, TypeBadge } from '@/components/type-badge';
import { PokemonPageClient } from './page-client';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { StatsChart } from './stats-chart';
import { Variations } from './variations';

function getEvolutionChainNames(node: EnrichedEvolutionNode | null): string[] {
    if (!node) return [];
    const names = [node.pokemon.name];
    node.evolves_to.forEach(evo => {
        names.push(...getEvolutionChainNames(evo));
    });
    return names;
}

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
    
    let species: PokemonSpecies | null = null;
    let evolutionChain: EvolutionChain | null = null;
    let enrichedEvolutionChain: EnrichedEvolutionNode | null = null;
    let description = 'No description available.';
    let genus = 'Unknown';
    let alternateForms: { name: string; url: string }[] = [];

    try {
        if (pokemon.species.url) {
            species = await getSpeciesFromUrl(pokemon.species.url);
        }

        if (species?.evolution_chain.url) {
            evolutionChain = await getEvolutionChain(species.evolution_chain.url);
            if (evolutionChain) {
                enrichedEvolutionChain = await enrichEvolutionChain(evolutionChain.chain);
            }
        }

        if (species) {
            description =
                species.flavor_text_entries.find((entry) => entry.language.name === 'en')?.flavor_text.replace(/[\n\f]/g, ' ') || 'No description available.';
            genus = getGenus(species);

            const evolutionNames = getEvolutionChainNames(enrichedEvolutionChain);

            alternateForms = species.varieties
                .filter(v => !v.is_default && !evolutionNames.includes(v.pokemon.name))
                .map(v => v.pokemon);
        }
    } catch (error) {
        console.error("Could not fetch species or evolution data for:", pokemon.name, error);
    }


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
                                <h1 className="text-6xl font-extrabold capitalize font-headline tracking-tighter">{pokemon.name.replace('-', ' ')}</h1>
                                <div className="flex gap-2 mt-2">
                                    {pokemon.types.map((t) => (
                                        <TypeBadge key={t.type.name} typeName={t.type.name} className="text-base px-4 py-1" />
                                    ))}
                                </div>
                                 <p className="text-lg text-muted-foreground mt-1">{genus}</p>
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
                                    <h2 className="text-xl font-bold font-headline mb-4 text-center">Base Stats</h2>
                                    <StatsChart stats={pokemon.stats} color={typeColor.bg} />
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

                    {alternateForms.length > 0 && (
                        <Card>
                            <CardContent className="p-6">
                                <h2 className="text-3xl font-bold mb-4 font-headline text-center">Alternate Forms</h2>
                                <Variations forms={alternateForms} />
                            </CardContent>
                        </Card>
                    )}
                </div>
            </main>
        </div>
    );
}
