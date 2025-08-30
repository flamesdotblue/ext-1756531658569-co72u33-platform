export default function GameBoard({ grid, colors }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur">
      <div
        className="grid gap-[2px] bg-neutral-900/60 p-[2px]"
        style={{ gridTemplateColumns: `repeat(${grid[0].length}, minmax(0, 1fr))` }}
      >
        {grid.map((row, rIdx) => (
          <Row key={rIdx} row={row} colors={colors} />
        ))}
      </div>
    </div>
  );
}

function Row({ row, colors }) {
  return (
    <div className="contents">
      {row.map((cell, cIdx) => (
        <Cell key={cIdx} id={cell} color={colors[cell]} />
      ))}
    </div>
  );
}

function Cell({ id, color }) {
  const isGhost = id === 8;
  return (
    <div
      className={
        'aspect-square rounded-[4px] border ' +
        (isGhost ? 'border-white/10 bg-white/[0.03]' : 'border-black/20 shadow-[inset_0_-2px_0_rgba(0,0,0,0.25)]')
      }
      style={{ background: isGhost ? undefined : color }}
    />
  );
}
