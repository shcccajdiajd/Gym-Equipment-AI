import type { EquipmentCard } from '@gym-equipment-ai/shared';

type CandidateListProps = {
  candidates: EquipmentCard[];
  onSelect: (equipment: EquipmentCard) => void;
};

export function CandidateList({ candidates, onSelect }: CandidateListProps) {
  if (candidates.length === 0) {
    return (
      <p className="rounded-3xl bg-white/80 p-4 text-sm text-ink/70">
        暂时没有候选器械，可以重新拍照或从支持器械列表里手动查找。
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {candidates.map((candidate) => (
        <button
          className="w-full rounded-3xl bg-white p-4 text-left shadow-soft"
          data-equipment-id={candidate.id}
          key={candidate.id}
          onClick={() => onSelect(candidate)}
          type="button"
        >
          <span className="block text-lg font-black text-ink">{candidate.zhName}</span>
          <span className="block text-sm font-bold text-ink/55">{candidate.enName}</span>
          <span className="mt-2 block text-sm text-ink/70">{candidate.summary}</span>
        </button>
      ))}
    </div>
  );
}
