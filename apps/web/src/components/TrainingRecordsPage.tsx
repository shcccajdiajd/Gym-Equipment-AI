import { equipmentCatalog, getEquipmentCard, type EquipmentCard } from '@gym-equipment-ai/shared';
import { useMemo, useState } from 'react';
import type { ProgressPoint, ProgressSummary, TrainingRecord } from '../types.js';
import {
  buildProgressSeries,
  deleteTrainingRecord,
  filterTrainingRecordsByDate,
  filterTrainingRecordsByEquipment,
  getCurrentWeekDays,
  groupTrainingRecordsByDate,
  readTrainingRecords
} from '../utils/trainingRecords.js';

type TrainingRecordsPageProps = {
  initialSelectedDate?: string;
  onBack: () => void;
  onOpenEquipment: (equipment: EquipmentCard) => void;
};

function formatWeight(value?: number) {
  return typeof value === 'number' ? `${value} kg` : '未记录';
}

function ProgressChart({ points }: { points: ProgressPoint[] }) {
  const width = 320;
  const height = 160;
  const padding = 28;
  const weights = points.map((point) => point.weight);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);
  const range = maxWeight - minWeight || 1;
  const xStep = points.length > 1 ? (width - padding * 2) / (points.length - 1) : 0;
  const chartPoints = points.map((point, index) => ({
    ...point,
    x: padding + index * xStep,
    y: height - padding - ((point.weight - minWeight) / range) * (height - padding * 2)
  }));
  const line = chartPoints.map((point) => `${point.x},${point.y}`).join(' ');

  return (
    <svg aria-label="单器械重量进步曲线" className="mt-4 w-full overflow-visible rounded-[1.25rem] bg-white p-1" role="img" viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id="progressFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#C4FF3D" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#C4FF3D" stopOpacity="0" />
        </linearGradient>
      </defs>
      <line stroke="#E5E7EB" strokeWidth="2" x1={padding} x2={padding} y1={padding} y2={height - padding} />
      <line
        stroke="#E5E7EB"
        strokeWidth="2"
        x1={padding}
        x2={width - padding}
        y1={height - padding}
        y2={height - padding}
      />
      <polygon
        fill="url(#progressFill)"
        points={`${padding},${height - padding} ${line} ${width - padding},${height - padding}`}
      />
      <polyline fill="none" points={line} stroke="#C4FF3D" strokeLinecap="round" strokeLinejoin="round" strokeWidth="5" />
      {chartPoints.map((point) => (
        <g key={`${point.date}-${point.weight}`}>
          <circle cx={point.x} cy={point.y} fill="#1F4D2E" r="5" />
          <text fill="#6B7280" fontSize="10" textAnchor="middle" x={point.x} y={height - 8}>
            {point.date.slice(5)}
          </text>
        </g>
      ))}
      <text fill="#6B7280" fontSize="10" x={padding} y={18}>
        {maxWeight}kg
      </text>
      <text fill="#6B7280" fontSize="10" x={padding} y={height - padding - 6}>
        {minWeight}kg
      </text>
    </svg>
  );
}

function ProgressSummaryCards({ summary }: { summary: ProgressSummary }) {
  return (
    <div className="mt-4 grid grid-cols-3 rounded-t-[1.25rem] border border-line bg-white py-3">
      <div className="summary-metric">
        <p className="text-xs font-medium text-carbon">最近 {summary.latestWeight} kg</p>
        <p className="mt-1 text-3xl font-black text-fern">{summary.latestWeight}</p>
      </div>
      <div className="summary-metric">
        <p className="text-xs font-medium text-carbon">最高 {summary.maxWeight} kg</p>
        <p className="mt-1 text-3xl font-black text-fern">{summary.maxWeight}</p>
      </div>
      <div className="summary-metric">
        <p className="text-xs font-medium text-carbon">较首次</p>
        <p className="mt-1 text-3xl font-black text-[#2f8a25]">{summary.improvement >= 0 ? '+' : ''}{summary.improvement}</p>
      </div>
    </div>
  );
}

function getDateGroupLabel(date: string) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const todayKey = today.toISOString().slice(0, 10);
  const yesterdayKey = yesterday.toISOString().slice(0, 10);

  if (date === todayKey) {
    return '今天';
  }

  if (date === yesterdayKey) {
    return '昨天';
  }

  return date;
}

function DateRecordCard({
  record,
  onDelete,
  onOpenEquipment
}: {
  record: TrainingRecord;
  onDelete: (id: string) => void;
  onOpenEquipment: (equipment: EquipmentCard) => void;
}) {
  const equipment = getEquipmentCard(record.equipmentId);

  return (
    <article className="record-card">
      <button
        className="w-full text-left"
        disabled={!equipment}
        onClick={() => {
          if (equipment) {
            onOpenEquipment(equipment);
          }
        }}
        type="button"
      >
        <span className="block text-2xl font-black tracking-[-0.04em] text-fern">{record.equipmentName}</span>
        <span className="mt-1 block text-base font-medium text-slate">{record.exerciseName}</span>
        <span className="mt-3 block text-xl font-medium text-carbon">
          {record.sets} 组 x {record.reps} 次 · {formatWeight(record.weight)}
        </span>
        {record.note ? <span className="mt-3 block text-base italic leading-6 text-slate">{record.note}</span> : null}
      </button>
      <button className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full text-3xl font-light leading-none text-tertiary" onClick={() => onDelete(record.id)} type="button" aria-label="删除记录">
        ×
      </button>
    </article>
  );
}

export function TrainingRecordsPage({ initialSelectedDate = '', onBack, onOpenEquipment }: TrainingRecordsPageProps) {
  const [records, setRecords] = useState<TrainingRecord[]>(() =>
    typeof localStorage === 'undefined' ? [] : readTrainingRecords()
  );
  const [equipmentFilter, setEquipmentFilter] = useState('');
  const [selectedDate, setSelectedDate] = useState(initialSelectedDate);
  const weekDays = useMemo(() => getCurrentWeekDays(), []);
  const filteredByEquipment = useMemo(
    () => filterTrainingRecordsByEquipment(records, equipmentFilter),
    [equipmentFilter, records]
  );
  const visibleRecords = useMemo(
    () => filterTrainingRecordsByDate(filteredByEquipment, selectedDate),
    [filteredByEquipment, selectedDate]
  );
  const groupedRecords = useMemo(() => groupTrainingRecordsByDate(visibleRecords), [visibleRecords]);
  const recordDates = useMemo(() => new Set(records.map((record) => record.date)), [records]);
  const selectedEquipmentId = equipmentFilter || filteredByEquipment[0]?.equipmentId || '';
  const selectedEquipmentRecords = filterTrainingRecordsByEquipment(records, selectedEquipmentId);
  const progress = buildProgressSeries(selectedEquipmentRecords);

  function removeRecord(id: string) {
    if (typeof localStorage === 'undefined') {
      return;
    }
    setRecords(deleteTrainingRecord(id));
  }

  return (
    <main className="screen">
      <div className="app-topbar">
        <button className="icon-button" onClick={onBack} type="button" aria-label="返回首页">
          ‹
        </button>
        <h1 className="app-topbar-title">我的训练记录</h1>
        <button className="icon-button" type="button" aria-label="设置">
          ⚙
        </button>
      </div>
      <p className="text-base leading-7 text-slate">按日期查看轻量训练记录</p>

      <section className="surface-card mt-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="section-title">训练日志</h2>
            <p className="mt-1 text-sm font-bold text-slate">按日期查看</p>
          </div>
          <button className="min-h-11 shrink-0 rounded-full px-3 text-sm font-black text-fern" onClick={() => setSelectedDate('')} type="button">
            全部日期
          </button>
        </div>
        <div className="mt-4 flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {weekDays.map((day) => {
            const selected = day.date === selectedDate;
            const hasRecord = recordDates.has(day.date);

            return (
              <button
                aria-label={`${day.weekday} ${day.dayLabel}`}
                className={`log-date-card ${selected ? 'log-date-card-selected' : ''}`}
                data-selected-date={selected ? day.date : undefined}
                key={day.date}
                onClick={() => setSelectedDate(day.date)}
                type="button"
              >
                <span className="text-base font-black">{day.weekday}</span>
                <span className="text-xl font-black">{day.dayLabel}</span>
                <span className={`h-1.5 w-1.5 rounded-full ${hasRecord ? selected ? 'bg-carbon' : 'bg-acid' : 'bg-transparent'}`} />
              </button>
            );
          })}
        </div>

        <div className="mt-5 space-y-3">
          {selectedDate && visibleRecords.length === 0 ? (
            <div className="surface-card grid min-h-44 place-items-center text-center">
              <div>
              <span className="mx-auto grid h-20 w-20 place-items-center rounded-2xl text-5xl text-tertiary">▦</span>
              <p className="mt-3 text-lg font-black text-carbon">这一天还没有训练记录</p>
              <p className="mt-2 text-sm leading-6 text-slate">识别器械后点击‘记录本次训练’开始记录</p>
              </div>
            </div>
          ) : visibleRecords.length === 0 ? (
            <p className="rounded-[1.2rem] bg-moss p-4 text-sm font-bold leading-6 text-slate">还没有训练记录。识别器械后可以记录本次训练。</p>
          ) : (
            groupedRecords.map((group) => (
              <section className="space-y-3" key={group.date}>
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-2xl font-black tracking-[-0.04em] text-fern">{getDateGroupLabel(group.date)}</h3>
                  <span className="text-sm font-black text-slate">{group.records.length} 条记录</span>
                </div>
                {group.records.map((record) => (
                  <DateRecordCard
                    key={record.id}
                    onDelete={removeRecord}
                    onOpenEquipment={onOpenEquipment}
                    record={record}
                  />
                ))}
              </section>
            ))
          )}
        </div>
      </section>

      <section className="surface-card-muted mt-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="section-title">进步曲线</h2>
            <p className="mt-1 text-sm font-bold text-slate">按器械看重量趋势</p>
          </div>
          <select
            className="min-h-11 max-w-36 rounded-xl border border-line bg-white px-3 py-2 text-sm font-black text-fern outline-none"
            onChange={(event) => setEquipmentFilter(event.target.value)}
            value={equipmentFilter}
          >
            <option value="">选择器械</option>
            {equipmentCatalog.map((equipment) => (
              <option key={equipment.id} value={equipment.id}>
                {equipment.zhName}
              </option>
            ))}
          </select>
        </div>

        {progress.summary ? (
          <>
            <ProgressSummaryCards summary={progress.summary} />
            <ProgressChart points={progress.points} />
          </>
        ) : (
          <p className="mt-4 rounded-[1.35rem] bg-moss p-4 text-sm font-bold leading-6 text-fern">
            记录同一器械 2 次以上，即可看到重量变化曲线
          </p>
        )}
      </section>
    </main>
  );
}
