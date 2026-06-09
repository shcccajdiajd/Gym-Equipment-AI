import type { EquipmentCard, EquipmentExerciseVariant } from '@gym-equipment-ai/shared';
import { useEffect, useMemo, useState } from 'react';
import { buildSearchTargets, isWeChatBrowser } from '../utils/searchTargets.js';
import { buildTutorialSearchQueries, getPrimarySearchQuery } from '../utils/searchQueries.js';
import { trackEvent } from '../utils/analytics.js';

type PlatformSearchPanelProps = {
  equipment: EquipmentCard;
  variant?: EquipmentExerciseVariant;
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
          <p className="text-xs font-black uppercase tracking-[0.24em] text-moss">Tutorial Query</p>
          <h2 className="mt-1 text-[1.75rem] font-black leading-tight tracking-[-0.05em]">直接拿去搜教程</h2>
          <p className="mt-2 text-sm leading-6 text-moss/90">把器械变成可搜索的问题，不用猜关键词，直接拿这句话去内容平台找教程。</p>
        </div>
        <span className="pill shrink-0 bg-white/12 text-moss">重点功能</span>
      </div>

      {inWeChat ? (
        <p className="mb-4 rounded-2xl bg-clay/25 px-4 py-3 text-sm font-bold leading-6 text-white">
          为了更好跳转 B站/抖音，请点击右上角，用浏览器打开。
        </p>
      ) : null}

      <div className="query-card">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-moss">Recommended</p>
          <span className="rounded-full bg-amber px-2.5 py-1 text-[0.68rem] font-black text-ink">新手推荐</span>
        </div>
        <p className="mt-3 break-words text-[1.42rem] font-black leading-snug tracking-[-0.03em] text-white">{selectedQuery}</p>
      </div>

      <label className="sr-only" htmlFor="query-select">选择搜索词</label>
      <select
        id="query-select"
        className="mt-3 w-full rounded-[1.15rem] border border-white/10 bg-white px-4 py-3 text-base font-black text-ink"
        value={selectedQuery}
        onChange={(event) => setSelectedQuery(event.target.value)}
      >
        {queryOptions.map(([label, query]) => (
          <option key={`${label}-${query}`} value={query}>
            {label}：{query}
          </option>
        ))}
      </select>

      <div className="mt-3 flex flex-wrap gap-2">
        {queryOptions.map(([label, query]) => (
          <button
            className={`min-h-10 rounded-full px-3 py-2 text-xs font-black transition active:scale-[0.98] ${
              selectedQuery === query ? 'bg-amber text-ink' : 'bg-white/10 text-moss'
            }`}
            key={`${label}-chip-${query}`}
            onClick={() => setSelectedQuery(query)}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>

      <p className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-moss">Search Platform</p>
      <div className="mt-4 grid grid-cols-2 gap-3">
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
            {target.label}搜索
          </a>
        ))}
      </div>

      <button
        className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-[1rem] border border-white/20 bg-white/[0.04] px-4 py-3 text-sm font-black text-white transition active:scale-[0.99]"
        onClick={copySearchQuery}
        type="button"
      >
        {copied ? '已复制搜索词' : '复制搜索词'}
      </button>

      <p className="mt-3 text-xs leading-5 text-moss/90">如果无法打开，请复制搜索词到 App 内搜索。</p>
    </section>
  );
}
