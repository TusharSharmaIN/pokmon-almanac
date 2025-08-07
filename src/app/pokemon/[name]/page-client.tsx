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
        const getElements = (node: EvolutionNode, x = 0, y = 0, parentId?: string): Elements => {
            const id = node.species.name;
            const newElements: Elements = [];
            const isBranching = node.evolves_to.length > 1;

            const currentNode = {
                id,
                type: 'custom',
                data: { label: <EvolutionPokemon name={node.species.name} url={node.species.url} /> },
                position: { x, y },
                sourcePosition: isBranching ? Position.Right : Position.Bottom,
                targetPosition: isBranching ? Position.Left : Position.Top,
            };
            newElements.push(currentNode);

            if (parentId) {
                newElements.push({
                    id: `e${parentId}-${id}`,
                    source: parentId,
                    target: id,
                    animated: true,
                    markerEnd: { type: MarkerType.ArrowClosed },
                });
            }

            if (isBranching) {
                 const radius = 300;
                 const angleStep = 360 / node.evolves_to.length;

                 node.evolves_to.forEach((evolution, index) => {
                    const angle = angleStep * index - 90; // Start from top
                    const newX = x + radius * Math.cos((angle * Math.PI) / 180);
                    const newY = y + radius * Math.sin((angle * Math.PI) / 180);
                    newElements.push(...getElements(evolution, newX, newY, id));
                 });

            } else if (node.evolves_to.length === 1) {
                newElements.push(...getElements(node.evolves_to[0], x, y + 250, id));
            }

            return newElements;
        };

        let initialElements = getElements(evolutionChain);
        
        // Center the root node for branching evolutions
        if(isNode(initialElements[0]) && evolutionChain.evolves_to.length > 1) {
            const rootNode = initialElements.find(el => isNode(el) && el.id === evolutionChain.species.name);
            const childNodes = evolutionChain.evolves_to.map(evo => initialElements.find(el => isNode(el) && el.id === evo.species.name)).filter(n => n && isNode(n));
            
            if(rootNode && isNode(rootNode) && childNodes.length > 0) {
                 const xCoords = childNodes.map(n => isNode(n) ? n.position.x : 0);
                 const yCoords = childNodes.map(n => isNode(n) ? n.position.y : 0);
                 const minX = Math.min(...xCoords);
                 const maxX = Math.max(...xCoords);
                 const minY = Math.min(...yCoords);
                 const maxY = Math.max(...yCoords);

                 rootNode.position = {
                     x: (minX + maxX) / 2,
                     y: (minY + maxY) / 2
                 };
            }
        }

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
