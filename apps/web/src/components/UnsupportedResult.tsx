import type { EquipmentCard } from '@gym-equipment-ai/shared';
import { useState } from 'react';
import { CandidateList } from './CandidateList.js';

type UnsupportedResultProps = {
  candidates: EquipmentCard[];
  message?: string;
  onRetake: () => void;
  onSelectCandidate: (equipment: EquipmentCard) => void;
};

export function UnsupportedResult({ candidates, message, onRetake, onSelectCandidate }: UnsupportedResultProps) {
  const [copied, setCopied] = useState(false);
  const genericQuery = '健身房器械 使用方法 新手教程';
  const hasCandidates = candidates.length > 0;

  async function copyGenericQuery() {
    await navigator.clipboard?.writeText(genericQuery);
    setCopied(true);
  }

  return (
    <main className="screen">
      <div className="app-topbar">
        <button className="icon-button" onClick={onRetake} type="button" aria-label="返回首页">
          ‹
        </button>
        <h1 className="app-topbar-title">{hasCandidates ? '我不太确定' : '暂未收录'}</h1>
        <span className="h-11 w-11" />
      </div>

      {hasCandidates ? (
        <>
          <section className="rounded-2xl bg-amber/25 p-4 text-[#92400e]">
            <p className="text-xl font-black">我不太确定</p>
            <p className="mt-1 text-sm font-bold leading-6">{message ?? '你看到的可能是以下器械之一'}</p>
          </section>
          <section className="unknown-hero py-6">
            <div className="grid h-[12.5rem] w-[12.5rem] place-items-center overflow-hidden rounded-2xl bg-carbon/20 text-4xl font-black text-white backdrop-blur">
              50%
            </div>
          </section>
          <CandidateList candidates={candidates} onSelect={onSelectCandidate} />
          <button className="mt-4 min-h-11 w-full rounded-full text-base font-black text-fern" onClick={onRetake} type="button">
            以上都不是？重新拍照
          </button>
        </>
      ) : (
        <>
          <section className="unknown-hero">
            <div className="unknown-illustration">?</div>
            <h1 className="mt-4 text-3xl font-black tracking-[-0.05em] text-fern">这台器械可能暂未收录</h1>
          </section>
          <section className="surface-card">
            <h2 className="text-xl font-black text-fern">建议重新拍照：</h2>
            <ul className="mt-3 space-y-3 text-base font-medium leading-7 text-carbon">
              <li>换一个角度，尽量拍到完整器械</li>
              <li>包含座椅、把手、配重片</li>
              <li>如果有器械铭牌，请对准铭牌</li>
            </ul>
            <p className="mt-4 rounded-xl bg-info/20 px-4 py-3 text-sm font-black text-info">
              你也可以查看我们支持的器械列表
            </p>
          </section>
          <button className="btn-acid mt-7" onClick={onRetake} type="button">
            重新拍照
          </button>
          <button className="btn-secondary mt-3" onClick={copyGenericQuery} type="button">
            {copied ? '已复制通用搜索词' : `复制通用搜索词：${genericQuery}`}
          </button>
        </>
      )}
    </main>
  );
}
