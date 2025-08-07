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
        const getElements = (node: EvolutionNode): Elements => {
            const elements: Elements = [];
            const isBranching = node.evolves_to.length > 1;

            const processNode = (currentNode: EvolutionNode, x: number, y: number, parentId?: string) => {
                const id = currentNode.species.name;
                
                elements.push({
                    id,
                    type: 'custom',
                    data: { label: <EvolutionPokemon name={currentNode.species.name} url={currentNode.species.url} /> },
                    position: { x, y },
                    sourcePosition: Position.Bottom,
                    targetPosition: Position.Top,
                });

                if (parentId) {
                    elements.push({
                        id: `e${parentId}-${id}`,
                        source: parentId,
                        target: id,
                        animated: true,
                        markerEnd: { type: MarkerType.ArrowClosed },
                    });
                }
            };
            
            if (isBranching) {
                // Special layout for branching evolutions like Eevee
                const centerX = 350;
                const centerY = 0;
                const horizontalSpacing = 200;
                
                // Root node
                processNode(node, centerX, centerY);

                const evolutions = node.evolves_to;
                const totalWidth = (evolutions.length - 1) * horizontalSpacing;
                const startX = centerX - totalWidth / 2;

                evolutions.forEach((evo, index) => {
                    const x = startX + index * horizontalSpacing;
                    const y = centerY + 250;
                    processNode(evo, x, y, node.species.name);
                });

            } else {
                 // Standard vertical layout for linear evolutions
                const traverse = (currentNode: EvolutionNode, x: number, y: number, parentId?: string) => {
                    processNode(currentNode, x, y, parentId);
                    if (currentNode.evolves_to.length > 0) {
                        traverse(currentNode.evolves_to[0], x, y + 250, currentNode.species.name);
                    }
                }
                traverse(node, 350, 0);
            }

            return elements;
        };

        setElements(getElements(evolutionChain));
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
