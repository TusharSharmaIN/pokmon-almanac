import { Badge } from '@/components/ui/badge';

export const POKEMON_TYPE_COLORS_HSL: { [key: string]: { bg: string; text: string } } = {
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
  
export const TypeBadge = ({ typeName, ...props }: { typeName: string } & React.ComponentProps<typeof Badge>) => {
    const colors = POKEMON_TYPE_COLORS_HSL[typeName] || { bg: 'gray', text: 'white' };
    return (
      <Badge style={{ backgroundColor: colors.bg, color: colors.text }} className="capitalize text-xs px-2 py-0.5 border-none" {...props}>
        {typeName}
      </Badge>
    );
};
