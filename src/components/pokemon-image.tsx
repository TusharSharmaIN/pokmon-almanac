'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Sparkles } from 'lucide-react';

interface PokemonImageProps {
  name: string;
  defaultUrl: string;
  shinyUrl: string;
}

export function PokemonImage({ name, defaultUrl, shinyUrl }: PokemonImageProps) {
  const [isShiny, setIsShiny] = useState(false);

  const imageUrl = isShiny ? shinyUrl : defaultUrl;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="bg-muted rounded-lg aspect-square w-full max-w-sm flex items-center justify-center p-8 relative">
        <Image src={imageUrl} alt={name} width={400} height={400} className="object-contain" priority />
      </div>
      {shinyUrl && (
        <div className="flex items-center space-x-2">
          <Switch id="shiny-toggle" checked={isShiny} onCheckedChange={setIsShiny} />
          <Label htmlFor="shiny-toggle" className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            Shiny
          </Label>
        </div>
      )}
    </div>
  );
}
