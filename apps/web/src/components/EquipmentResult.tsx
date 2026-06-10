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

  const percent = Math.round(confidence * 100);

  return (
    <span className="pill bg-moss text-fern">
      {percent}% 置信度
    </span>
  );
}

function TeachingCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="teaching-panel mt-4">
      <div className="teaching-panel-header">
        <h2 className="text-base font-black tracking-[-0.03em] text-carbon">{title}</h2>
        <span className="text-xl text-tertiary">⌄</span>
      </div>
      <div className="p-4">{children}</div>
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
  const [correctionOpen, setCorrectionOpen] = useState(false);
  const selectedVariant = equipment.exerciseVariants?.find((variant) => variant.id === selectedVariantId) ?? getDefaultVariant(equipment);
  const teaching = getTeachingContent(equipment, selectedVariant);

  useEffect(() => {
    setSelectedVariantId(getDefaultVariant(equipment)?.id);
  }, [equipment.id, equipment.exerciseVariants]);

  function selectCorrection(equipmentCard: EquipmentCard) {
    setCorrectionOpen(false);
    onSelectCandidate(equipmentCard);
  }

  return (
    <main className="screen pb-0">
      <div className="app-topbar">
        <button className="icon-button" onClick={onRetake} type="button" aria-label="重新拍照">
          ‹
        </button>
        <h1 className="app-topbar-title">识别结果</h1>
        <button className="icon-button" onClick={() => setCorrectionOpen(true)} type="button" aria-label="识别纠错">
          ?
        </button>
      </div>

      <section className="result-top-card">
        <div className="flex items-center gap-4">
          <div className="equipment-photo">{equipment.zhName.slice(0, 1)}</div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h1 className="truncate text-2xl font-black tracking-[-0.045em] text-carbon">{equipment.zhName}</h1>
                <p className="mt-0.5 truncate text-base font-medium text-slate">{equipment.enName}</p>
              </div>
              <ConfidenceBadge confidence={confidence} />
            </div>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <span className="sr-only">这台器械想练哪里？</span>
              {(equipment.exerciseVariants && equipment.exerciseVariants.length > 0 ? equipment.exerciseVariants : undefined)?.map((variant) => {
                const selected = variant.id === selectedVariant?.id;
                return (
                  <button
                    className={`action-chip shrink-0 ${selected ? 'action-chip-selected' : ''}`}
                    data-exercise-variant-id={variant.id}
                    key={variant.id}
                    onClick={() => setSelectedVariantId(variant.id)}
                    type="button"
                  >
                    {variant.targetLabel}
                  </button>
                );
              }) ?? teaching.primaryMuscles.slice(0, 2).map((muscle) => (
                <span className="action-chip action-chip-selected" key={muscle}>{muscle}</span>
              ))}
            </div>
            <p className="mt-1 text-xs font-medium text-slate">{teaching.enName}</p>
          </div>
        </div>
      </section>

      <div className="mt-4">
        <PlatformSearchPanel equipment={equipment} variant={selectedVariant} />
      </div>

      <section className="surface-card mt-4">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-2xl font-black tracking-[-0.04em] text-carbon">快速上手</h2>
            <p className="mt-1 text-sm font-medium text-slate">
              {teaching.primaryMuscles.slice(0, 2).join('、')} · 调整座椅 · 3 个关键步骤
            </p>
          </div>
          <span className="text-3xl text-carbon">›</span>
        </div>
        <div className="mt-4 grid grid-cols-[7rem_1fr] gap-4">
          <div className="grid min-h-28 place-items-center rounded-[1rem] bg-oat">
            <div className="relative h-20 w-16 rounded-full border-2 border-line">
              <span className="absolute left-2 right-2 top-6 h-7 rounded-full bg-clay/70" />
            </div>
          </div>
          <ul className="space-y-2 text-base font-medium leading-7 text-carbon">
            {teaching.steps.slice(0, 3).map((step) => (
              <li className="flex gap-2" key={step}>
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-tertiary" />
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <TeachingCard title="主要训练肌群">
        <div className="flex flex-wrap gap-2">
          {[...teaching.primaryMuscles, ...teaching.secondaryMuscles].map((muscle) => (
            <span className="pill bg-acid text-carbon" key={muscle}>{muscle}</span>
          ))}
        </div>
      </TeachingCard>

      <TeachingCard title="怎么调">
        <p className="body-copy">{teaching.adjustment}</p>
      </TeachingCard>

      <TeachingCard title="标准使用步骤">
        <ol className="space-y-3">
          {teaching.steps.map((step, index) => (
            <li className="flex gap-3 text-base leading-7 text-slate" key={step}>
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-acid text-sm font-black text-carbon">
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
            <li className="rounded-xl border border-line bg-oat px-4 py-3 text-sm font-bold leading-6 text-carbon" key={item}>
              {item}
            </li>
          ))}
        </ul>
      </TeachingCard>

      <TeachingCard title="常见错误">
        <ul className="space-y-2">
          {teaching.commonErrors.map((item) => (
            <li className="rounded-xl border border-clay/20 bg-clay/10 px-4 py-3 text-sm font-bold leading-6 text-carbon" key={item}>
              {item}
            </li>
          ))}
        </ul>
      </TeachingCard>

      <section className="teaching-panel mt-4">
        <div className="teaching-panel-header">
          <span className="text-sm font-black text-clay">识别反馈</span>
          <button className="text-sm font-black text-carbon" onClick={() => setCorrectionOpen(true)} type="button">
            识别错了？纠错 →
          </button>
        </div>
        <button className="flex min-h-14 w-full items-center justify-between px-4 text-left text-sm font-black text-carbon" onClick={() => setCorrectionOpen(true)} type="button">
          <span>常见错误</span>
          <span className="text-xl text-tertiary">⌄</span>
        </button>
      </section>

      <div className="bottom-cta-shell">
        <button
          className="btn-acid"
          onClick={() => onOpenTrainingForm(equipment, teaching.zhName)}
          type="button"
        >
          记录本次训练
        </button>
      </div>

      {correctionOpen ? (
        <div className="correction-overlay" role="dialog" aria-modal="true" aria-label="识别纠错">
          <section className="correction-sheet">
            <div className="sheet-drag" />
            <div className="flex items-start justify-between gap-4 px-5 pt-4">
              <div>
                <h2 className="text-3xl font-black tracking-[-0.05em] text-fern">识别错了？</h2>
                <p className="mt-1 text-base leading-7 text-slate">选择正确器械后，会重新生成说明和搜索词</p>
              </div>
              <button className="icon-button text-carbon" onClick={() => setCorrectionOpen(false)} type="button" aria-label="关闭纠错">
                ×
              </button>
            </div>
            <div className="px-5 py-4">
              <input className="input-soft" placeholder="搜索器械..." readOnly value="" />
            </div>
            <div className="max-h-[23rem] overflow-y-auto border-y border-line bg-oat/50 px-5 py-3">
              {candidates.length > 0 ? (
                <CandidateList candidates={candidates} onSelect={selectCorrection} />
              ) : (
                <button className="btn-secondary" onClick={onWrongPrediction} type="button">
                  去支持器械列表选择
                </button>
              )}
            </div>
            <div className="px-5 pb-5 pt-3">
              <p className="text-sm font-black text-fern">已选择：{equipment.zhName}</p>
              <div className="mt-3 grid grid-cols-[1fr_2fr] gap-3">
                <button className="btn-secondary" onClick={() => setCorrectionOpen(false)} type="button">
                  取消
                </button>
                <button className="btn-acid" onClick={() => setCorrectionOpen(false)} type="button">
                  确认纠错
                </button>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}
