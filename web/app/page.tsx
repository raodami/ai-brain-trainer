'use client';
import { useState, useEffect, useRef } from 'react';
import {
  SparklesIcon,
  EyeIcon,
  BoltIcon,
  PuzzlePieceIcon,
  TrophyIcon,
  ClockIcon,
  ChartBarIcon,
  UserCircleIcon,
  LockClosedIcon,
  CreditCardIcon,
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
  { type: 'attention', name: 'Hawkeye', icon: EyeIcon, desc: 'Find the target in the grid', color: 'from-blue-500 to-cyan-500' },
  { type: 'memory', name: 'Target Tracker', icon: SparklesIcon, desc: 'Remember the sequence', color: 'from-purple-500 to-pink-500' },
  { type: 'speed', name: 'Speed Reaction', icon: BoltIcon, desc: 'Click as fast as you can', color: 'from-yellow-500 to-orange-500' },
  { type: 'logic', name: 'Pattern Logic', icon: PuzzlePieceIcon, desc: 'Complete the pattern', color: 'from-green-500 to-emerald-500' },
];

// Hawkeye Game - Find the different colored cell
function HawkeyeGame({ onResult, difficulty }: { onResult: (r: GameResult) => void; difficulty: number }) {
  const [grid, setGrid] = useState<string[][]>([]);
  const [found, setFound] = useState(false);
  const startTime = useRef<number>(0);

  useEffect(() => {
    const size = 3 + difficulty;
    const newGrid: string[][] = [];
    let targetPos = { row: 0, col: 0 };

    for (let i = 0; i < size; i++) {
      newGrid[i] = [];
      for (let j = 0; j < size; j++) {
        newGrid[i][j] = '#4F46E5';
      }
    }

    targetPos = { row: Math.floor(Math.random() * size), col: Math.floor(Math.random() * size) };
    newGrid[targetPos.row][targetPos.col] = '#06B6D4';
    setGrid(newGrid);
    startTime.current = Date.now();
  }, [difficulty]);

  const handleClick = (row: number, col: number) => {
    if (found) return;
    const elapsed = Date.now() - startTime.current;

    if (grid[row][col] === '#06B6D4') {
      setFound(true);
      const accuracy = 100;
      const score = Math.max(0, 1000 - elapsed / 10);
      onResult({ game_type: 'attention', score, accuracy, response_time: elapsed, difficulty });
    } else {
      grid[row][col] = '#EF4444';
      setGrid([...grid]);
      const accuracy = Math.max(0, 100 - (difficulty * 10));
      const score = Math.max(0, 500 - elapsed / 20);
      onResult({ game_type: 'attention', score, accuracy, response_time: elapsed, difficulty });
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${3 + difficulty}, minmax(0, 1fr))` }}>
        {grid.map((row, i) =>
          row.map((color, j) => (
            <button
              key={`${i}-${j}`}
              onClick={() => handleClick(i, j)}
              className="w-12 h-12 rounded-lg transition-all hover:scale-105"
              style={{ backgroundColor: color }}
            />
          ))
        )}
      </div>
      <p className="text-gray-400">Find the cyan cell!</p>
    </div>
  );
}

// Target Tracker Game - Remember and click sequence
function TargetTrackerGame({ onResult, difficulty }: { onResult: (r: GameResult) => void; difficulty: number }) {
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSeq, setPlayerSeq] = useState<number[]>([]);
  const [showing, setShowing] = useState(false);
  const [grid, setGrid] = useState<string[]>(Array(9).fill('#4F46E5'));

  useEffect(() => {
    const len = 2 + difficulty;
    const seq: number[] = [];
    for (let i = 0; i < len; i++) {
      seq.push(Math.floor(Math.random() * 9));
    }
    setSequence(seq);

    setTimeout(() => {
      showSequence(seq);
    }, 500);
  }, [difficulty]);

  const showSequence = async (seq: number[]) => {
    setShowing(true);
    for (let i = 0; i < seq.length; i++) {
      await new Promise(r => setTimeout(r, 600));
      const newGrid = [...grid];
      newGrid[seq[i]] = '#06B6D4';
      setGrid(newGrid);
      await new Promise(r => setTimeout(r, 400));
      newGrid[seq[i]] = '#4F46E5';
      setGrid(newGrid);
    }
    setShowing(false);
  };

  const handleClick = (idx: number) => {
    if (showing) return;

    const newPlayerSeq = [...playerSeq, idx];
    setPlayerSeq(newPlayerSeq);

    const newGrid = [...grid];
    newGrid[idx] = '#06B6D4';
    setGrid(newGrid);
    setTimeout(() => {
      newGrid[idx] = '#4F46E5';
      setGrid(newGrid);
    }, 200);

    if (newPlayerSeq[newPlayerSeq.length - 1] !== sequence[newPlayerSeq.length - 1]) {
      const accuracy = 50;
      const score = newPlayerSeq.length * 100;
      onResult({ game_type: 'memory', score, accuracy, response_time: 1000, difficulty });
      return;
    }

    if (newPlayerSeq.length === sequence.length) {
      const accuracy = 100;
      const score = sequence.length * 150;
      onResult({ game_type: 'memory', score, accuracy, response_time: 500, difficulty });
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="grid grid-cols-3 gap-2">
        {grid.map((color, i) => (
          <button
            key={i}
            onClick={() => handleClick(i)}
            disabled={showing}
            className="w-16 h-16 rounded-xl transition-all hover:scale-105 disabled:opacity-50"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
      <p className="text-gray-400">{showing ? 'Watch carefully...' : 'Repeat the pattern!'}</p>
    </div>
  );
}

// Speed Reaction Game - Click when color changes
function SpeedReactionGame({ onResult, difficulty }: { onResult: (r: GameResult) => void; difficulty: number }) {
  const [color, setColor] = useState('#EF4444');
  const startTimeRef = useRef(Date.now());
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    const delay = 1000 + Math.random() * 2000;
    const timer = setTimeout(() => setColor('#22C55E'), delay);
    return () => clearTimeout(timer);
  }, []);

  const handleClick = () => {
    if (clicked) return;
    setClicked(true);
    const elapsed = Date.now() - startTimeRef.current;
    const accuracy = Math.min(100, 100 - Math.abs(elapsed - 1500) / 10);
    const score = Math.max(0, 1000 - elapsed);
    onResult({ game_type: 'speed', score, accuracy, response_time: elapsed, difficulty });
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={handleClick}
        disabled={clicked}
        className="w-48 h-48 rounded-3xl transition-all hover:scale-105 disabled:opacity-50"
        style={{ backgroundColor: color }}
      />
      <p className="text-gray-400">{clicked ? 'Done!' : color === '#EF4444' ? 'Wait for green...' : 'Click now!'}</p>
    </div>
  );
}

// Pattern Logic Game
function PatternLogicGame({ onResult, difficulty }: { onResult: (r: GameResult) => void; difficulty: number }) {
  const [question, setQuestion] = useState<{ pattern: number[]; answer: number; options: number[] } | null>(null);
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    generateQuestion();
  }, [difficulty]);

  const generateQuestion = () => {
    const start = Math.floor(Math.random() * 10) + 1;
    const step = Math.floor(Math.random() * 3) + 1;
    const pattern = [];
    for (let i = 0; i < 4; i++) {
      pattern.push(start + step * i);
    }
    const answer = start + step * 4;
    const options = [answer - 2, answer - 1, answer, answer + 1].sort(() => Math.random() - 0.5);
    setQuestion({ pattern, answer, options });
    setSelected(null);
  };

  const handleClick = (val: number) => {
    setSelected(val);
    const accuracy = val === question?.answer ? 100 : 50;
    const score = val === question?.answer ? 200 : 50;
    setTimeout(() => {
      onResult({ game_type: 'logic', score, accuracy, response_time: 1000, difficulty });
      generateQuestion();
    }, 500);
  };

  if (!question) return null;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex gap-2 text-2xl font-mono">
        {question.pattern.map((n, i) => (
          <span key={i} className="px-3 py-2 bg-slate-700 rounded-lg text-white">{n}</span>
        ))}
        <span className="px-3 py-2 text-purple-400">?</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {question.options.map((opt) => (
          <button
            key={opt}
            onClick={() => handleClick(opt)}
            className={`px-6 py-3 rounded-xl text-xl font-bold transition-all hover:scale-105 ${
              selected === opt ? 'bg-purple-600' : 'bg-slate-700 hover:bg-slate-600'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [result, setResult] = useState<GameResult | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [userId] = useState('user_' + Date.now());
  const [isPro] = useState(false);
  const [dailyUsage, setDailyUsage] = useState(0);

  const loadStats = async () => {
    try {
      const res = await fetch(`/api/user/stats/${userId}`);
      const data = await res.json();
      setStats(data);
    } catch (e) { /* ignore */ }
  };

  const playGame = async (gameResult: GameResult) => {
    const { game_type, difficulty } = gameResult;
    try {
      await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, ...gameResult }),
      });
      setSessions(prev => [
        { id: Date.now().toString(), user_id: userId, ...gameResult, created_at: new Date().toISOString() },
        ...prev.slice(0, 9),
      ]);
      setDailyUsage(prev => prev + 1);
      setResult(gameResult);
      loadStats();
    } catch (e) { /* ignore */ }
  };

  const getScoreColor = (score: number) => score >= 80 ? 'text-green-400' : score >= 60 ? 'text-yellow-400' : 'text-red-400';
  const getAccuracyColor = (accuracy: number) => accuracy >= 90 ? 'text-green-400' : accuracy >= 70 ? 'text-yellow-400' : 'text-red-400';

  const renderGame = () => {
    if (!activeGame) return null;
    const difficulty = 2;

    switch (activeGame) {
      case 'attention':
        return <HawkeyeGame onResult={playGame} difficulty={difficulty} />;
      case 'memory':
        return <TargetTrackerGame onResult={playGame} difficulty={difficulty} />;
      case 'speed':
        return <SpeedReactionGame onResult={playGame} difficulty={difficulty} />;
      case 'logic':
        return <PatternLogicGame onResult={playGame} difficulty={difficulty} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div className="text-center flex-1">
            <h1 className="text-5xl font-bold text-white mb-2 flex items-center justify-center gap-3">
              <SparklesIcon className="w-12 h-12 text-purple-400" />
              AI Brain Trainer
            </h1>
            <p className="text-xl text-purple-200">Cognitive Training Platform</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-gray-400 text-sm">Daily Sessions</div>
              <div className="text-white text-2xl font-bold">{dailyUsage}/3</div>
            </div>
            {!isPro && dailyUsage >= 3 && (
              <button className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-xl">
                <LockClosedIcon className="w-5 h-5" />
                Upgrade to Pro
              </button>
            )}
          </div>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-4 border border-purple-500/20">
              <div className="text-purple-400 text-sm">Total Sessions</div>
              <div className="text-white text-3xl font-bold">{stats.total_sessions || 0}</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-4 border border-purple-500/20">
              <div className="text-purple-400 text-sm">Avg Score</div>
              <div className="text-white text-3xl font-bold">{Math.round(stats.avg_score || 0)}</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-4 border border-purple-500/20">
              <div className="text-purple-400 text-sm">Pro Users</div>
              <div className="text-white text-3xl font-bold">{stats.pro_users || 0}</div>
            </div>
          </div>
        )}

        {/* Active Game */}
        {activeGame ? (
          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-8 border border-purple-500/20 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-white font-semibold text-2xl">{GAMES.find(g => g.type === activeGame)?.name}</h2>
              <button onClick={() => setActiveGame(null)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            {renderGame()}
            {result && (
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="bg-slate-900/50 rounded-xl p-4">
                  <div className="text-gray-400 text-sm">Score</div>
                  <div className={`text-3xl font-bold ${getScoreColor(result.score)}`}>{result.score}</div>
                </div>
                <div className="bg-slate-900/50 rounded-xl p-4">
                  <div className="text-gray-400 text-sm">Accuracy</div>
                  <div className={`text-3xl font-bold ${getAccuracyColor(result.accuracy)}`}>{result.accuracy.toFixed(1)}%</div>
                </div>
                <div className="bg-slate-900/50 rounded-xl p-4">
                  <div className="text-gray-400 text-sm">Time</div>
                  <div className="text-3xl font-bold text-white">{result.response_time.toFixed(0)}ms</div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Games Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {GAMES.map((game) => {
              const Icon = game.icon;
              return (
                <button
                  key={game.type}
                  onClick={() => {
                    if (!isPro && dailyUsage >= 3) return;
                    setActiveGame(game.type);
                  }}
                  className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-purple-500/20 hover:border-purple-500/50 transition-all text-left group"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-4 rounded-xl bg-gradient-to-br ${game.color} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-xl">{game.name}</h3>
                      <p className="text-gray-400">{game.desc}</p>
                    </div>
                    <div className="text-purple-400 group-hover:translate-x-1 transition-transform">→</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Recent Sessions */}
        <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-purple-500/20">
          <h2 className="text-white font-semibold text-xl mb-4 flex items-center gap-2">
            <ClockIcon className="w-6 h-6 text-purple-400" />
            Recent Sessions
          </h2>
          <div className="space-y-2">
            {sessions.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No sessions yet. Start training!</p>
            ) : (
              sessions.map((session) => (
                <div key={session.id} className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg hover:bg-slate-900 transition-colors">
                  <div>
                    <span className="text-white font-medium">{session.game_type}</span>
                    <span className="text-gray-400 text-sm ml-2">Level {session.difficulty}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`font-semibold ${getScoreColor(session.score)}`}>{session.score}</span>
                    <span className={`text-sm ${getAccuracyColor(session.accuracy)}`}>{session.accuracy.toFixed(0)}%</span>
                    <span className="text-gray-500 text-xs">{new Date(session.created_at).toLocaleTimeString()}</span>
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
