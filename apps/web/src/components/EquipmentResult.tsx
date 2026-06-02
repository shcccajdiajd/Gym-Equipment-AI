import type { EquipmentCard, EquipmentExerciseVariant } from '@gym-equipment-ai/shared';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { CandidateList } from './CandidateList.js';
import { PlatformSearchPanel } from './PlatformSearchPanel.js';

type EquipmentResultProps = {
  equipment: EquipmentCard;
  confidence?: number;
  candidates: EquipmentCard[];
  onOpenTrainingForm: (equipment: EquipmentCard, exerciseName: string) => void;
  onRetake: () => void;
  onSelectCandidate: (equipment: EquipmentCard) => void;
  onWrongPrediction: () => void;
};

function ConfidenceBadge({ confidence }: { confidence?: number }) {
  if (typeof confidence !== 'number') {
    return <span className="pill bg-moss text-fern">手动查看</span>;
  }

  return (
    <span className="pill bg-moss text-fern">
      置信度 {Math.round(confidence * 100)}%
    </span>
  );
}

function TeachingCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="surface-card mt-4">
      <h2 className="text-lg font-black tracking-[-0.02em] text-ink">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function getDefaultVariant(equipment: EquipmentCard) {
  return equipment.exerciseVariants?.[0];
}

function getTeachingContent(equipment: EquipmentCard, variant?: EquipmentExerciseVariant) {
  return {
    zhName: variant?.zhName ?? equipment.zhName,
    enName: variant?.enName ?? equipment.enName,
    primaryMuscles: variant?.primaryMuscles ?? equipment.primaryMuscles,
    secondaryMuscles: variant?.secondaryMuscles ?? equipment.secondaryMuscles,
    summary: variant?.summary ?? equipment.summary,
    adjustment: variant?.adjustment ?? equipment.adjustment,
    steps: variant?.steps ?? equipment.steps,
    safety: variant?.safety ?? equipment.safety,
    commonErrors: variant?.commonErrors ?? equipment.commonErrors,
    beginnerTip: variant?.beginnerTip ?? equipment.beginnerTip
  };
}

export function EquipmentResult({
  equipment,
  confidence,
  candidates,
  onOpenTrainingForm,
  onRetake,
  onSelectCandidate,
  onWrongPrediction
}: EquipmentResultProps) {
  const [selectedVariantId, setSelectedVariantId] = useState(getDefaultVariant(equipment)?.id);
  const selectedVariant = equipment.exerciseVariants?.find((variant) => variant.id === selectedVariantId) ?? getDefaultVariant(equipment);
  const teaching = getTeachingContent(equipment, selectedVariant);

  useEffect(() => {
    setSelectedVariantId(getDefaultVariant(equipment)?.id);
  }, [equipment.id, equipment.exerciseVariants]);

  return (
    <main className="screen">
      <button className="top-link" onClick={onRetake} type="button">
        重新拍照
      </button>

      <section className="hero-card">
        <div className="flex items-start justify-between gap-3">
          <div className="relative min-w-0">
            <p className="eyebrow">识别结果</p>
            <h1 className="mt-2 text-[2rem] font-black leading-tight tracking-[-0.05em] text-ink">{teaching.zhName}</h1>
            <p className="mt-1 break-words text-base font-black text-slate">{teaching.enName}</p>
          </div>
          <ConfidenceBadge confidence={confidence} />
        </div>
        <p className="relative mt-4 text-base leading-7 text-slate">{teaching.summary}</p>
        <div className="relative mt-4 flex flex-wrap gap-2">
          {teaching.primaryMuscles.slice(0, 3).map((muscle) => (
            <span className="pill bg-moss text-fern" key={muscle}>{muscle}</span>
          ))}
        </div>
        {selectedVariant ? (
          <p className="relative mt-4 rounded-2xl border border-fern/10 bg-white/75 px-4 py-3 text-sm font-bold leading-6 text-fern">
            已识别到器械：{equipment.zhName}。如果这台器械有多种练法，可以先选你想练的部位。
          </p>
        ) : null}
      </section>

      {equipment.exerciseVariants && equipment.exerciseVariants.length > 1 ? (
        <section className="surface-card mt-4 p-4">
          <p className="eyebrow">Exercise Choice</p>
          <h2 className="mt-1 text-xl font-black tracking-[-0.03em] text-ink">你想用它练哪里？</h2>
          <div className="mt-3 grid gap-2">
            {equipment.exerciseVariants.map((variant) => {
              const selected = variant.id === selectedVariant?.id;

              return (
                <button
                  className={`min-h-[4.25rem] rounded-[1.25rem] border px-4 py-2.5 text-left transition active:scale-[0.99] ${
                    selected
                      ? 'border-fern bg-fern text-white shadow-press'
                      : 'border-line/60 bg-white text-ink shadow-press'
                  }`}
                  data-exercise-variant-id={variant.id}
                  key={variant.id}
                  onClick={() => setSelectedVariantId(variant.id)}
                  type="button"
                >
                  <span className="block text-xs font-black">{variant.targetLabel}</span>
                  <span className="mt-0.5 block text-base font-black">{variant.zhName}</span>
                  <span className={`mt-0.5 block text-xs font-bold ${selected ? 'text-white/78' : 'text-slate'}`}>
                    {variant.primaryMuscles.join('、')}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      <div className="mt-4">
        <PlatformSearchPanel equipment={equipment} variant={selectedVariant} />
      </div>

      <section className="surface-card-muted mt-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-ink">练完了吗？</h2>
            <p className="mt-2 text-sm leading-6 text-slate">顺手记一下组数、次数和重量，之后能看到自己的进步曲线。</p>
          </div>
          <span className="pill bg-white text-clay">可选</span>
        </div>
        <button
          className="btn-secondary mt-4"
          onClick={() => onOpenTrainingForm(equipment, teaching.zhName)}
          type="button"
        >
          记录本次训练
        </button>
      </section>

      <TeachingCard title="主要训练肌群">
        <p className="body-copy">
          {[...teaching.primaryMuscles, ...teaching.secondaryMuscles].join('、')}
        </p>
      </TeachingCard>

      <TeachingCard title="怎么调">
        <p className="body-copy">{teaching.adjustment}</p>
      </TeachingCard>

      <TeachingCard title="标准使用步骤">
        <ol className="space-y-3">
          {teaching.steps.map((step, index) => (
            <li className="flex gap-3 text-base leading-7 text-slate" key={step}>
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-moss text-sm font-black text-fern">
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </TeachingCard>

      <TeachingCard title="安全注意">
        <ul className="space-y-2">
          {teaching.safety.map((item) => (
            <li className="rounded-2xl bg-moss/70 px-4 py-3 text-sm font-bold leading-6 text-ink" key={item}>
              {item}
            </li>
          ))}
        </ul>
      </TeachingCard>

      <TeachingCard title="常见错误">
        <ul className="space-y-2">
          {teaching.commonErrors.map((item) => (
            <li className="rounded-2xl bg-clay/10 px-4 py-3 text-sm font-bold leading-6 text-ink" key={item}>
              {item}
            </li>
          ))}
        </ul>
      </TeachingCard>

      <section className="surface-card-muted mt-4">
        <button className="min-h-11 rounded-full bg-clay/12 px-4 text-sm font-black text-clay" onClick={onWrongPrediction} type="button">
          识别错了？
        </button>
        <p className="mt-2 text-sm leading-6 text-slate">从下面候选器械里选择正确结果，我们会先记录在本机。</p>
        <div className="mt-4">
          <CandidateList candidates={candidates} onSelect={onSelectCandidate} />
        </div>
      </section>
    </main>
  );
}
