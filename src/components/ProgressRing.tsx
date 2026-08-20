export function ProgressRing({ percent, size = 96 }: { percent: number; size?: number }) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div
      className="relative grid place-items-center rounded-full"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(var(--color-fire) ${clamped * 3.6}deg, var(--color-line) 0deg)`,
      }}
    >
      <div
        className="absolute rounded-full bg-bg"
        style={{ width: size * 0.72, height: size * 0.72 }}
      />
      <div className="relative text-center">
        <strong className="block text-xl leading-none">{clamped}%</strong>
        <span className="mt-1 block font-mono text-[10px] tracking-widest text-muted">BUILD</span>
      </div>
    </div>
  );
}
