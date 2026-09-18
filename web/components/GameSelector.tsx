'use client';
import { useState } from 'react';
import {
  EyeIcon,
  SparklesIcon,
  BoltIcon,
  PuzzlePieceIcon,
} from '@heroicons/react/24/outline';

// Game selection component
export default function GameSelector({ onSelect }: { onSelect: (type: string) => void }) {
  const [hovered, setHovered] = useState<string | null>(null);

  const games = [
    { type: 'attention', name: 'Hawkeye', icon: EyeIcon, desc: 'Visual Search', color: 'blue' },
    { type: 'memory', name: 'Target Tracker', icon: SparklesIcon, desc: 'Memory', color: 'purple' },
    { type: 'speed', name: 'Speed Reaction', icon: BoltIcon, desc: 'Speed', color: 'yellow' },
    { type: 'logic', name: 'Pattern Logic', icon: PuzzlePieceIcon, desc: 'Logic', color: 'green' },
  ];

  const colorMap: Record<string, string> = {
    blue: 'from-blue-500 to-cyan-500',
    purple: 'from-purple-500 to-pink-500',
    yellow: 'from-yellow-500 to-orange-500',
    green: 'from-green-500 to-emerald-500',
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {games.map((game) => {
        const Icon = game.icon;
        return (
          <button
            key={game.type}
            onClick={() => onSelect(game.type)}
            onMouseEnter={() => setHovered(game.type)}
            onMouseLeave={() => setHovered(null)}
            className="relative p-6 rounded-2xl bg-slate-800/50 backdrop-blur border transition-all hover:scale-105"
            style={{
              borderColor: hovered === game.type ? 'rgba(168,85,247,0.5)' : 'rgba(147,51,234,0.2)',
            }}
          >
            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${colorMap[game.color]} opacity-0 hover:opacity-10 transition-opacity`} />
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorMap[game.color]} flex items-center justify-center mb-3`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div className="text-white font-semibold">{game.name}</div>
            <div className="text-gray-400 text-sm">{game.desc}</div>
          </button>
        );
      })}
    </div>
  );
}
