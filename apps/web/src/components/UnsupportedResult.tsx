import type { EquipmentCard } from '@gym-equipment-ai/shared';
import { CandidateList } from './CandidateList.js';

type UnsupportedResultProps = {
  candidates: EquipmentCard[];
  message?: string;
  onRetake: () => void;
  onSelectCandidate: (equipment: EquipmentCard) => void;
};

export function UnsupportedResult({ candidates, message, onRetake, onSelectCandidate }: UnsupportedResultProps) {
  return (
    <main className="screen">
      <button className="top-link" onClick={onRetake} type="button">
        重新拍照
      </button>
      <section className="surface-card">
        <p className="eyebrow">Maybe</p>
        <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-ink">你看到的可能是</h1>
        <p className="mt-3 text-base leading-7 text-slate">
          {message ?? '暂时没法完全确定这台器械，可以从候选里点一个最像的继续看教程入口。'}
        </p>
      </section>
      <section className="mt-4">
        <CandidateList candidates={candidates} onSelect={onSelectCandidate} />
      </section>
    </main>
  );
}
