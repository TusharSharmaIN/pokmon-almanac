'use client';

import * as React from 'react';
import { EvolutionNode, getPokemonIdFromUrl } from '@/lib/pokemon';
import Image from 'next/image';
import Link from 'next/link';
import ReactFlow, { Elements, isNode, Position, MarkerType } from 'react-flow-renderer';
import 'react-flow-renderer/dist/style.css';

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

const CustomNode = ({ data }: { data: { label: React.ReactNode } }) => {
  return <>{data.label}</>;
};

const nodeTypes = {
  custom: CustomNode,
};

interface EvolutionGraphProps {
    evolutionChain: EvolutionNode;
}

const EvolutionGraph = ({ evolutionChain }: EvolutionGraphProps) => {
    const [elements, setElements] = React.useState<Elements>([]);

    React.useEffect(() => {
        const buildElements = (node: EvolutionNode, x = 0, y = 0, parentId?: string): Elements => {
            const id = node.species.name;
            const newElements: Elements = [
                {
                    id,
                    type: 'custom',
                    data: { label: <EvolutionPokemon name={node.species.name} url={node.species.url} /> },
                    position: { x, y },
                },
            ];

            if (parentId) {
                newElements.push({
                    id: `e-${parentId}-${id}`,
                    source: parentId,
                    target: id,
                    animated: true,
                    markerEnd: { type: MarkerType.ArrowClosed },
                    style: { stroke: 'hsl(var(--primary))' },
                });
            }

            if (node.evolves_to && node.evolves_to.length > 0) {
                const horizontalSpacing = 250;
                const verticalSpacing = 250;
                const totalWidth = (node.evolves_to.length - 1) * horizontalSpacing;
                const startX = x - totalWidth / 2;

                node.evolves_to.forEach((childNode, index) => {
                    const childX = startX + index * horizontalSpacing;
                    const childY = y + verticalSpacing;
                    newElements.push(...buildElements(childNode, childX, childY, id));
                });
            }

            return newElements;
        };

        const initialElements = buildElements(evolutionChain, 350, 0);
        setElements(initialElements);
    }, [evolutionChain]);

    return (
        <div style={{ height: 600 }}>
            <ReactFlow
                elements={elements}
                nodeTypes={nodeTypes}
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={false}
                zoomOnScroll={false}
                panOnScroll={true}
                zoomOnDoubleClick={false}
                panOnDrag={true}
                fitView
            >
            </ReactFlow>
        </div>
    );
};


interface PokemonPageClientProps {
  evolutionChain: EvolutionNode;
}

export function PokemonPageClient({ evolutionChain }: PokemonPageClientProps) {
  return <EvolutionGraph evolutionChain={evolutionChain} />;
}
