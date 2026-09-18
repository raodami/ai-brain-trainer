'use client';
import { useEffect, useState } from 'react';
import {
  SparklesIcon,
  UserCircleIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

interface User {
  id: string;
  username: string;
  email: string;
  is_pro: boolean;
}

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  dailyUsage: number;
  maxUsage: number;
}

export default function Navbar({ user, onLogout, dailyUsage, maxUsage }: NavbarProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-purple-500/10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SparklesIcon className="w-8 h-8 text-purple-400" />
          <span className="text-white font-bold text-xl">AI Brain Trainer</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-xl">
            <span className="text-gray-400 text-sm">Daily:</span>
            <span className="text-white font-semibold">{dailyUsage}/{maxUsage}</span>
            <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                style={{ width: `${(dailyUsage / maxUsage) * 100}%` }}
              />
            </div>
          </div>

          {user && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 rounded-xl hover:bg-slate-700/50 transition-colors"
              >
                <UserCircleIcon className="w-5 h-5 text-purple-400" />
                <span className="text-white text-sm hidden sm:block">{user.username}</span>
                {user.is_pro && (
                  <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">PRO</span>
                )}
                <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${showMenu ? 'rotate-180' : ''}`} />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-purple-500/20 rounded-xl shadow-xl overflow-hidden">
                  <div className="p-3 border-b border-purple-500/10">
                    <div className="text-white font-medium">{user.username}</div>
                    <div className="text-gray-400 text-sm">{user.email}</div>
                  </div>
                  <button
                    onClick={() => { onLogout(); setShowMenu(false); }}
                    className="w-full text-left px-3 py-2 text-red-400 hover:bg-slate-700/50 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
