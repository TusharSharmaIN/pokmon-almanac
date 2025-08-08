import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Dna, Swords } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-7xl items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Dna className="h-6 w-6 text-primary" />
          <span className="font-headline text-lg font-bold">Pokemon Almanac</span>
        </Link>
        <nav>
          <Button asChild variant="ghost">
            <Link href="/battle">
              <Swords className="mr-2 h-4 w-4" />
              AI Battle
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
