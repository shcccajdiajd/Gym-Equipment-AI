import type { EquipmentCard } from '@gym-equipment-ai/shared';
import { useMemo, useState } from 'react';
import { buildSearchTargets, isWeChatBrowser } from '../utils/searchTargets.js';
import { buildTutorialSearchQueries, getPrimarySearchQuery } from '../utils/searchQueries.js';

type PlatformSearchPanelProps = {
  equipment: EquipmentCard;
};

export function PlatformSearchPanel({ equipment }: PlatformSearchPanelProps) {
  const queries = buildTutorialSearchQueries(equipment);
  const queryOptions = [
    ['推荐搜索词', getPrimarySearchQuery(equipment)],
    ['中文基础', queries.basicZh],
    ['新手教学', queries.beginnerZh],
    ['目标肌群', queries.muscleZh],
    ['常见错误', queries.mistakesZh],
    ['英文教程', queries.english]
  ] as const;
  const [selectedQuery, setSelectedQuery] = useState(queryOptions[0][1]);
  const [copied, setCopied] = useState(false);
  const targets = useMemo(() => buildSearchTargets(selectedQuery), [selectedQuery]);
  const inWeChat = isWeChatBrowser();

  async function copySearchQuery() {
    await navigator.clipboard?.writeText(selectedQuery);
    setCopied(true);
  }

  return (
    <section className="rounded-[2rem] bg-ink p-5 text-white shadow-soft">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-moss">Tutorial Search</p>
          <h2 className="mt-1 text-2xl font-black">直接去搜教程</h2>
        </div>
        <span className="rounded-full bg-white/12 px-3 py-1 text-xs text-moss">重点功能</span>
      </div>

      {inWeChat ? (
        <p className="mb-4 rounded-2xl bg-clay/25 px-4 py-3 text-sm text-white">
          为了更好跳转 B站/抖音，请点击右上角，用浏览器打开。
        </p>
      ) : null}

      <label className="mb-3 block text-sm text-moss" htmlFor="query-select">
        选择搜索词
      </label>
      <select
        id="query-select"
        className="mb-4 w-full rounded-2xl border border-white/10 bg-white px-4 py-3 text-base font-bold text-ink"
        value={selectedQuery}
        onChange={(event) => setSelectedQuery(event.target.value)}
      >
        {queryOptions.map(([label, query]) => (
          <option key={`${label}-${query}`} value={query}>
            {label}：{query}
          </option>
        ))}
      </select>

      <div className="grid grid-cols-2 gap-3">
        {targets.map((target) => (
          <a
            className="rounded-2xl bg-white px-4 py-3 text-center text-sm font-black text-fern"
            href={target.url}
            key={target.id}
            rel="noreferrer"
            target="_blank"
            title={target.fallbackText}
          >
            {target.label}搜索
          </a>
        ))}
      </div>

      <button
        className="mt-3 w-full rounded-2xl border border-white/20 px-4 py-3 text-sm font-black text-white"
        onClick={copySearchQuery}
        type="button"
      >
        {copied ? '已复制搜索词' : '复制搜索词'}
      </button>

      <p className="mt-3 text-xs leading-5 text-moss">如果无法打开，请复制搜索词到 App 内搜索。</p>
    </section>
  );
}
