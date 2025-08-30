import { Play, Pause, RotateCw, ChevronDown, Rocket, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Controls({ running, gameOver, onStart, onPause, onReset, onLeft, onRight, onRotate, onSoftDrop, onHardDrop }) {
  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div className="flex items-center gap-2">
        {!running ? (
          <Button onClick={onStart} title="Start" icon={<Play className="h-4 w-4" />} />
        ) : (
          <Button onClick={onPause} title="Pause" icon={<Pause className="h-4 w-4" />} />
        )}
        <Button onClick={onReset} title="Reset" icon={<RefreshCw className="h-4 w-4" />} variant="ghost" />
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={onLeft} title="Left" icon={<ChevronLeft className="h-4 w-4" />} variant="soft" />
        <Button onClick={onRotate} title="Rotate" icon={<RotateCw className="h-4 w-4" />} />
        <Button onClick={onRight} title="Right" icon={<ChevronRight className="h-4 w-4" />} variant="soft" />
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={onSoftDrop} title="Soft Drop" icon={<ChevronDown className="h-4 w-4" />} variant="ghost" />
        <Button onClick={onHardDrop} title="Hard Drop" icon={<Rocket className="h-4 w-4" />} variant="primary" />
      </div>
      {gameOver && <div className="text-sm text-red-300">Game Over</div>}
    </div>
  );
}

function Button({ onClick, title, icon, variant = 'default' }) {
  const variants = {
    default: 'bg-white/10 hover:bg-white/20 border-white/15',
    soft: 'bg-white/5 hover:bg-white/10 border-white/10',
    ghost: 'bg-transparent hover:bg-white/10 border-white/10',
    primary: 'bg-rose-500 hover:bg-rose-600 border-rose-400/30',
  };
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-white transition ${variants[variant]}`}
    >
      {icon}
      <span className="hidden sm:inline">{title}</span>
    </button>
  );
}
