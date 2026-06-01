import type { EquipmentCard } from '@gym-equipment-ai/shared';
import { CandidateList } from './CandidateList.js';
import { PlatformSearchPanel } from './PlatformSearchPanel.js';

type EquipmentResultProps = {
  equipment: EquipmentCard;
  confidence?: number;
  candidates: EquipmentCard[];
  onRetake: () => void;
  onSelectCandidate: (equipment: EquipmentCard) => void;
  onWrongPrediction: () => void;
};

function ConfidenceBadge({ confidence }: { confidence?: number }) {
  if (typeof confidence !== 'number') {
    return <span className="rounded-full bg-moss px-3 py-1 text-xs font-bold text-fern">手动查看</span>;
  }

  return (
    <span className="rounded-full bg-moss px-3 py-1 text-xs font-bold text-fern">
      置信度 {Math.round(confidence * 100)}%
    </span>
  );
}

export function EquipmentResult({
  equipment,
  confidence,
  candidates,
  onRetake,
  onSelectCandidate,
  onWrongPrediction
}: EquipmentResultProps) {
  return (
    <main className="mx-auto min-h-screen max-w-md px-4 pb-10 pt-5">
      <button className="mb-4 text-sm font-bold text-fern" onClick={onRetake} type="button">
        重新拍照
      </button>

      <section className="rounded-[2rem] bg-white p-5 shadow-soft">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-black leading-tight text-ink">{equipment.zhName}</h1>
            <p className="mt-1 text-lg font-bold text-ink/55">{equipment.enName}</p>
          </div>
          <ConfidenceBadge confidence={confidence} />
        </div>
        <p className="mt-4 text-base leading-7 text-ink/75">{equipment.summary}</p>
      </section>

      <div className="mt-4">
        <PlatformSearchPanel equipment={equipment} />
      </div>

      <section className="mt-4 rounded-[2rem] bg-white p-5 shadow-soft">
        <h2 className="text-lg font-black text-ink">主要训练肌群</h2>
        <p className="mt-2 text-base text-ink/75">
          {[...equipment.primaryMuscles, ...equipment.secondaryMuscles].join('、')}
        </p>
      </section>

      <section className="mt-4 rounded-[2rem] bg-white p-5 shadow-soft">
        <h2 className="text-lg font-black text-ink">怎么调</h2>
        <p className="mt-2 text-base leading-7 text-ink/75">{equipment.adjustment}</p>
      </section>

      <section className="mt-4 rounded-[2rem] bg-white p-5 shadow-soft">
        <h2 className="text-lg font-black text-ink">标准使用步骤</h2>
        <ol className="mt-3 space-y-3">
          {equipment.steps.map((step, index) => (
            <li className="text-base leading-7 text-ink/75" key={step}>
              {index + 1}. {step}
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-4 rounded-[2rem] bg-white p-5 shadow-soft">
        <h2 className="text-lg font-black text-ink">安全注意</h2>
        <ul className="mt-3 space-y-2">
          {equipment.safety.map((item) => (
            <li className="text-base leading-7 text-ink/75" key={item}>
              - {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-4 rounded-[2rem] bg-white p-5 shadow-soft">
        <h2 className="text-lg font-black text-ink">常见错误</h2>
        <ul className="mt-3 space-y-2">
          {equipment.commonErrors.map((item) => (
            <li className="text-base leading-7 text-ink/75" key={item}>
              - {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-4 rounded-[2rem] bg-white/70 p-5 shadow-soft">
        <button className="text-sm font-black text-clay" onClick={onWrongPrediction} type="button">
          识别错了？
        </button>
        <p className="mt-2 text-sm text-ink/60">从下面候选器械里选择正确结果，我们会先记录在本机。</p>
        <div className="mt-4">
          <CandidateList candidates={candidates} onSelect={onSelectCandidate} />
        </div>
      </section>
    </main>
  );
}
