import { useEffect, useMemo, useRef, useState } from 'react';
import Hero from './components/Hero';
import GameBoard from './components/GameBoard';
import Controls from './components/Controls';
import HUD from './components/HUD';

const COLS = 10;
const ROWS = 20;

const SHAPES = {
  I: [
    [ [0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0] ],
    [ [0,0,1,0],[0,0,1,0],[0,0,1,0],[0,0,1,0] ],
    [ [0,0,0,0],[0,0,0,0],[1,1,1,1],[0,0,0,0] ],
    [ [0,1,0,0],[0,1,0,0],[0,1,0,0],[0,1,0,0] ],
  ],
  J: [
    [ [2,0,0],[2,2,2],[0,0,0] ],
    [ [0,2,2],[0,2,0],[0,2,0] ],
    [ [0,0,0],[2,2,2],[0,0,2] ],
    [ [0,2,0],[0,2,0],[2,2,0] ],
  ],
  L: [
    [ [0,0,3],[3,3,3],[0,0,0] ],
    [ [0,3,0],[0,3,0],[0,3,3] ],
    [ [0,0,0],[3,3,3],[3,0,0] ],
    [ [3,3,0],[0,3,0],[0,3,0] ],
  ],
  O: [
    [ [0,4,4,0],[0,4,4,0],[0,0,0,0],[0,0,0,0] ],
    [ [0,4,4,0],[0,4,4,0],[0,0,0,0],[0,0,0,0] ],
    [ [0,4,4,0],[0,4,4,0],[0,0,0,0],[0,0,0,0] ],
    [ [0,4,4,0],[0,4,4,0],[0,0,0,0],[0,0,0,0] ],
  ],
  S: [
    [ [0,5,5],[5,5,0],[0,0,0] ],
    [ [0,5,0],[0,5,5],[0,0,5] ],
    [ [0,0,0],[0,5,5],[5,5,0] ],
    [ [5,0,0],[5,5,0],[0,5,0] ],
  ],
  T: [
    [ [0,6,0],[6,6,6],[0,0,0] ],
    [ [0,6,0],[0,6,6],[0,6,0] ],
    [ [0,0,0],[6,6,6],[0,6,0] ],
    [ [0,6,0],[6,6,0],[0,6,0] ],
  ],
  Z: [
    [ [7,7,0],[0,7,7],[0,0,0] ],
    [ [0,0,7],[0,7,7],[0,7,0] ],
    [ [0,0,0],[7,7,0],[0,7,7] ],
    [ [0,7,0],[7,7,0],[7,0,0] ],
  ],
};

const COLORS = {
  0: 'transparent',
  1: '#00E5FF', // I
  2: '#0070F3', // J
  3: '#FF9800', // L
  4: '#F5D90A', // O
  5: '#2ECC71', // S
  6: '#8A2BE2', // T
  7: '#FF4D4F', // Z
  8: 'rgba(255,255,255,0.07)', // wall/ghost
};

function createEmptyGrid() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

function randomPiece() {
  const keys = Object.keys(SHAPES);
  const k = keys[(Math.random() * keys.length) | 0];
  const rotation = 0;
  const matrix = SHAPES[k][rotation];
  const size = matrix.length;
  // center horizontally
  const x = Math.floor((COLS - size) / 2);
  const y = -getTopOffset(matrix);
  return { key: k, rotation, x, y };
}

function getTopOffset(matrix) {
  for (let r = 0; r < matrix.length; r++) {
    if (matrix[r].some((v) => v)) return r;
  }
  return 0;
}

function getMatrix(piece) {
  return SHAPES[piece.key][piece.rotation];
}

function collide(grid, piece) {
  const m = getMatrix(piece);
  for (let y = 0; y < m.length; y++) {
    for (let x = 0; x < m[y].length; x++) {
      if (!m[y][x]) continue;
      const gx = piece.x + x;
      const gy = piece.y + y;
      if (gx < 0 || gx >= COLS || gy >= ROWS) return true;
      if (gy >= 0 && grid[gy][gx]) return true;
    }
  }
  return false;
}

function merge(grid, piece) {
  const m = getMatrix(piece);
  const newGrid = grid.map((row) => row.slice());
  for (let y = 0; y < m.length; y++) {
    for (let x = 0; x < m[y].length; x++) {
      if (m[y][x]) {
        const gx = piece.x + x;
        const gy = piece.y + y;
        if (gy >= 0) newGrid[gy][gx] = m[y][x];
      }
    }
  }
  return newGrid;
}

function rotate(piece, dir) {
  const count = SHAPES[piece.key].length;
  return { ...piece, rotation: (piece.rotation + dir + count) % count };
}

function clearLines(grid) {
  const newGrid = [];
  let cleared = 0;
  for (let r = 0; r < ROWS; r++) {
    if (grid[r].every((c) => c !== 0)) {
      cleared++;
    } else {
      newGrid.push(grid[r]);
    }
  }
  while (newGrid.length < ROWS) newGrid.unshift(Array(COLS).fill(0));
  return { grid: newGrid, cleared };
}

function getDropY(grid, piece) {
  let test = { ...piece };
  while (!collide(grid, { ...test, y: test.y + 1 })) {
    test.y++;
  }
  return test.y;
}

function useInterval(callback, delay, active) {
  const saved = useRef();
  useEffect(() => { saved.current = callback; }, [callback]);
  useEffect(() => {
    if (!active || delay == null) return;
    const id = setInterval(() => saved.current && saved.current(), delay);
    return () => clearInterval(id);
  }, [delay, active]);
}

export default function App() {
  const [grid, setGrid] = useState(createEmptyGrid());
  const [current, setCurrent] = useState(randomPiece());
  const [next, setNext] = useState(randomPiece());
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const speed = useMemo(() => Math.max(120, 800 - (level - 1) * 60), [level]);

  const hardDropPreviewY = useMemo(() => getDropY(grid, current), [grid, current]);

  const reset = () => {
    setGrid(createEmptyGrid());
    const p = randomPiece();
    setCurrent(p);
    setNext(randomPiece());
    setScore(0);
    setLines(0);
    setLevel(1);
    setRunning(false);
    setGameOver(false);
  };

  const spawnNext = (g) => {
    const p = next;
    const n = randomPiece();
    const initial = { ...p };
    if (collide(g, initial)) {
      setGameOver(true);
      setRunning(false);
      return { g, spawned: false };
    }
    setCurrent(initial);
    setNext(n);
    return { g, spawned: true };
  };

  const lockAndClear = (g, piece) => {
    const merged = merge(g, piece);
    const { grid: clearedGrid, cleared } = clearLines(merged);
    if (cleared > 0) {
      const lineScores = [0, 100, 300, 500, 800];
      setScore((s) => s + lineScores[cleared] * level);
      setLines((l) => {
        const total = l + cleared;
        const newLevel = 1 + Math.floor(total / 10);
        setLevel(newLevel);
        return total;
      });
    }
    setGrid(clearedGrid);
    return clearedGrid;
  };

  const tick = () => {
    if (gameOver || !running) return;
    const candidate = { ...current, y: current.y + 1 };
    if (!collide(grid, candidate)) {
      setCurrent(candidate);
      return;
    }
    const g2 = lockAndClear(grid, current);
    spawnNext(g2);
  };

  useInterval(tick, speed, running && !gameOver);

  const move = (dx) => {
    const candidate = { ...current, x: current.x + dx };
    if (!collide(grid, candidate)) setCurrent(candidate);
  };

  const softDrop = () => {
    const candidate = { ...current, y: current.y + 1 };
    if (!collide(grid, candidate)) setCurrent(candidate);
    else {
      const g2 = lockAndClear(grid, current);
      spawnNext(g2);
    }
  };

  const hardDrop = () => {
    const y = getDropY(grid, current);
    const piece = { ...current, y };
    const g2 = lockAndClear(grid, piece);
    spawnNext(g2);
  };

  const rotateCW = () => {
    let rotated = rotate(current, 1);
    // Basic wall kicks: try small offsets
    const kicks = [0, -1, 1, -2, 2];
    for (let i = 0; i < kicks.length; i++) {
      const cand = { ...rotated, x: current.x + kicks[i] };
      if (!collide(grid, cand)) {
        setCurrent(cand);
        return;
      }
    }
  };

  const togglePause = () => setRunning((r) => !r && !gameOver ? true : !r);

  useEffect(() => {
    const onKey = (e) => {
      if (e.repeat) return;
      switch (e.key) {
        case 'ArrowLeft': e.preventDefault(); move(-1); break;
        case 'ArrowRight': e.preventDefault(); move(1); break;
        case 'ArrowDown': e.preventDefault(); softDrop(); break;
        case 'ArrowUp': e.preventDefault(); rotateCW(); break;
        case ' ': e.preventDefault(); hardDrop(); break;
        case 'p': case 'P': togglePause(); break;
        case 'r': case 'R': reset(); break;
        case 'Enter': if (!running && !gameOver) setRunning(true); break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [current, grid, running, gameOver]);

  const coloredGrid = useMemo(() => {
    // Overlay current and ghost on the base grid for display
    const g = grid.map((row) => row.slice());
    // Ghost
    const ghostY = getDropY(grid, current);
    const gm = getMatrix({ ...current, y: ghostY });
    for (let y = 0; y < gm.length; y++) {
      for (let x = 0; x < gm[y].length; x++) {
        if (gm[y][x]) {
          const gx = current.x + x;
          const gy = ghostY + y;
          if (gy >= 0 && g[gy][gx] === 0) g[gy][gx] = 8; // ghost id
        }
      }
    }
    // Current
    const m = getMatrix(current);
    for (let y = 0; y < m.length; y++) {
      for (let x = 0; x < m[y].length; x++) {
        if (m[y][x]) {
          const gx = current.x + x;
          const gy = current.y + y;
          if (gy >= 0) g[gy][gx] = m[y][x];
        }
      }
    }
    return g;
  }, [grid, current]);

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <Hero />
      <main className="mx-auto max-w-6xl px-4 py-10 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8">
          <div className="flex flex-col items-center gap-6">
            <HUD score={score} level={level} lines={lines} next={next} />
            <GameBoard grid={coloredGrid} colors={COLORS} />
            <Controls
              running={running}
              gameOver={gameOver}
              onStart={() => setRunning(true)}
              onPause={() => setRunning(false)}
              onReset={reset}
              onLeft={() => move(-1)}
              onRight={() => move(1)}
              onRotate={rotateCW}
              onSoftDrop={softDrop}
              onHardDrop={hardDrop}
            />
            {gameOver && (
              <div className="mt-2 rounded-md bg-red-500/10 px-4 py-3 text-red-300">
                Game over. Press Reset to play again.
              </div>
            )}
          </div>
          <aside className="lg:pl-6">
            <div className="sticky top-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <h3 className="mb-2 text-lg font-semibold">How to play</h3>
              <ul className="list-disc space-y-1 pl-5 text-sm text-white/80">
                <li>Arrow Left/Right: Move</li>
                <li>Arrow Up: Rotate</li>
                <li>Arrow Down: Soft Drop</li>
                <li>Space: Hard Drop</li>
                <li>P: Pause/Resume</li>
                <li>R: Reset</li>
              </ul>
              <p className="mt-4 text-sm text-white/60">
                Clear lines to level up and speed up the game. The ghost piece shows where the tetromino will land.
              </p>
            </div>
          </aside>
        </div>
      </main>
      <footer className="px-4 py-8 text-center text-sm text-white/50">
        Built with React, Tailwind, and a minimalist, interactive cover.
      </footer>
    </div>
  );
}
