'use client';

import * as React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import type { Pokemon } from '@/lib/pokemon';

interface StatsChartProps {
  stats: Pokemon['stats'];
  color: string;
}

const STAT_NAME_MAP: { [key: string]: string } = {
    'hp': 'HP',
    'attack': 'ATK',
    'defense': 'DEF',
    'special-attack': 'Sp. ATK',
    'special-defense': 'Sp. DEF',
    'speed': 'SPD',
};

export function StatsChart({ stats, color }: StatsChartProps) {
  const chartData = stats.map(stat => ({
    subject: STAT_NAME_MAP[stat.stat.name] || stat.stat.name,
    value: stat.base_stat,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/80 backdrop-blur-sm p-2 border rounded-lg shadow-lg">
          <p className="font-bold" style={{ color }}>{`${payload[0].payload.subject}: ${payload[0].value}`}</p>
        </div>
      );
    }
  
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
        <PolarGrid stroke="hsl(var(--muted-foreground))" strokeOpacity={0.5} />
        <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--foreground))', fontSize: 14 }} />
        <PolarRadiusAxis angle={30} domain={[0, 160]} tick={false} axisLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Radar name="Stats" dataKey="value" stroke={color} fill={color} fillOpacity={0.6} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
