import { Header } from '@/components/header';
import { PokemonGrid } from '@/components/pokemon-grid';
import { getPokemonList } from '@/lib/pokemon';

export default async function Home() {
  const initialPokemonList = await getPokemonList(50); // Load first 50

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <PokemonGrid initialPokemon={initialPokemonList} />
        </div>
      </main>
    </div>
  );
}
