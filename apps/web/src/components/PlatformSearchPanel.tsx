import type { EquipmentCard, EquipmentExerciseVariant } from '@gym-equipment-ai/shared';
import { useEffect, useMemo, useState } from 'react';
import { buildSearchTargets, isWeChatBrowser } from '../utils/searchTargets.js';
import { buildTutorialSearchQueries, getPrimarySearchQuery } from '../utils/searchQueries.js';
import { trackEvent } from '../utils/analytics.js';

type PlatformSearchPanelProps = {
  equipment: EquipmentCard;
  variant?: EquipmentExerciseVariant;
};

const platformStyles = {
  bilibili: 'bg-[#F35B8F]',
  douyin: 'bg-carbon',
  xiaohongshu: 'bg-[#FF3347]',
  baidu: 'bg-[#335BFF]'
};

const platformShortLabels = {
  bilibili: 'B',
  douyin: '抖',
  xiaohongshu: '红',
  baidu: '百'
};

export function PlatformSearchPanel({ equipment, variant }: PlatformSearchPanelProps) {
  const queries = buildTutorialSearchQueries(equipment, variant);
  const primaryQuery = getPrimarySearchQuery(equipment, variant);
  const queryOptions = [
    ['推荐搜索词', primaryQuery],
    ['中文基础', queries.basicZh],
    ['新手教学', queries.beginnerZh],
    ['目标肌群', queries.muscleZh],
    ['常见错误', queries.mistakesZh],
    ['英文教程', queries.english]
  ] as const;
  const [selectedQuery, setSelectedQuery] = useState(primaryQuery);
  const [copied, setCopied] = useState(false);
  const targets = useMemo(() => buildSearchTargets(selectedQuery), [selectedQuery]);
  const inWeChat = isWeChatBrowser();

  useEffect(() => {
    setSelectedQuery(primaryQuery);
    setCopied(false);
  }, [primaryQuery]);

  async function copySearchQuery() {
    await navigator.clipboard?.writeText(selectedQuery);
    void trackEvent('copy_query', {
      properties: {
        equipmentId: equipment.id,
        variantId: variant?.id ?? null,
        query: selectedQuery
      }
    });
    setCopied(true);
  }

  return (
    <section className="search-shell">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[2rem] font-black leading-tight tracking-[-0.055em]">搜教程</h2>
          <p className="mt-1 text-sm font-black text-carbon/70">把器械变成可搜索的问题，不用猜关键词</p>
        </div>
        <span className="text-3xl font-black">⌁</span>
      </div>

      {inWeChat ? (
        <p className="mb-4 rounded-xl bg-white/80 px-4 py-3 text-sm font-black leading-6 text-[#92400e]">
          为了更好跳转 B站/抖音，请点击右上角，用浏览器打开。
        </p>
      ) : null}

      <div className="query-card">
        <div className="flex items-center justify-between gap-3">
          <p className="break-words text-lg font-black leading-snug tracking-[-0.03em] text-carbon">{selectedQuery}</p>
          <button
            className="min-h-10 shrink-0 rounded-full border border-fern bg-acid px-3 text-sm font-black text-carbon"
            onClick={copySearchQuery}
            type="button"
          >
            {copied ? '已复制' : '一键复制'}
          </button>
        </div>
      </div>

      <label className="sr-only" htmlFor="query-select">选择搜索词</label>
      <select
        id="query-select"
        className="mt-3 w-full rounded-xl border border-white/60 bg-white px-4 py-3 text-base font-black text-carbon"
        value={selectedQuery}
        onChange={(event) => setSelectedQuery(event.target.value)}
      >
        {queryOptions.map(([label, query]) => (
          <option key={`${label}-${query}`} value={query}>
            {label}：{query}
          </option>
        ))}
      </select>

      <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {queryOptions.map(([label, query]) => (
          <button
            className={`query-chip transition active:scale-[0.98] ${
              selectedQuery === query ? 'ring-2 ring-fern' : ''
            }`}
            key={`${label}-chip-${query}`}
            onClick={() => setSelectedQuery(query)}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {targets.map((target) => (
          <a
            className="platform-button"
            href={target.url}
            key={target.id}
            onClick={() => {
              void trackEvent('search_click', {
                properties: {
                  equipmentId: equipment.id,
                  variantId: variant?.id ?? null,
                  platform: target.id,
                  query: selectedQuery
                }
              });
            }}
            rel="noreferrer"
            target="_blank"
            title={target.fallbackText}
          >
            <span className={`platform-icon ${platformStyles[target.id]}`}>
              {platformShortLabels[target.id]}
            </span>
            {target.label}搜索
          </a>
        ))}
      </div>

      <button
        className="help-strip mt-4 w-full transition active:scale-[0.99]"
        onClick={copySearchQuery}
        type="button"
      >
        无法打开？{copied ? '已复制搜索词' : '复制搜索词到 App 内搜索'}
      </button>
    </section>
  );
}
