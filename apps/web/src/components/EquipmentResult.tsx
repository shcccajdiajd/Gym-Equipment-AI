import type { EquipmentCard, EquipmentExerciseVariant } from '@gym-equipment-ai/shared';
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
    return <span className="rounded-full bg-moss px-3 py-1 text-xs font-bold text-fern">手动查看</span>;
  }

  return (
    <span className="rounded-full bg-moss px-3 py-1 text-xs font-bold text-fern">
      置信度 {Math.round(confidence * 100)}%
    </span>
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
    <main className="mx-auto min-h-screen max-w-md px-4 pb-10 pt-5">
      <button className="mb-4 text-sm font-bold text-fern" onClick={onRetake} type="button">
        重新拍照
      </button>

      <section className="rounded-[2rem] bg-white p-5 shadow-soft">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-black leading-tight text-ink">{teaching.zhName}</h1>
            <p className="mt-1 text-lg font-bold text-ink/55">{teaching.enName}</p>
          </div>
          <ConfidenceBadge confidence={confidence} />
        </div>
        <p className="mt-4 text-base leading-7 text-ink/75">{teaching.summary}</p>
        {selectedVariant ? (
          <p className="mt-3 rounded-2xl bg-moss px-4 py-3 text-sm font-bold text-fern">
            已识别到器械：{equipment.zhName}。下面可以选择这台器械的具体练法。
          </p>
        ) : null}
      </section>

      {equipment.exerciseVariants && equipment.exerciseVariants.length > 1 ? (
        <section className="mt-4 rounded-[2rem] bg-white p-5 shadow-soft">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-fern">Exercise Choice</p>
          <h2 className="mt-1 text-2xl font-black text-ink">你想用它练哪里？</h2>
          <div className="mt-4 grid gap-3">
            {equipment.exerciseVariants.map((variant) => {
              const selected = variant.id === selectedVariant?.id;

              return (
                <button
                  className={`rounded-3xl border px-4 py-3 text-left transition ${
                    selected
                      ? 'border-fern bg-fern text-white'
                      : 'border-transparent bg-moss text-ink'
                  }`}
                  data-exercise-variant-id={variant.id}
                  key={variant.id}
                  onClick={() => setSelectedVariantId(variant.id)}
                  type="button"
                >
                  <span className="block text-sm font-black">{variant.targetLabel}</span>
                  <span className="mt-1 block text-lg font-black">{variant.zhName}</span>
                  <span className={`mt-1 block text-sm ${selected ? 'text-white/75' : 'text-ink/60'}`}>
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

      <section className="mt-4 rounded-[2rem] bg-white p-5 shadow-soft">
        <h2 className="text-xl font-black text-ink">练完了吗？</h2>
        <p className="mt-2 text-sm leading-6 text-ink/60">顺手记一下组数、次数和重量，之后能看到自己的进步曲线。</p>
        <button
          className="mt-4 w-full rounded-3xl bg-fern px-5 py-4 text-base font-black text-white"
          onClick={() => onOpenTrainingForm(equipment, teaching.zhName)}
          type="button"
        >
          记录本次训练
        </button>
      </section>

      <section className="mt-4 rounded-[2rem] bg-white p-5 shadow-soft">
        <h2 className="text-lg font-black text-ink">主要训练肌群</h2>
        <p className="mt-2 text-base text-ink/75">
          {[...teaching.primaryMuscles, ...teaching.secondaryMuscles].join('、')}
        </p>
      </section>

      <section className="mt-4 rounded-[2rem] bg-white p-5 shadow-soft">
        <h2 className="text-lg font-black text-ink">怎么调</h2>
        <p className="mt-2 text-base leading-7 text-ink/75">{teaching.adjustment}</p>
      </section>

      <section className="mt-4 rounded-[2rem] bg-white p-5 shadow-soft">
        <h2 className="text-lg font-black text-ink">标准使用步骤</h2>
        <ol className="mt-3 space-y-3">
          {teaching.steps.map((step, index) => (
            <li className="text-base leading-7 text-ink/75" key={step}>
              {index + 1}. {step}
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-4 rounded-[2rem] bg-white p-5 shadow-soft">
        <h2 className="text-lg font-black text-ink">安全注意</h2>
        <ul className="mt-3 space-y-2">
          {teaching.safety.map((item) => (
            <li className="text-base leading-7 text-ink/75" key={item}>
              - {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-4 rounded-[2rem] bg-white p-5 shadow-soft">
        <h2 className="text-lg font-black text-ink">常见错误</h2>
        <ul className="mt-3 space-y-2">
          {teaching.commonErrors.map((item) => (
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
