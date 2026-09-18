'use client';
import { useState, useEffect } from 'react';
import {
  BrainIcon,
  EyeIcon,
  EyeIcon as EyeDetailIcon,
  ZapIcon,
  PuzzleIcon,
  TrophyIcon,
  ClockIcon,
  TrendingUpIcon,
} from '@heroicons/react/24/outline';

interface GameResult {
  game_type: string;
  score: number;
  accuracy: number;
  response_time: number;
  difficulty: number;
}

interface Session {
  id: string;
  user_id: string;
  game_type: string;
  score: number;
  accuracy: number;
  difficulty: number;
  created_at: string;
}

const GAMES = [
  { type: 'attention', name: 'Hawkeye', icon: EyeDetailIcon, desc: '视觉搜索与注意力训练' },
  { type: 'memory', name: 'Target Tracker', icon: BrainIcon, desc: '工作记忆与追踪训练' },
  { type: 'speed', name: 'Speed Reaction', icon: ZapIcon, desc: '处理速度与反应时间' },
  { type: 'logic', name: 'Pattern Logic', icon: PuzzleIcon, desc: '逻辑推理与模式识别' },
];

export default function Home() {
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [result, setResult] = useState<GameResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [userId] = useState('user_' + Date.now());

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await fetch(`/api/user/stats/${userId}`);
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error('Failed to load stats:', e);
    }
  };

  const playGame = async (gameType: string, difficulty: number = 2) => {
    setLoading(true);
    setResult(null);
    
    try {
      const res = await fetch(`/api/game/${gameType}?difficulty=${difficulty}`);
      const data = await res.json();
      
      // Save session
      fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          game_type: gameType,
          score: data.score,
          accuracy: data.accuracy,
          difficulty: difficulty,
        }),
      }).catch(console.error);
      
      setResult(data);
      loadStats();
    } catch (e) {
      console.error('Game failed:', e);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return 'text-green-400';
    if (accuracy >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <BrainIcon className="w-12 h-12 text-purple-400" />
            AI Brain Trainer
          </h1>
          <p className="text-xl text-purple-200">前额叶认知训练 · 全功能版</p>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-4 border border-purple-500/20">
              <div className="text-purple-400 text-sm">总训练次数</div>
              <div className="text-white text-3xl font-bold">{stats.total_sessions || 0}</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-4 border border-purple-500/20">
              <div className="text-purple-400 text-sm">平均分数</div>
              <div className="text-white text-3xl font-bold">{Math.round(stats.avg_score || 0)}</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-4 border border-purple-500/20">
              <div className="text-purple-400 text-sm">专业用户</div>
              <div className="text-white text-3xl font-bold">{stats.pro_users || 0}</div>
            </div>
          </div>
        )}

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {GAMES.map((game) => {
            const Icon = game.icon;
            return (
              <div key={game.type} className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-purple-500/20 hover:border-purple-500/50 transition-all">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-600/20 rounded-xl">
                    <Icon className="w-8 h-8 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg">{game.name}</h3>
                    <p className="text-gray-400 text-sm">{game.desc}</p>
                    <div className="mt-4 flex gap-2">
                      {[1, 2, 3].map(diff => (
                        <button
                          key={diff}
                          onClick={() => playGame(game.type, diff)}
                          disabled={loading}
                          className="px-3 py-1 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 text-white text-sm rounded-lg transition-all"
                        >
                          难度 {diff}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Current Result */}
        {result && (
          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-purple-500/20 mb-8">
            <h2 className="text-white font-semibold text-xl mb-4 flex items-center gap-2">
              <TrophyIcon className="w-6 h-6 text-yellow-400" />
              本次结果
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-gray-400 text-sm">分数</div>
                <div className={`text-3xl font-bold ${getScoreColor(result.score)}`}>{result.score}</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">准确率</div>
                <div className={`text-3xl font-bold ${getAccuracyColor(result.accuracy)}`}>{result.accuracy.toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">反应时间</div>
                <div className="text-3xl font-bold text-white">{result.response_time.toFixed(0)}ms</div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <BrainIcon className="w-16 h-16 text-purple-400 animate-spin mx-auto mb-4" />
            <p className="text-purple-200">训练中...</p>
          </div>
        )}

        {/* Recent Sessions */}
        <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-purple-500/20">
          <h2 className="text-white font-semibold text-xl mb-4 flex items-center gap-2">
            <ClockIcon className="w-6 h-6 text-purple-400" />
            最近训练
          </h2>
          <div className="space-y-2">
            {sessions.length === 0 ? (
              <p className="text-gray-400 text-center py-4">暂无训练记录，开始你的第一次训练吧！</p>
            ) : (
              sessions.slice(0, 10).map((session) => (
                <div key={session.id} className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg">
                  <div>
                    <span className="text-white font-medium">{session.game_type}</span>
                    <span className="text-gray-400 text-sm ml-2">难度 {session.difficulty}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`font-semibold ${getScoreColor(session.score)}`}>{session.score}</span>
                    <span className={`text-sm ${getAccuracyColor(session.accuracy)}`}>{session.accuracy.toFixed(0)}%</span>
                    <span className="text-gray-500 text-xs">{new Date(session.created_at).toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
