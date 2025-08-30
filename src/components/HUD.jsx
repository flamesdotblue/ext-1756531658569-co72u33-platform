export default function HUD({ score, level, lines, next }) {
  return (
    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-stretch">
      <Card>
        <Label>Score</Label>
        <Value>{score}</Value>
      </Card>
      <Card>
        <Label>Level</Label>
        <Value>{level}</Value>
      </Card>
      <Card>
        <Label>Lines</Label>
        <Value>{lines}</Value>
      </Card>
      <NextPreview piece={next} />
    </div>
  );
}

function Card({ children }) {
  return (
    <div className="flex flex-1 items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
      {children}
    </div>
  );
}

function Label({ children }) {
  return <div className="text-xs uppercase tracking-wide text-white/60">{children}</div>;
}

function Value({ children }) {
  return <div className="text-xl font-semibold">{children}</div>;
}

function NextPreview({ piece }) {
  const matrix = getPreviewMatrix(piece);
  return (
    <div className="flex min-w-[128px] flex-col justify-center rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur">
      <div className="mb-2 text-xs uppercase tracking-wide text-white/60">Next</div>
      <div className="grid aspect-square grid-cols-4 gap-[2px] bg-neutral-900/60 p-[2px]">
        {matrix.flat().map((v, i) => (
          <div key={i} className={`rounded-[3px] ${v ? 'bg-white' : 'bg-black/20'}`} />
        ))}
      </div>
    </div>
  );
}

function getPreviewMatrix(piece) {
  // Normalize to a 4x4 preview
  const SHAPES = {
    I: [
      [0,0,0,0],
      [1,1,1,1],
      [0,0,0,0],
      [0,0,0,0],
    ],
    J: [
      [1,0,0,0],
      [1,1,1,0],
      [0,0,0,0],
      [0,0,0,0],
    ],
    L: [
      [0,0,1,0],
      [1,1,1,0],
      [0,0,0,0],
      [0,0,0,0],
    ],
    O: [
      [0,1,1,0],
      [0,1,1,0],
      [0,0,0,0],
      [0,0,0,0],
    ],
    S: [
      [0,1,1,0],
      [1,1,0,0],
      [0,0,0,0],
      [0,0,0,0],
    ],
    T: [
      [0,1,0,0],
      [1,1,1,0],
      [0,0,0,0],
      [0,0,0,0],
    ],
    Z: [
      [1,1,0,0],
      [0,1,1,0],
      [0,0,0,0],
      [0,0,0,0],
    ],
  };
  return SHAPES[piece.key] || SHAPES.I;
}
