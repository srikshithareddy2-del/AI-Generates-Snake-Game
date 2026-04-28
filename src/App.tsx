/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, SkipForward, SkipBack, Music, Volume2, Trophy, RefreshCcw, Power } from 'lucide-react';

// --- Types ---

interface Track {
  id: number;
  title: string;
  artist: string;
  cover: string;
  color: string;
}

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

interface Position {
  x: number;
  y: number;
}

// --- Constants ---

const TRACKS: Track[] = [
  {
    id: 1,
    title: "Neon Horizon",
    artist: "SynthWave AI",
    cover: "https://picsum.photos/seed/neon1/400/400",
    color: "neon-pink"
  },
  {
    id: 2,
    title: "Grid Runner",
    artist: "Digital Drift",
    cover: "https://picsum.photos/seed/neon2/400/400",
    color: "neon-cyan"
  },
  {
    id: 3,
    title: "Data Pulse",
    artist: "Core Override",
    cover: "https://picsum.photos/seed/neon3/400/400",
    color: "neon-purple"
  }
];

const GRID_SIZE = 20;
const INITIAL_SPEED = 150;

// --- Components ---

export default function App() {
  // Music Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const currentTrack = TRACKS[currentTrackIndex];

  // Snake Game State
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [speed, setSpeed] = useState(INITIAL_SPEED);

  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  // --- Music Logic ---

  const nextTrack = () => setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
  const prevTrack = () => setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);

  // --- Game Logic ---

  const generateFood = (currentSnake: Position[]) => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
      if (!currentSnake.some(seg => seg.x === newFood.x && seg.y === newFood.y)) break;
    }
    setFood(newFood);
  };

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setDirection('RIGHT');
    setGameOver(false);
    setScore(0);
    setSpeed(INITIAL_SPEED);
    generateFood([{ x: 10, y: 10 }]);
    setGameActive(true);
  };

  const moveSnake = () => {
    if (gameOver || !gameActive) return;

    setSnake((prevSnake) => {
      const head = prevSnake[0];
      const newHead = { ...head };

      switch (direction) {
        case 'UP': newHead.y -= 1; break;
        case 'DOWN': newHead.y += 1; break;
        case 'LEFT': newHead.x -= 1; break;
        case 'RIGHT': newHead.x += 1; break;
      }

      if (
        newHead.x < 0 || newHead.x >= GRID_SIZE || 
        newHead.y < 0 || newHead.y >= GRID_SIZE ||
        prevSnake.some(seg => seg.x === newHead.x && seg.y === newHead.y)
      ) {
        setGameOver(true);
        setGameActive(false);
        if (score > highScore) setHighScore(score);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(s => s + 1);
        setSpeed(prev => Math.max(prev - 2, 50));
        generateFood(newSnake);
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': if (direction !== 'DOWN') setDirection('UP'); break;
        case 'ArrowDown': if (direction !== 'UP') setDirection('DOWN'); break;
        case 'ArrowLeft': if (direction !== 'RIGHT') setDirection('LEFT'); break;
        case 'ArrowRight': if (direction !== 'LEFT') setDirection('RIGHT'); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction]);

  useEffect(() => {
    if (gameActive && !gameOver) {
      gameLoopRef.current = setInterval(moveSnake, speed);
    } else {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    }
    return () => { if (gameLoopRef.current) clearInterval(gameLoopRef.current); };
  }, [gameActive, gameOver, direction, speed, food]);

  return (
    <div className="min-h-screen bg-dark flex flex-col md:flex-row font-mono text-white overflow-hidden scanlines selection:bg-magenta selection:text-white">
      
      {/* --- Sidebar: Glitch Music Player --- */}
      <aside className="w-full md:w-80 border-r-4 border-magenta bg-black p-6 flex flex-col gap-8 z-10 relative">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-cyan flex items-center justify-center animate-pulse">
            <Music className="text-black" />
          </div>
          <h1 
            data-text="PULSE_NODE" 
            className="glitch text-3xl font-black tracking-widest text-magenta uppercase"
          >
            PULSE_NODE
          </h1>
        </div>

        <div className="flex-1 flex flex-col gap-6">
          <div className="relative group p-2 border-2 border-cyan bg-magenta/10">
            <img 
              src={currentTrack.cover} 
              alt={currentTrack.title} 
              className="w-full grayscale contrast-150 brightness-75 hover:grayscale-0 transition-all duration-75"
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-0 left-0 w-full h-full screen-tear pointer-events-none" />
          </div>

          <div className="border-l-4 border-cyan pl-4">
            <h2 className="text-2xl font-bold text-cyan truncate underline decoration-magenta uppercase">
              {currentTrack.title}
            </h2>
            <p className="text-white/60 text-lg">{currentTrack.artist}</p>
          </div>

          <div className="flex items-center justify-between">
            <button onClick={prevTrack} className="p-2 border-2 border-white hover:bg-magenta hover:border-magenta transition-colors">
              <SkipBack size={24} />
            </button>
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-4 border-4 border-cyan bg-black hover:bg-cyan hover:text-black transition-all flex items-center justify-center"
            >
              {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" />}
            </button>
            <button onClick={nextTrack} className="p-2 border-2 border-white hover:bg-magenta hover:border-magenta transition-colors">
              <SkipForward size={24} />
            </button>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[10px] uppercase text-cyan">
              <span>Bitrate: 32kbps</span>
              <span>Buffer: 99%</span>
            </div>
            <div className="h-4 border-2 border-white bg-black p-[2px]">
              <div className="h-full bg-magenta w-3/4 animate-pulse" />
            </div>
          </div>
        </div>

        <div className="pt-6 border-t-2 border-magenta space-y-4">
          {TRACKS.map((track, idx) => (
            <button 
              key={track.id}
              onClick={() => setCurrentTrackIndex(idx)}
              className={`w-full text-left p-2 flex items-center gap-3 border-2 ${currentTrackIndex === idx ? 'bg-magenta border-white text-white' : 'border-cyan/50 text-cyan hover:bg-cyan/10'}`}
            >
              <span className="text-xs">[{idx.toString().padStart(2, '0')}]</span>
              <div className="text-sm font-bold truncate uppercase">{track.title}</div>
            </button>
          ))}
        </div>
      </aside>

      {/* --- Main Area: Glitch Snake --- */}
      <main className="flex-1 flex flex-col p-4 md:p-8 relative items-center justify-center bg-dark">
        
        {/* Background Noise Overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] mix-blend-overlay" />

        <div className="w-full max-w-xl flex flex-col gap-4 relative z-10">
          
          {/* HUD */}
          <div className="flex items-center justify-between border-4 border-white bg-magenta/20 p-4">
            <div>
              <div className="text-xs text-cyan opacity-80 uppercase tracking-tighter italic">Process ID: OXF001</div>
              <div className="text-5xl font-black text-white italic uppercase glitch" data-text="CORE_RUNNER">CORE_RUNNER</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-white/40 uppercase">Frag_Count</div>
              <div className="text-4xl font-black text-magenta leading-none">{score.toString().padStart(3, '0')}</div>
            </div>
          </div>

          {/* Game Matrix */}
          <div className="relative border-8 border-cyan bg-black shadow-[0_0_20px_rgba(0,255,255,0.3)]">
            <div className="aspect-square grid grid-cols-20 grid-rows-20 p-1 relative">
              
              {/* Grid Lines */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#0ff2_1px,transparent_1px),linear-gradient(to_bottom,#0ff2_1px,transparent_1px)] bg-[size:5%_5%] pointer-events-none" />

              {/* Food: Magenta Logic Node */}
              <div 
                style={{ gridColumnStart: food.x + 1, gridRowStart: food.y + 1 }}
                className="w-full h-full bg-magenta border border-white animate-pulse shadow-[0_0_10px_#f0f]"
              />

              {/* Snake: Cyan Data Stream */}
              {snake.map((segment, i) => (
                <div 
                  key={`${i}-${segment.x}-${segment.y}`}
                  style={{ gridColumnStart: segment.x + 1, gridRowStart: segment.y + 1 }}
                  className={`${i === 0 ? 'bg-white border-2 border-cyan z-10' : 'bg-cyan border border-black'} w-full h-full`}
                />
              ))}

              {/* System Messages Overlay */}
              {!gameActive && (
                <div className="absolute inset-0 z-40 bg-black/90 flex flex-col items-center justify-center p-8 text-center border-t-8 border-magenta animate-pulse">
                  {gameOver ? (
                    <div className="space-y-6">
                      <h2 className="text-6xl font-black text-magenta glitch italic" data-text="FAILED">FAILED</h2>
                      <p className="text-cyan text-sm uppercase tracking-[0.5em]">Memory Leak Detected</p>
                      <button 
                        onClick={resetGame}
                        className="bg-magenta text-white font-black px-12 py-4 border-4 border-white hover:bg-white hover:text-magenta transition-all"
                      >
                        REBOOT_INIT
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-12">
                      <div className="space-y-4">
                        <h2 className="text-6xl font-black text-cyan glitch" data-text="AWAITING">AWAITING</h2>
                        <div className="h-1 bg-white w-full overflow-hidden">
                          <div className="h-full bg-magenta w-1/2 animate-[tilt_2s_infinite]" />
                        </div>
                      </div>
                      <button 
                        onClick={resetGame}
                        className="group relative px-16 py-6 bg-cyan text-black font-black text-3xl uppercase italic hover:bg-magenta hover:text-white border-4 border-white transform hover:skew-x-12 transition-all"
                      >
                        RUN_SYSTEM
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Terminal Logs */}
          <div className="bg-black/80 border-2 border-white/20 p-2 text-[10px] text-white/40 h-24 overflow-hidden font-mono uppercase">
            <div className="animate-[scroll_10s_linear_infinite]">
              {'>'} Initializing kernel... OK<br/>
              {'>'} Loading audio buffers... OK<br/>
              {'>'} Establishing data link... OK<br/>
              {'>'} Warning: Integrity check bypassed<br/>
              {'>'} {gameActive ? 'System active: Processing stream...' : 'Standby mode: Awaiting signal...'}<br/>
              {'>'} Encryption layer: Compromised<br/>
              {'>'} Pulse frequency: Stable<br/>
            </div>
          </div>
        </div>
      </main>
      
      {/* Overlay Distortion */}
      <div className="fixed inset-0 pointer-events-none border-[20px] border-magenta/5 z-[100]" />
      <div className="fixed top-0 left-0 w-full h-[2px] bg-cyan/20 animate-[scan_4s_linear_infinite] z-[101]" />
    </div>
  );
}
