import type { EquipmentCard } from '@gym-equipment-ai/shared';

type CandidateListProps = {
  candidates: EquipmentCard[];
  onSelect: (equipment: EquipmentCard) => void;
};

export function CandidateList({ candidates, onSelect }: CandidateListProps) {
  if (candidates.length === 0) {
    return (
      <div className="surface-card grid min-h-64 place-items-center text-center">
        <div>
          <span className="mx-auto grid h-20 w-20 place-items-center rounded-[1.25rem] bg-oat text-5xl font-light text-tertiary">⌕</span>
          <p className="mt-4 text-lg font-black text-carbon">没有找到匹配器械</p>
          <p className="mt-2 text-sm leading-6 text-slate">换个关键词试试，或者重新拍一张更完整的器械照片。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {candidates.map((candidate) => (
        <button
          className="candidate-card"
          data-equipment-id={candidate.id}
          key={candidate.id}
          onClick={() => onSelect(candidate)}
          type="button"
        >
          <span className="candidate-thumb">{candidate.zhName.slice(0, 1)}</span>
          <span className="min-w-0 flex-1">
            <span className="block text-lg font-black tracking-[-0.03em] text-carbon">{candidate.zhName}</span>
            <span className="block truncate text-sm font-medium text-carbon/80">{candidate.enName}</span>
            <span className="mt-1 flex flex-wrap gap-1.5">
              {candidate.primaryMuscles.slice(0, 2).map((muscle) => (
                <span className="rounded-md bg-acid px-2 py-0.5 text-xs font-black text-carbon" key={muscle}>
                  {muscle}
                </span>
              ))}
            </span>
          </span>
          <span className="text-3xl font-light text-carbon">›</span>
        </button>
      ))}
    </div>
  );
}
