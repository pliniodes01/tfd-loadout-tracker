import { CONFIDENCE_LABEL, type Confidence } from "../lib/community";

const LEVEL: Record<Confidence, number> = { low: 1, medium: 2, high: 3 };

export function ConfidenceIndicator({ confidence }: { confidence: Confidence }) {
  const level = LEVEL[confidence];
  return (
    <div className="inline-flex items-center gap-2">
      <div className="flex items-center gap-0.5" aria-hidden="true">
        {[1, 2, 3].map((i) => (
          <span key={i} className={`block h-2.5 w-1.5 rounded-sm ${i <= level ? "bg-cyan" : "bg-line"}`} />
        ))}
      </div>
      <span className="text-[12px] text-muted">{CONFIDENCE_LABEL[confidence]}</span>
    </div>
  );
}
