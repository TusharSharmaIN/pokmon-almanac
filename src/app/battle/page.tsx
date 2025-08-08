'use client';
import { useState, useTransition, useEffect } from 'react';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PokemonSelector } from '@/components/pokemon-selector';
import { createBattleNarrativeAction } from './actions';
import { Swords, Loader2, Trophy } from 'lucide-react';
import type { Pokemon, PokemonListItem } from '@/lib/pokemon';
import type { GenerateBattleNarrativeOutput } from '@/ai/flows/generate-battle-narrative';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

async function getAllPokemon(): Promise<PokemonListItem[]> {
  const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1302');
  if (!res.ok) {
    throw new Error('Failed to fetch pokemon list');
  }
  const data = await res.json();
  return data.results;
}

export default function BattlePage() {
  const [pokemon1, setPokemon1] = useState<Pokemon | null>(null);
  const [pokemon2, setPokemon2] = useState<Pokemon | null>(null);
  const [narrative, setNarrative] = useState<GenerateBattleNarrativeOutput | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [allPokemon, setAllPokemon] = useState<PokemonListItem[]>([]);
  const [isListLoading, setIsListLoading] = useState(true);

  useEffect(() => {
    getAllPokemon()
      .then(setAllPokemon)
      .catch(() => toast({ title: 'Error', description: 'Could not load Pokémon list for selection.', variant: 'destructive' }))
      .finally(() => setIsListLoading(false));
  }, [toast]);

  const handleGenerate = () => {
    if (!pokemon1 || !pokemon2) {
      toast({
        title: 'Selection Error',
        description: 'Please select two Pokémon to battle.',
        variant: 'destructive',
      });
      return;
    }

    startTransition(async () => {
      setNarrative(null);
      const result = await createBattleNarrativeAction(pokemon1, pokemon2);
      if (result.error) {
        toast({
          title: 'Generation Error',
          description: result.error,
          variant: 'destructive',
        });
      } else {
        setNarrative(result.narrative || null);
      }
    });
  };

  const PokemonDisplay = ({ pokemon }: { pokemon: Pokemon | null }) => (
    <div className="flex-1 flex flex-col items-center justify-center p-4 border rounded-lg min-h-64 bg-muted/50">
      {pokemon ? (
        <>
          <Image src={pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.other.dream_world.front_default} alt={pokemon.name} width={128} height={128} />
          <h3 className="text-xl font-bold capitalize font-headline mt-2">{pokemon.name}</h3>
        </>
      ) : (
        <div className="text-center text-muted-foreground">
            <Skeleton className="w-32 h-32 rounded-full mx-auto" />
            <Skeleton className="w-40 h-6 mt-4 mx-auto" />
        </div>
      )}
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-8">
        <div className="container max-w-4xl space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold font-headline">AI Battle Simulator</h1>
            <p className="text-muted-foreground mt-2">Select two Pokémon and watch the AI generate an epic battle story!</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold font-headline text-center md:text-left">Challenger 1</h2>
              <PokemonSelector pokemonList={allPokemon} selectedPokemon={pokemon1} onSelectPokemon={setPokemon1} isLoading={isListLoading} />
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-bold font-headline text-center md:text-left">Challenger 2</h2>
              <PokemonSelector pokemonList={allPokemon} selectedPokemon={pokemon2} onSelectPokemon={setPokemon2} disabled={!pokemon1} isLoading={isListLoading} />
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 md:gap-8">
            <PokemonDisplay pokemon={pokemon1} />
            <Swords className="w-12 h-12 md:w-16 md:h-16 text-primary shrink-0" />
            <PokemonDisplay pokemon={pokemon2} />
          </div>

          <div className="text-center">
            <Button size="lg" onClick={handleGenerate} disabled={isPending || !pokemon1 || !pokemon2} className="bg-accent text-accent-foreground hover:bg-accent/90">
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Swords className="mr-2 h-4 w-4" />}
              Generate Battle
            </Button>
          </div>

          {isPending && (
            <Card>
              <CardHeader>
                  <Skeleton className="h-8 w-1/2 mx-auto" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center space-y-4">
                    <Skeleton className="w-16 h-16 rounded-full" />
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-6 w-full max-w-sm" />
                </div>
                <Separator />
                <div className="space-y-4">
                    <Skeleton className="h-6 w-32" />
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="flex gap-4 items-start">
                            <Skeleton className="w-12 h-12 rounded-full shrink-0" />
                            <div className="flex-grow space-y-2 pt-2">
                              <Skeleton className="h-4 w-full" />
                              <Skeleton className="h-4 w-3/4" />
                            </div>
                          </div>
                        ))}
                    </div>
                </div>
              </CardContent>
            </Card>
          )}

          {narrative && (
            <Card className="animate-in fade-in-0 slide-in-from-bottom-10 duration-500">
              <CardHeader>
                <CardTitle className="font-headline text-3xl text-center">The Epic Battle</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center space-y-2 p-4 bg-muted/50 rounded-lg">
                    <Trophy className="w-16 h-16 text-yellow-400 mx-auto"/>
                    <h3 className="text-3xl font-bold capitalize font-headline">{narrative.winner} is victorious!</h3>
                    <p className="text-muted-foreground text-lg">{narrative.outcome}</p>
                </div>
                
                <Separator />

                <div className="space-y-4">
                    <h4 className="font-headline text-xl font-bold">Battle Log</h4>
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-4 -mr-4">
                        {narrative.events.map((event) => (
                            <div key={event.turn} className="flex gap-4 items-start">
                                <Badge variant="secondary" className="text-lg font-bold w-12 h-12 flex items-center justify-center shrink-0 rounded-full bg-primary/10 text-primary">{event.turn}</Badge>
                                <p className="text-base font-body pt-3">{event.action}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <Separator />
                
                <div className="space-y-4">
                    <h4 className="font-headline text-xl font-bold">Battle Summary</h4>
                    <p className="text-lg leading-relaxed font-body">{narrative.summary}</p>
                </div>

              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
