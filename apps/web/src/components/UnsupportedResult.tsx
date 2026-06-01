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
    <main className="mx-auto min-h-screen max-w-md px-4 pb-10 pt-5">
      <button className="mb-4 text-sm font-bold text-fern" onClick={onRetake} type="button">
        重新拍照
      </button>
      <section className="rounded-[2rem] bg-white p-5 shadow-soft">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-fern">Maybe</p>
        <h1 className="mt-2 text-3xl font-black text-ink">你看到的可能是</h1>
        <p className="mt-3 text-base leading-7 text-ink/70">
          {message ?? '暂时没法完全确定这台器械，可以从候选里点一个最像的继续看教程入口。'}
        </p>
      </section>
      <section className="mt-4">
        <CandidateList candidates={candidates} onSelect={onSelectCandidate} />
      </section>
    </main>
  );
}
