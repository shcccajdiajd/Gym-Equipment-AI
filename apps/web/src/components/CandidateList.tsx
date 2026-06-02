import type { EquipmentCard } from '@gym-equipment-ai/shared';

type CandidateListProps = {
  candidates: EquipmentCard[];
  onSelect: (equipment: EquipmentCard) => void;
};

export function CandidateList({ candidates, onSelect }: CandidateListProps) {
  if (candidates.length === 0) {
    return (
      <p className="rounded-[1.35rem] bg-white/80 p-4 text-sm leading-6 text-slate">
        暂时没有候选器械，可以重新拍照或从支持器械列表里手动查找。
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {candidates.map((candidate) => (
        <button
          className="list-card"
          data-equipment-id={candidate.id}
          key={candidate.id}
          onClick={() => onSelect(candidate)}
          type="button"
        >
          <span className="block text-lg font-black tracking-[-0.02em] text-ink">{candidate.zhName}</span>
          <span className="block text-sm font-bold text-slate">{candidate.enName}</span>
          <span className="mt-2 block text-sm leading-6 text-slate">{candidate.summary}</span>
        </button>
      ))}
    </div>
  );
}
