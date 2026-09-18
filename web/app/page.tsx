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
  StarIcon,
  FireIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

interface GameResult {
  game_type: string;
  score: number;
  accuracy: number;
  response_time: number;
  difficulty: number;
  adaptive_level: number;
}

interface Session {
  id: string;
  user_id: string;
  game_type: string;
  score: number;
  accuracy: number;
  response_time: number;
  difficulty: number;
  created_at: string;
}

interface UserStats {
  user_id: string;
  total_games: number;
  total_sessions: number;
  average_score: number;
  avg_accuracy: number;
  avg_response_time: number;
  current_streak: number;
  best_streak: number;
  level: number;
  xp: number;
}

interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  unlocked_at: string;
}

interface LeaderboardEntry {
  user_id: string;
  username: string;
  avatar: string;
  score: number;
  level: number;
  rank: number;
}

const GAMES = [
  { type: 'attention', name: 'Hawkeye', icon: EyeIcon, desc: 'Visual search & focus', color: 'from-blue-500 to-cyan-500' },
  { type: 'memory', name: 'Target Tracker', icon: SparklesIcon, desc: 'Working memory & tracking', color: 'from-purple-500 to-pink-500' },
  { type: 'speed', name: 'Speed Reaction', icon: BoltIcon, desc: 'Processing speed & reflexes', color: 'from-yellow-500 to-orange-500' },
  { type: 'logic', name: 'Pattern Logic', icon: PuzzlePieceIcon, desc: 'Logic & pattern recognition', color: 'from-green-500 to-emerald-500' },
];

// Game components
function HawkeyeGame({ onResult, difficulty }: { onResult: (r: GameResult) => void; difficulty: number }) {
  const [grid, setGrid] = useState<string[][]>([]);
  const [targetPos, setTargetPos] = useState({ row: 0, col: 0 });
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    const size = 3 + difficulty;
    const newGrid: string[][] = Array(size).fill(null).map(() => Array(size).fill('#4F46E5'));
    const targetRow = Math.floor(Math.random() * size);
    const targetCol = Math.floor(Math.random() * size);
    newGrid[targetRow][targetCol] = '#06B6D4';
    setGrid(newGrid);
    setTargetPos({ row: targetRow, col: targetCol });
    startTimeRef.current = Date.now();
  }, [difficulty]);

  const handleClick = (row: number, col: number) => {
    const elapsed = Date.now() - startTimeRef.current;
    const isCorrect = row === targetPos.row && col === targetPos.col;
    const accuracy = isCorrect ? 100 : 50;
    const score = isCorrect ? Math.max(0, 1000 - elapsed / 10) : 0;
    onResult({ game_type: 'attention', score: Math.floor(score), accuracy, response_time: elapsed, difficulty, adaptive_level: difficulty });
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${3 + difficulty}, minmax(0, 1fr))` }}>
        {grid.map((row, i) => row.map((color, j) => (
          <button key={`${i}-${j}`} onClick={() => handleClick(i, j)} className="w-12 h-12 rounded-lg transition-all hover:scale-105 active:scale-95" style={{ backgroundColor: color }} />
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
    setPlayerSeq([]);
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
      const elapsed = 1000;
      onResult({ game_type: 'memory', score: newSeq.length * 100, accuracy: 50, response_time: elapsed, difficulty, adaptive_level: difficulty });
      return;
    }
    if (newSeq.length === sequence.length) {
      const elapsed = 1000;
      onResult({ game_type: 'memory', score: sequence.length * 150, accuracy: 100, response_time: elapsed, difficulty, adaptive_level: difficulty });
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
    onResult({ game_type: 'speed', score: Math.max(0, 1000 - elapsed), accuracy, response_time: elapsed, difficulty, adaptive_level: difficulty });
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <button onClick={handleClick} disabled={clicked} className="w-48 h-48 rounded-3xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50" style={{ backgroundColor: color }} />
      <p className="text-gray-400">{clicked ? 'Done!' : color === '#EF4444' ? 'Wait for green...' : 'Click now!'}</p>
    </div>
  );
}

function PatternLogicGame({ onResult, difficulty }: { onResult: (r: GameResult) => void; difficulty: number }) {
  const [question, setQuestion] = useState<{ pattern: number[]; answer: number; options: number[] } | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    const start = Math.floor(Math.random() * 10) + 1;
    const step = Math.floor(Math.random() * 3) + 1;
    const pattern = Array(4).fill(0).map((_, i) => start + step * i);
    const answer = start + step * 4;
    const options = [answer - 2, answer - 1, answer, answer + 1].sort(() => Math.random() - 0.5);
    setQuestion({ pattern, answer, options });
    setSelected(null);
    startTimeRef.current = Date.now();
  }, [difficulty]);

  if (!question) return null;

  const handleClick = (val: number) => {
    if (selected !== null) return;
    setSelected(val);
    const elapsed = Date.now() - startTimeRef.current;
    const correct = val === question.answer;
    const accuracy = correct ? 100 : 50;
    const score = correct ? 200 : 50;
    
    setTimeout(() => {
      onResult({ game_type: 'logic', score, accuracy, response_time: elapsed, difficulty, adaptive_level: difficulty });
      const newStart = Math.floor(Math.random() * 10) + 1;
      const newStep = Math.floor(Math.random() * 3) + 1;
      setQuestion({
        pattern: Array(4).fill(0).map((_, i) => newStart + newStep * i),
        answer: newStart + newStep * 4,
        options: [newStart + newStep * 4 - 2, newStart + newStep * 4 - 1, newStart + newStep * 4, newStart + newStep * 4 + 1].sort(() => Math.random() - 0.5),
      });
      setSelected(null);
    }, 800);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex gap-2 text-2xl font-mono">
        {question.pattern.map((n, i) => <span key={i} className="px-3 py-2 bg-slate-700 rounded-lg text-white">{n}</span>)}
        <span className="px-3 py-2 text-purple-400 font-bold">?</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {question.options.map((opt) => (
          <button key={opt} onClick={() => handleClick(opt)} disabled={selected !== null} className={`px-6 py-3 rounded-xl text-xl font-bold transition-all hover:scale-105 disabled:opacity-50 ${selected === opt ? 'bg-purple-600' : 'bg-slate-700 hover:bg-slate-600'}`}>{opt}</button>
        ))}
      </div>
      <p className="text-gray-400">What comes next?</p>
    </div>
  );
}

// Stats Panel Component
function StatsPanel({ stats, onLogout }: { stats: UserStats | null; onLogout: () => void }) {
  if (!stats) return null;

  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-purple-500/20">
      <h2 className="text-white font-semibold text-xl mb-4 flex items-center gap-2">
        <ChartBarIcon className="w-6 h-6 text-purple-400" />
        Your Progress
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 rounded-xl p-4">
          <div className="text-gray-400 text-sm">Level</div>
          <div className="text-3xl font-bold text-purple-400">{stats.level}</div>
          <div className="text-xs text-gray-500 mt-1">{stats.xp} XP</div>
        </div>
        <div className="bg-slate-900/50 rounded-xl p-4">
          <div className="text-gray-400 text-sm">Games Played</div>
          <div className="text-3xl font-bold text-white">{stats.total_sessions}</div>
        </div>
        <div className="bg-slate-900/50 rounded-xl p-4">
          <div className="text-gray-400 text-sm">Avg Score</div>
          <div className="text-3xl font-bold text-yellow-400">{stats.average_score.toFixed(0)}</div>
        </div>
        <div className="bg-slate-900/50 rounded-xl p-4">
          <div className="text-gray-400 text-sm">Streak</div>
          <div className="text-3xl font-bold text-orange-400">{stats.current_streak}🔥</div>
          <div className="text-xs text-gray-500">Best: {stats.best_streak}</div>
        </div>
      </div>
    </div>
  );
}

// Leaderboard Component
function Leaderboard({ entries }: { entries: LeaderboardEntry[] }) {
  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-purple-500/20">
      <h2 className="text-white font-semibold text-xl mb-4 flex items-center gap-2">
        <TrophyIcon className="w-6 h-6 text-yellow-400" />
        Leaderboard
      </h2>
      <div className="space-y-2">
        {entries.slice(0, 5).map((entry) => (
          <div key={entry.user_id} className="flex items-center gap-4 p-3 bg-slate-900/50 rounded-xl">
            <span className="text-yellow-400 font-bold w-8">{entry.rank}</span>
            <span className="text-2xl">{entry.avatar}</span>
            <div className="flex-1">
              <div className="text-white font-medium">{entry.username}</div>
              <div className="text-gray-400 text-sm">Level {entry.level}</div>
            </div>
            <span className="text-purple-400 font-bold">{entry.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Achievements Component
function Achievements({ achievements, allAchievements }: { achievements: Achievement[]; allAchievements: any[] }) {
  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-purple-500/20">
      <h2 className="text-white font-semibold text-xl mb-4 flex items-center gap-2">
        <StarIcon className="w-6 h-6 text-purple-400" />
        Achievements
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {allAchievements.map((ach) => {
          const unlocked = achievements.some(a => a.code === ach.code);
          return (
            <div key={ach.code} className={`p-3 rounded-xl border ${unlocked ? 'border-purple-500/50 bg-purple-500/10' : 'border-slate-700 bg-slate-900/30 opacity-50'}`}>
              <div className="text-2xl mb-1">{unlocked ? '🏆' : '🔒'}</div>
              <div className="text-white text-sm font-medium">{ach.name}</div>
              <div className="text-gray-400 text-xs">{ach.description}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Home() {
  const [user, setUser] = useState<{ id: string; username: string; email: string; is_pro: boolean } | null>(null);
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [result, setResult] = useState<GameResult | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [dailyUsage] = useState(0);
  const [maxUsage] = useState(10);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
    loadStats();
    loadLeaderboard();
    loadAchievements();
  }, []);

  const loadStats = async () => {
    try {
      const res = await fetch('/api/stats/overview');
      const data = await res.json();
      setStats(data);
    } catch (e) { /* ignore */ }
  };

  const loadLeaderboard = async () => {
    try {
      const res = await fetch('/api/leaderboard?limit=10');
      const data = await res.json();
      setLeaderboard(data);
    } catch (e) { /* ignore */ }
  };

  const loadAchievements = async () => {
    try {
      const res = await fetch('/api/achievements');
      const data = await res.json();
      setAchievements(data);
    } catch (e) { /* ignore */ }
  };

  const playGame = async (gameResult: GameResult) => {
    try {
      const res = await fetch('/api/game/play', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game_type: gameResult.game_type, difficulty: gameResult.difficulty }),
      });
      const result = await res.json();
      setResult(result);
      loadStats();
    } catch (e) { /* ignore */ }
  };

  const renderGame = () => {
    if (!activeGame) return null;
    const diff = Math.min(4, Math.floor(dailyUsage / 3));
    switch (activeGame) {
      case 'attention': return <HawkeyeGame onResult={playGame} difficulty={diff} />;
      case 'memory': return <TargetTrackerGame onResult={playGame} difficulty={diff} />;
      case 'speed': return <SpeedReactionGame onResult={playGame} difficulty={diff} />;
      case 'logic': return <PatternLogicGame onResult={playGame} difficulty={diff} />;
      default: return null;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <SparklesIcon className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">AI Brain Trainer</h1>
          <p className="text-purple-200 mb-8 max-w-md">Train your cognitive skills with scientifically designed games. Improve attention, memory, speed, and logic.</p>
          <button onClick={() => { const u = { id: 'demo', username: 'Demo User', email: 'demo@example.com', is_pro: false }; setUser(u); localStorage.setItem('user', JSON.stringify(u)); }} className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-2xl font-semibold text-lg transition-all hover:scale-105">
            Start Training Free
          </button>
          <p className="text-gray-500 text-sm mt-4">No account required • 3 free sessions daily</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <SparklesIcon className="w-7 h-7 text-purple-400" />
              AI Brain Trainer
            </h1>
            <p className="text-purple-200 text-sm mt-1">Cognitive Training Platform</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-gray-400 text-xs">Daily</div>
              <div className="text-white text-xl font-bold">{dailyUsage}/{maxUsage}</div>
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
            {/* Game Selection */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {GAMES.map((game) => {
                const Icon = game.icon;
                return (
                  <button key={game.type} onClick={() => setActiveGame(game.type)} className="bg-slate-800/50 backdrop-blur rounded-2xl p-4 border border-purple-500/20 hover:border-purple-500/50 transition-all text-left group">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${game.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-white font-semibold">{game.name}</div>
                    <div className="text-gray-400 text-sm">{game.desc}</div>
                  </button>
                );
              })}
            </div>

            {/* Stats */}
            <StatsPanel stats={stats} onLogout={() => { setUser(null); localStorage.removeItem('user'); }} />

            {/* Recent Sessions */}
            {sessions.length > 0 && (
              <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-purple-500/20 mt-6">
                <h2 className="text-white font-semibold text-xl mb-4 flex items-center gap-2">
                  <ClockIcon className="w-6 h-6 text-purple-400" />
                  Recent Sessions
                </h2>
                <div className="space-y-2">
                  {sessions.slice(0, 5).map((s) => (
                    <div key={s.id} className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg">
                      <div><span className="text-white font-medium capitalize">{s.game_type}</span><span className="text-gray-400 text-sm ml-2">Lvl {s.difficulty}</span></div>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold text-yellow-400">{s.score}</span>
                        <span className="text-gray-500 text-xs">{new Date(s.created_at).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Leaderboard & Achievements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <Leaderboard entries={leaderboard} />
              <Achievements achievements={achievements} allAchievements={[
                { code: 'first_game', name: 'First Step', description: 'Play your first game', emoji: '🎯' },
                { code: 'five_games', name: 'Getting Serious', description: 'Play 5 games', emoji: '🎮' },
                { code: 'hundred_score', name: 'Centurion', description: 'Score 100+ in a game', emoji: '💯' },
                { code: 'perfect_score', name: 'Perfect!', description: 'Score 100% accuracy', emoji: '⭐' },
              ]} />
            </div>
          </>
        ) : (
          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-8 border border-purple-500/20">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-white font-semibold text-2xl">{GAMES.find(g => g.type === activeGame)?.name}</h2>
              <button onClick={() => { setActiveGame(null); setResult(null); }} className="text-gray-400 hover:text-white text-xl">✕</button>
            </div>
            {renderGame()}
            {result && (
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="bg-slate-900/50 rounded-xl p-4 text-center">
                  <div className="text-gray-400 text-sm">Score</div>
                  <div className="text-3xl font-bold text-yellow-400">{result.score}</div>
                </div>
                <div className="bg-slate-900/50 rounded-xl p-4 text-center">
                  <div className="text-gray-400 text-sm">Accuracy</div>
                  <div className="text-3xl font-bold text-green-400">{result.accuracy.toFixed(1)}%</div>
                </div>
                <div className="bg-slate-900/50 rounded-xl p-4 text-center">
                  <div className="text-gray-400 text-sm">Time</div>
                  <div className="text-3xl font-bold text-white">{result.response_time}ms</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
