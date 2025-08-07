'use client';

import * as React from 'react';
import { EvolutionNode, getPokemonIdFromUrl } from '@/lib/pokemon';
import Image from 'next/image';
import Link from 'next/link';
import ReactFlow, { Node, Edge, Position, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';

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
    const [nodes, setNodes] = React.useState<Node[]>([]);
    const [edges, setEdges] = React.useState<Edge[]>([]);

    React.useEffect(() => {
        const newNodes: Node[] = [];
        const newEdges: Edge[] = [];
        
        const buildElements = (node: EvolutionNode, x = 0, y = 0, parentId?: string) => {
            const id = node.species.name;

            newNodes.push({
                id,
                type: 'custom',
                data: { label: <EvolutionPokemon name={node.species.name} url={node.species.url} /> },
                position: { x, y },
            });

            if (parentId) {
                newEdges.push({
                    id: `e-${parentId}-${id}`,
                    source: parentId,
                    target: id,
                    animated: true,
                    markerEnd: { type: MarkerType.ArrowClosed },
                    style: { stroke: 'hsl(var(--primary))' },
                });
            }

            if (node.evolves_to && node.evolves_to.length > 0) {
                 const totalWidth = (node.evolves_to.length - 1) * 200;
                 const startX = x - totalWidth / 2;
                
                node.evolves_to.forEach((childNode, index) => {
                    buildElements(childNode, startX + index * 200, y + 250, id);
                });
            }
        };

        buildElements(evolutionChain, 350, 0);
        setNodes(newNodes);
        setEdges(newEdges);
    }, [evolutionChain]);

    if (!nodes.length) return null;

    return (
        <div style={{ height: 600 }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
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
