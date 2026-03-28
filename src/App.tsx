/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Grid2X2, 
  History, 
  Settings, 
  Search, 
  Bell, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Target, 
  BarChart3,
  Settings2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
interface GameState {
  winningNumber: number | null;
  maxRange: number;
  dailyLimit: number;
  selections: Record<string, number[]>;
  history: HistoryItem[];
}

interface HistoryItem {
  userId: string;
  number: number;
  timestamp: number;
  won: boolean;
}

type View = 'GRID' | 'HISTORY' | 'SETTINGS';

// --- Constants ---
const getUserId = () => {
  const saved = localStorage.getItem('monolith_user_id');
  if (saved) return saved;
  const newId = 'user_' + Math.random().toString(36).substr(2, 9);
  localStorage.setItem('monolith_user_id', newId);
  return newId;
};
const USER_ID = getUserId();
const ADMIN_EMAIL = 'kuramayoko80@gmail.com'; // From .env context

export default function App() {
  const [view, setView] = useState<View>('GRID');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showResult, setShowResult] = useState<'WIN' | 'LOSS' | null>(null);

  // --- Helper to persist state ---
  const saveState = (newState: GameState) => {
    setGameState(newState);
    localStorage.setItem('monolith_game_state', JSON.stringify(newState));
  };

  // --- Initial State Loading ---
  useEffect(() => {
    // 1. Load from localStorage
    const loadInitialState = () => {
      const saved = localStorage.getItem('monolith_game_state');
      if (saved) {
        try {
          const data = JSON.parse(saved);
          setGameState(data);
        } catch (e) {
          console.error('Failed to parse saved state:', e);
          initializeDefaultState();
        }
      } else {
        initializeDefaultState();
      }
    };

    const initializeDefaultState = () => {
      const defaultState: GameState = {
        winningNumber: 777, // Default winning number
        maxRange: 1000,
        dailyLimit: 50,
        selections: {},
        history: []
      };
      saveState(defaultState);
    };

    loadInitialState();

    // 1.5 Simulate loading progress
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // --- Actions ---
  const handleSelect = (num: number) => {
    const userSelections = gameState?.selections[USER_ID] || [];
    const hasWon = userSelections.includes(gameState?.winningNumber || -1);
    if (hasWon || userSelections.includes(num)) return;
    setSelectedNumber(num);
  };

  const confirmSelection = () => {
    if (selectedNumber === null || !gameState) return;

    const userSelections = [...(gameState.selections[USER_ID] || [])];
    if (userSelections.includes(selectedNumber)) return;

    userSelections.push(selectedNumber);
    const won = selectedNumber === gameState.winningNumber;

    const newHistoryItem: HistoryItem = {
      userId: USER_ID,
      number: selectedNumber,
      timestamp: Date.now(),
      won
    };

    const newState: GameState = {
      ...gameState,
      selections: {
        ...gameState.selections,
        [USER_ID]: userSelections
      },
      history: [newHistoryItem, ...gameState.history]
    };

    saveState(newState);
    setShowResult(won ? 'WIN' : 'LOSS');
  };

  const setWinningNumber = (num: number) => {
    if (!gameState) return;
    saveState({ ...gameState, winningNumber: num });
  };

  const setRange = (range: number) => {
    if (!gameState) return;
    saveState({ ...gameState, maxRange: range });
  };

  const resetHistory = () => {
    if (!gameState) return;
    saveState({
      ...gameState,
      history: [],
      selections: {}
    });
    setShowResult(null);
    setSelectedNumber(null);
  };

  // --- Render Helpers ---
  if (!isStarted) {
    return (
      <div className="min-h-screen bg-[#0f1923] flex flex-col items-center justify-center p-8 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xs space-y-12"
        >
          <div className="space-y-4">
            <h1 className="font-headline text-4xl tracking-[0.3em] uppercase font-black text-primary">
              MONOLITH
            </h1>
            <div className="h-[1px] w-12 bg-primary/30 mx-auto" />
          </div>

          {loadingProgress < 100 || !gameState ? (
            <div className="space-y-6">
              <div className="relative h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  className="absolute top-0 left-0 h-full bg-primary shadow-[0_0_15px_rgba(133,173,255,0.5)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${loadingProgress}%` }}
                />
              </div>
              <p className="font-label text-[10px] uppercase tracking-[0.4em] text-[#a3aac4] animate-pulse">
                {gameState ? 'Sincronização Completa' : 'Sincronizando Núcleo...'} {loadingProgress}%
              </p>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              <p className="font-label text-[10px] uppercase tracking-[0.4em] text-[#6bff8f] font-bold">
                Sistema Pronto
              </p>
              <button 
                onClick={() => setIsStarted(true)}
                className="w-full py-5 bg-primary text-[#002c65] font-headline font-black uppercase tracking-[0.2em] text-sm rounded-2xl active:scale-95 transition-all shadow-2xl shadow-primary/20"
              >
                Iniciar Interface
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* Background Texture */}
        <div 
          className="fixed inset-0 pointer-events-none opacity-[0.02] z-[-1]"
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBJYpBHJPSD1hGXpJGetzrIyAgBRAqixCg2MsfXtlKV0qRb5XLodAsfERZMCG3HyLRaW4LBM4Yf1xs2hRpimC99aoo6QqzdnwIeNTq214D14_v-LlEc1Y2zFzeXuBb1Olh-TD1CP9L0LSSHH0dEm5f86P-gD_k03syLg4jRJ7NylTI-vFCWUlB7WPzVcIRvKnKyI7a32YzpqIUPXvtuhMoQuvJrf__mYN4qxb3xnPwwbQKcbtHJE9Qr8qa9hfg8bg2ekd3l6xakl_Y')" }}
        />
      </div>
    );
  }

  const hasWon = (gameState!.selections[USER_ID] || []).includes(gameState!.winningNumber || -1);
  const userSelections = gameState!.selections[USER_ID] || [];
  const lastUserSelection = userSelections.length > 0 ? userSelections[userSelections.length - 1] : null;

  return (
    <div className="min-h-screen bg-[#0f1923] text-white font-sans selection:bg-primary/30 pb-safe">
      {/* Top Bar - Mobile Optimized */}
      <header className="fixed top-0 w-full z-50 flex items-center justify-center px-6 h-16 bg-[#0f1923]/80 backdrop-blur-md border-b border-white/5 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <h1 className="font-headline text-xl tracking-[0.2em] uppercase font-black text-primary">
            MONOLITH
          </h1>
        </div>
      </header>

      <main className="pt-20 pb-32 px-4 max-w-md mx-auto w-full">
        <AnimatePresence mode="wait">
          {showResult ? (
            <ResultView 
              type={showResult} 
              number={lastUserSelection || 0} 
              onBack={() => { setShowResult(null); setView('GRID'); setSelectedNumber(null); }} 
            />
          ) : view === 'GRID' ? (
            <GridView 
              gameState={gameState}
              selectedNumber={selectedNumber}
              onSelect={handleSelect}
              onConfirm={confirmSelection}
              hasWon={hasWon}
              userSelections={userSelections}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          ) : view === 'HISTORY' ? (
            <HistoryView history={gameState.history} />
          ) : (
            <SettingsView 
              gameState={gameState}
              onSetWinningNumber={setWinningNumber}
              onSetRange={setRange}
              onReset={resetHistory}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Nav - Primary Navigation */}
      <nav className="fixed bottom-0 w-full z-50 flex justify-around items-center px-4 pb-8 pt-3 bg-[#0f1930]/90 backdrop-blur-2xl border-t border-white/5 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <NavButton active={view === 'GRID'} onClick={() => setView('GRID')} icon={<Grid2X2 size={24} />} label="Grade" />
        <NavButton active={view === 'HISTORY'} onClick={() => setView('HISTORY')} icon={<History size={24} />} label="Histórico" />
        <NavButton active={view === 'SETTINGS'} onClick={() => setView('SETTINGS')} icon={<Settings size={24} />} label="Ajustes" />
      </nav>

      {/* Background Texture */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-[-1]"
        style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBJYpBHJPSD1hGXpJGetzrIyAgBRAqixCg2MsfXtlKV0qRb5XLodAsfERZMCG3HyLRaW4LBM4Yf1xs2hRpimC99aoo6QqzdnwIeNTq214D14_v-LlEc1Y2zFzeXuBb1Olh-TD1CP9L0LSSHH0dEm5f86P-gD_k03syLg4jRJ7NylTI-vFCWUlB7WPzVcIRvKnKyI7a32YzpqIUPXvtuhMoQuvJrf__mYN4qxb3xnPwwbQKcbtHJE9Qr8qa9hfg8bg2ekd3l6xakl_Y')" }}
      />
    </div>
  );
}

// --- Sub-Components ---

function GridView({ gameState, selectedNumber, onSelect, onConfirm, hasWon, userSelections, searchQuery, setSearchQuery }: any) {
  const numbers = useMemo(() => {
    return Array.from({ length: gameState.maxRange }, (_, i) => i + 1)
      .filter(n => searchQuery ? n.toString().includes(searchQuery) : true);
  }, [gameState.maxRange, searchQuery]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center"
    >
      <section className="mb-8 text-center">
        <h2 className="font-headline text-3xl font-black tracking-tight mb-2">
          Escolha um número
        </h2>
        <p className="font-label text-[#a3aac4] tracking-[0.2em] uppercase text-[10px] opacity-70">
          Sua escolha é definitiva
        </p>
      </section>

      <section className="mb-8 w-full">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#40485d] group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="BUSCAR NÚMERO (1-1000)"
            className="w-full bg-[#1a242d] border border-white/5 text-white placeholder:text-[#40485d] font-label text-xs tracking-widest py-4 pl-12 pr-4 rounded-2xl focus:ring-2 focus:ring-primary/30 transition-all outline-none"
          />
        </div>
      </section>

      <div className="bg-[#1a242d] rounded-3xl p-1 shadow-2xl overflow-hidden w-full border border-white/5">
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-1 max-h-[40vh] overflow-y-auto p-2 hide-scrollbar">
          {numbers.map((num) => {
            const isTried = userSelections.includes(num);
            const isWinning = isTried && num === gameState.winningNumber;
            const isSelected = selectedNumber === num;
            
            return (
              <button
                key={num}
                disabled={hasWon || isTried}
                onClick={() => onSelect(num)}
                className={`aspect-square flex items-center justify-center font-label text-sm transition-all duration-200 rounded-xl
                  ${isSelected ? 'bg-primary text-white shadow-[0_0_20px_rgba(133,173,255,0.4)] z-10 scale-105' : 
                    isWinning ? 'bg-green-500 text-white' :
                    isTried ? 'bg-red-500/10 text-red-500/30 cursor-not-allowed border border-red-500/20' : 
                    'bg-[#232e38] text-[#a3aac4] active:bg-primary/40'}
                  ${(hasWon || isTried) ? '' : 'active:scale-95'}
                `}
              >
                {num}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-12 flex flex-col items-center w-full">
        <motion.div 
          key={selectedNumber}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-[#091328] border border-white/10 p-6 rounded-[2.5rem] flex flex-col items-center justify-center w-48 h-48 shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
        >
          <span className="font-label text-[9px] uppercase tracking-[0.4em] text-[#40485d] mb-2">Seleção</span>
          <span className="font-headline text-6xl font-black text-primary tracking-tighter">
            {(selectedNumber || (userSelections.length > 0 ? userSelections[userSelections.length - 1] : 0)).toString().padStart(2, '0')}
          </span>
        </motion.div>
        
        {!hasWon && (
          <button 
            disabled={selectedNumber === null}
            onClick={onConfirm}
            className="mt-10 w-full py-5 bg-primary text-[#002c65] font-headline font-black uppercase tracking-[0.2em] text-sm rounded-2xl hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-primary/20 disabled:opacity-30 disabled:grayscale"
          >
            Confirmar Escolha
          </button>
        )}
      </div>
    </motion.div>
  );
}

function HistoryView({ history }: { history: HistoryItem[] }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="space-y-6"
    >
      <div className="mb-8">
        <p className="text-[10px] uppercase tracking-[0.4em] text-primary font-bold mb-1">Ledger</p>
        <h2 className="text-3xl font-black tracking-tight">Histórico</h2>
      </div>

      <div className="space-y-3">
        {history.length === 0 ? (
          <div className="text-center py-20 text-[#a3aac4] text-sm italic opacity-50">Nenhuma atividade registrada.</div>
        ) : (
          history.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-[#1a242d] rounded-2xl border border-white/5 shadow-sm">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.won ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                  {item.won ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                </div>
                <div>
                  <div className="font-bold text-sm tracking-tight">Número {item.number}</div>
                  <div className="text-[10px] text-[#a3aac4] uppercase tracking-widest">{item.userId === USER_ID ? 'Você' : 'Anônimo'}</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-xs font-black ${item.won ? 'text-green-500' : 'text-red-500'}`}>
                  {item.won ? 'VENCEU' : 'ERROU'}
                </div>
                <div className="text-[9px] text-[#a3aac4] uppercase tracking-widest mt-1">
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}

function SettingsView({ gameState, onSetWinningNumber, onSetRange, onReset }: any) {
  const [winInput, setWinInput] = useState('');
  const [rangeInput, setRangeInput] = useState(gameState.maxRange.toString());

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="space-y-8"
    >
      <div className="mb-8">
        <p className="text-[10px] uppercase tracking-[0.4em] text-primary font-bold mb-1">Admin</p>
        <h2 className="text-3xl font-black tracking-tight">Ajustes</h2>
      </div>

      <div className="space-y-4">
        <div className="p-6 bg-[#1a242d] rounded-3xl border border-white/5 space-y-4">
          <div className="flex items-center gap-3">
            <BarChart3 className="text-primary" size={20} />
            <h3 className="text-sm font-bold uppercase tracking-wider">Limite da Grade</h3>
          </div>
          <div className="flex gap-2">
            <input 
              type="number"
              inputMode="numeric"
              value={rangeInput}
              onChange={(e) => setRangeInput(e.target.value)}
              className="flex-1 bg-[#232e38] border border-white/5 rounded-xl p-4 text-xl font-black text-primary outline-none"
            />
            <button 
              onClick={() => {
                const val = parseInt(rangeInput);
                if (!isNaN(val)) onSetRange(val);
              }}
              className="bg-white/5 px-6 rounded-xl font-bold uppercase tracking-wider text-[10px] active:bg-white/10"
            >
              Set
            </button>
          </div>
        </div>

        <div className="p-6 bg-[#1a242d] rounded-3xl border border-white/5 space-y-4">
          <div className="flex items-center gap-3">
            <Target className="text-primary" size={20} />
            <h3 className="text-sm font-bold uppercase tracking-wider">Número Vencedor</h3>
          </div>
          <div className="flex gap-2">
            <input 
              type="number"
              inputMode="numeric"
              value={winInput}
              onChange={(e) => setWinInput(e.target.value)}
              placeholder="0000"
              className="flex-1 bg-[#232e38] border border-white/5 rounded-xl p-4 text-xl font-black text-primary outline-none"
            />
            <button 
              onClick={() => { onSetWinningNumber(parseInt(winInput)); setWinInput(''); }}
              className="bg-primary text-[#002c65] px-6 rounded-xl font-bold uppercase tracking-wider text-[10px] active:scale-95 transition-transform"
            >
              Apply
            </button>
          </div>
        </div>

        <div className="p-6 bg-[#091328] rounded-3xl border border-white/5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Settings2 className="text-[#6bff8f]" size={20} />
              <h3 className="text-sm font-bold uppercase tracking-wider">Status</h3>
            </div>
            <div className="px-3 py-1 bg-green-500/10 rounded-full">
              <span className="text-[10px] font-black text-[#6bff8f] uppercase tracking-widest">Ativo</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center text-[10px] uppercase tracking-widest font-bold">
            <span className="text-[#a3aac4]">Vencedor Atual</span>
            <span className="text-[#6bff8f] font-mono text-sm">{gameState.winningNumber || '---'}</span>
          </div>
        </div>

        <button 
          onClick={onReset}
          className="w-full flex items-center justify-center gap-3 p-5 bg-red-500/5 text-red-500 font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl border border-red-500/10 active:bg-red-500/10"
        >
          <Trash2 size={16} />
          Resetar Sistema
        </button>
      </div>
    </motion.div>
  );
}

function ResultView({ type, number, onBack }: { type: 'WIN' | 'LOSS', number: number, onBack: () => void }) {
  const isWin = type === 'WIN';
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-[#0f1923] flex flex-col items-center justify-center text-center p-6"
    >
      <motion.div 
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15 }}
        className={`w-40 h-40 rounded-full bg-black flex items-center justify-center border border-white/10 mb-10
          ${isWin ? 'shadow-[0_0_100px_rgba(107,255,143,0.2)]' : 'shadow-[0_0_100px_rgba(255,113,108,0.2)]'}
        `}
      >
        {isWin ? (
          <CheckCircle2 size={80} className="text-[#6bff8f]" />
        ) : (
          <XCircle size={80} className="text-[#ff716c]" />
        )}
      </motion.div>

      <div className="space-y-4 mb-12 max-w-xs">
        <span className="text-[10px] uppercase tracking-[0.5em] text-primary font-black">
          {isWin ? 'VITÓRIA CONFIRMADA' : 'TENTE NOVAMENTE'}
        </span>
        <h2 className="text-3xl font-black tracking-tight leading-tight">
          {isWin ? (
            <>O número <span className="text-primary">{number.toString().padStart(2, '0')}</span> é o vencedor!</>
          ) : (
            <>O número <span className="text-primary">{number.toString().padStart(2, '0')}</span> não foi sorteado.</>
          )}
        </h2>
        <p className="text-xs text-[#a3aac4] leading-relaxed opacity-70">
          {isWin ? 'Você decifrou o código do Monolith.' : 'A sequência matemática não correspondeu à sua entrada.'}
        </p>
      </div>

      <button 
        onClick={onBack}
        className="w-full max-w-xs py-5 bg-primary text-[#002c65] font-headline font-black uppercase tracking-[0.2em] text-sm rounded-2xl active:scale-95 transition-all shadow-2xl shadow-primary/20"
      >
        Voltar para a Grade
      </button>
    </motion.div>
  );
}

function NavButton({ active, onClick, icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center transition-all duration-300 px-6 py-2 rounded-2xl
        ${active ? 'text-primary bg-primary/10 scale-110' : 'text-[#a3aac4] opacity-40 active:opacity-100'}
      `}
    >
      <div className={`${active ? 'animate-bounce' : ''}`}>{icon}</div>
      <span className="text-[9px] uppercase tracking-widest font-black mt-1">{label}</span>
    </button>
  );
}
