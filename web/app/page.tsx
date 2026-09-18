'use client';
import { useState, useEffect, useRef } from 'react';
import {
  SparklesIcon,
  EyeIcon,
  BoltIcon,
  PuzzlePieceIcon,
  TrophyIcon,
  ClockIcon,
  UserCircleIcon,
  LockClosedIcon,
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

interface User {
  id: string;
  username: string;
  email: string;
  is_pro: boolean;
}

const GAMES = [
  { type: 'attention', name: 'Hawkeye', icon: EyeIcon, desc: 'Find the different color' },
  { type: 'memory', name: 'Target Tracker', icon: SparklesIcon, desc: 'Remember the sequence' },
  { type: 'speed', name: 'Speed Reaction', icon: BoltIcon, desc: 'Click when green' },
  { type: 'logic', name: 'Pattern Logic', icon: PuzzlePieceIcon, desc: 'Complete the pattern' },
];

// Game components
function HawkeyeGame({ onResult, difficulty }: { onResult: (r: GameResult) => void; difficulty: number }) {
  const [grid, setGrid] = useState<string[][]>([]);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    const size = 3 + difficulty;
    const newGrid: string[][] = Array(size).fill(null).map(() => Array(size).fill('#4F46E5'));
    const targetRow = Math.floor(Math.random() * size);
    const targetCol = Math.floor(Math.random() * size);
    newGrid[targetRow][targetCol] = '#06B6D4';
    setGrid(newGrid);
    startTimeRef.current = Date.now();
  }, [difficulty]);

  const handleClick = (row: number, col: number) => {
    if (grid[row][col] === '#06B6D4') {
      const elapsed = Date.now() - startTimeRef.current;
      onResult({ game_type: 'attention', score: Math.max(0, 1000 - elapsed / 10), accuracy: 100, response_time: elapsed, difficulty });
    } else {
      const newGrid = grid.map(r => [...r]);
      newGrid[row][col] = '#EF4444';
      setGrid(newGrid);
      const elapsed = Date.now() - startTimeRef.current;
      onResult({ game_type: 'attention', score: Math.max(0, 500 - elapsed / 20), accuracy: 50, response_time: elapsed, difficulty });
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${3 + difficulty}, minmax(0, 1fr))` }}>
        {grid.map((row, i) => row.map((color, j) => (
          <button key={`${i}-${j}`} onClick={() => handleClick(i, j)} className="w-12 h-12 rounded-lg transition-all hover:scale-105" style={{ backgroundColor: color }} />
        )))}
      </div>
      <p className="text-gray-400">Find the cyan cell!</p>
    </div>
  );
}

function TargetTrackerGame({ onResult, difficulty }: { onResult: (r: GameResult) => void; difficulty: number }) {
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSeq, setPlayerSeq] = useState<number[]>([]);
  const [showing, setShowing] = useState(false);
  const [grid, setGrid] = useState(Array(9).fill('#4F46E5'));

  useEffect(() => {
    const len = 2 + difficulty;
    const seq = Array(len).fill(0).map(() => Math.floor(Math.random() * 9));
    setSequence(seq);
    setTimeout(() => showSequence(seq), 500);
  }, [difficulty]);

  const showSequence = async (seq: number[]) => {
    setShowing(true);
    for (const idx of seq) {
      await new Promise(r => setTimeout(r, 600));
      const g = [...grid]; g[idx] = '#06B6D4'; setGrid(g);
      await new Promise(r => setTimeout(r, 400));
      g[idx] = '#4F46E5'; setGrid(g);
    }
    setShowing(false);
  };

  const handleClick = (idx: number) => {
    if (showing) return;
    const newSeq = [...playerSeq, idx];
    setPlayerSeq(newSeq);
    const g = [...grid]; g[idx] = '#06B6D4'; setGrid(g);
    setTimeout(() => { g[idx] = '#4F46E5'; setGrid(g); }, 200);
    if (newSeq[newSeq.length - 1] !== sequence[newSeq.length - 1]) {
      onResult({ game_type: 'memory', score: newSeq.length * 100, accuracy: 50, response_time: 1000, difficulty });
      return;
    }
    if (newSeq.length === sequence.length) {
      onResult({ game_type: 'memory', score: sequence.length * 150, accuracy: 100, response_time: 500, difficulty });
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="grid grid-cols-3 gap-2">
        {grid.map((color, i) => (
          <button key={i} onClick={() => handleClick(i)} disabled={showing} className="w-16 h-16 rounded-xl transition-all hover:scale-105 disabled:opacity-50" style={{ backgroundColor: color }} />
        ))}
      </div>
      <p className="text-gray-400">{showing ? 'Watch carefully...' : 'Repeat the pattern!'}</p>
    </div>
  );
}

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
    onResult({ game_type: 'speed', score: Math.max(0, 1000 - elapsed), accuracy, response_time: elapsed, difficulty });
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <button onClick={handleClick} disabled={clicked} className="w-48 h-48 rounded-3xl transition-all hover:scale-105 disabled:opacity-50" style={{ backgroundColor: color }} />
      <p className="text-gray-400">{clicked ? 'Done!' : color === '#EF4444' ? 'Wait for green...' : 'Click now!'}</p>
    </div>
  );
}

function PatternLogicGame({ onResult, difficulty }: { onResult: (r: GameResult) => void; difficulty: number }) {
  const [question, setQuestion] = useState<{ pattern: number[]; answer: number; options: number[] } | null>(null);
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    const start = Math.floor(Math.random() * 10) + 1;
    const step = Math.floor(Math.random() * 3) + 1;
    const pattern = Array(4).fill(0).map((_, i) => start + step * i);
    const answer = start + step * 4;
    const options = [answer - 2, answer - 1, answer, answer + 1].sort(() => Math.random() - 0.5);
    setQuestion({ pattern, answer, options });
    setSelected(null);
  }, [difficulty]);

  if (!question) return null;

  const handleClick = (val: number) => {
    setSelected(val);
    const correct = val === question.answer;
    setTimeout(() => {
      onResult({ game_type: 'logic', score: correct ? 200 : 50, accuracy: correct ? 100 : 50, response_time: 1000, difficulty });
      const start = Math.floor(Math.random() * 10) + 1;
      const step = Math.floor(Math.random() * 3) + 1;
      setQuestion({
        pattern: Array(4).fill(0).map((_, i) => start + step * i),
        answer: start + step * 4,
        options: [start + step * 4 - 2, start + step * 4 - 1, start + step * 4, start + step * 4 + 1].sort(() => Math.random() - 0.5),
      });
      setSelected(null);
    }, 500);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex gap-2 text-2xl font-mono">
        {question.pattern.map((n, i) => <span key={i} className="px-3 py-2 bg-slate-700 rounded-lg text-white">{n}</span>)}
        <span className="px-3 py-2 text-purple-400">?</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {question.options.map((opt) => (
          <button key={opt} onClick={() => handleClick(opt)} className={`px-6 py-3 rounded-xl text-xl font-bold transition-all hover:scale-105 ${selected === opt ? 'bg-purple-600' : 'bg-slate-700 hover:bg-slate-600'}`}>{opt}</button>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [result, setResult] = useState<GameResult | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [userId, setUserId] = useState('');
  const [dailyUsage, setDailyUsage] = useState(0);
  const [maxUsage] = useState(3);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedUserId = localStorage.getItem('user_id');
    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedUserId) setUserId(storedUserId);
  }, []);

  const playGame = async (gameResult: GameResult) => {
    try {
      if (userId) {
        await fetch('/api/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, ...gameResult }) });
      }
      setSessions(prev => [{ id: Date.now().toString(), user_id: userId, ...gameResult, created_at: new Date().toISOString() }, ...prev.slice(0, 9)]);
      setDailyUsage(prev => prev + 1);
      setResult(gameResult);
    } catch (e) { /* ignore */ }
  };

  const renderGame = () => {
    if (!activeGame) return null;
    const diff = 2;
    switch (activeGame) {
      case 'attention': return <HawkeyeGame onResult={playGame} difficulty={diff} />;
      case 'memory': return <TargetTrackerGame onResult={playGame} difficulty={diff} />;
      case 'speed': return <SpeedReactionGame onResult={playGame} difficulty={diff} />;
      case 'logic': return <PatternLogicGame onResult={playGame} difficulty={diff} />;
      default: return null;
    }
  };

  const scoreColor = (s: number) => s >= 80 ? 'text-green-400' : s >= 60 ? 'text-yellow-400' : 'text-red-400';
  const accColor = (a: number) => a >= 90 ? 'text-green-400' : a >= 70 ? 'text-yellow-400' : 'text-red-400';

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <SparklesIcon className="w-20 h-20 text-purple-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-white mb-4">AI Brain Trainer</h1>
          <p className="text-purple-200 mb-8">Sign in to start training</p>
          <button onClick={() => { setUser({ id: 'demo', username: 'Demo', email: 'demo@example.com', is_pro: false }); setUserId('demo'); localStorage.setItem('user', JSON.stringify({ id: 'demo', username: 'Demo', email: 'demo@example.com', is_pro: false })); }} className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold">
            Continue as Demo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <SparklesIcon className="w-8 h-8 text-purple-400" />
              AI Brain Trainer
            </h1>
            <p className="text-purple-200 mt-1">Cognitive Training Platform</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-gray-400 text-sm">Daily</div>
              <div className="text-white text-2xl font-bold">{dailyUsage}/{maxUsage}</div>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 rounded-xl">
              <UserCircleIcon className="w-5 h-5 text-purple-400" />
              <span className="text-white text-sm">{user.username}</span>
              {user.is_pro && <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">PRO</span>}
            </div>
          </div>
        </div>

        {!activeGame ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {GAMES.map((game) => {
                const Icon = game.icon;
                const colors: Record<string, string> = { attention: 'from-blue-500 to-cyan-500', memory: 'from-purple-500 to-pink-500', speed: 'from-yellow-500 to-orange-500', logic: 'from-green-500 to-emerald-500' };
                return (
                  <button key={game.type} onClick={() => setActiveGame(game.type)} className="bg-slate-800/50 backdrop-blur rounded-2xl p-4 border border-purple-500/20 hover:border-purple-500/50 transition-all text-left group">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[game.type]} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text白色" />
                    </div>
                    <div className="text-white font-semibold">{game.name}</div>
                    <div className="text-gray-400 text-sm">{game.desc}</div>
                  </button>
                );
              })}
            </div>

            {sessions.length > 0 && (
              <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-purple-500/20">
                <h2 className="text-white font-semibold text-xl mb-4 flex items-center gap-2"><ClockIcon className="w-6 h-6 text-purple-400" /> Recent Sessions</h2>
                <div className="space-y-2">
                  {sessions.map((s) => (
                    <div key={s.id} className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg">
                      <div><span className="text-white font-medium">{s.game_type}</span><span className="text-gray-400 text-sm ml-2">Lvl {s.difficulty}</span></div>
                      <div className="flex items-center gap-4">
                        <span className={`font-semibold ${scoreColor(s.score)}`}>{s.score}</span>
                        <span className={`text-sm ${accColor(s.accuracy)}`}>{s.accuracy.toFixed(0)}%</span>
                        <span className="text-gray-500 text-xs">{new Date(s.created_at).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-8 border border-purple-500/20">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-white font-semibold text-2xl">{GAMES.find(g => g.type === activeGame)?.name}</h2>
              <button onClick={() => { setActiveGame(null); setResult(null); }} className="text-gray-400 hover:text-white">✕</button>
            </div>
            {renderGame()}
            {result && (
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="bg-slate-900/50 rounded-xl p-4"><div className="text-gray-400 text-sm">Score</div><div className={`text-3xl font-bold ${scoreColor(result.score)}`}>{result.score}</div></div>
                <div className="bg-slate-900/50 rounded-xl p-4"><div className="text-gray-400 text-sm">Accuracy</div><div className={`text-3xl font-bold ${accColor(result.accuracy)}`}>{result.accuracy.toFixed(1)}%</div></div>
                <div className="bg-slate-900/50 rounded-xl p-4"><div className="text-gray-400 text-sm">Time</div><div className="text-3xl font-bold text-white">{result.response_time.toFixed(0)}ms</div></div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
