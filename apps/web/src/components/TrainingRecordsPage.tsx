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
    <svg aria-label="单器械重量进步曲线" className="mt-4 w-full overflow-visible rounded-[1.25rem] bg-white/70 p-1" role="img" viewBox={`0 0 ${width} ${height}`}>
      <line stroke="#dce8d8" strokeWidth="2" x1={padding} x2={padding} y1={padding} y2={height - padding} />
      <line
        stroke="#dce8d8"
        strokeWidth="2"
        x1={padding}
        x2={width - padding}
        y1={height - padding}
        y2={height - padding}
      />
      <polyline fill="none" points={line} stroke="#1f7a4d" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
      {chartPoints.map((point) => (
        <g key={`${point.date}-${point.weight}`}>
          <circle cx={point.x} cy={point.y} fill="#1f7a4d" r="5" />
          <text fill="#13231a" fontSize="10" textAnchor="middle" x={point.x} y={height - 8}>
            {point.date.slice(5)}
          </text>
        </g>
      ))}
      <text fill="#65756b" fontSize="10" x={padding} y={18}>
        {maxWeight}kg
      </text>
      <text fill="#65756b" fontSize="10" x={padding} y={height - padding - 6}>
        {minWeight}kg
      </text>
    </svg>
  );
}

function ProgressSummaryCards({ summary }: { summary: ProgressSummary }) {
  return (
    <div className="mt-4 grid grid-cols-3 gap-2">
      <div className="rounded-[1rem] bg-moss p-3">
        <p className="text-xs font-bold text-slate">最近重量</p>
        <p className="mt-1 text-lg font-black text-ink">{summary.latestWeight}kg</p>
      </div>
      <div className="rounded-[1rem] bg-moss p-3">
        <p className="text-xs font-bold text-slate">最高重量</p>
        <p className="mt-1 text-lg font-black text-ink">{summary.maxWeight}kg</p>
      </div>
      <div className="rounded-[1rem] bg-moss p-3">
        <p className="text-xs font-bold text-slate">较首次</p>
        <p className="mt-1 text-lg font-black text-ink">{summary.improvement >= 0 ? '+' : ''}{summary.improvement}kg</p>
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
    <article className="rounded-[1.2rem] border border-line/70 bg-white p-4 shadow-press">
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
        <span className="block text-lg font-black tracking-[-0.02em] text-ink">{record.equipmentName}</span>
        <span className="mt-1 block text-sm font-bold text-slate">{record.exerciseName}</span>
        <span className="mt-3 inline-flex rounded-[0.9rem] bg-moss px-3 py-2 text-sm font-black text-fern">
          {record.sets} 组 x {record.reps} 次 · {formatWeight(record.weight)}
        </span>
        {record.note ? <span className="mt-3 block text-sm leading-6 text-slate">{record.note}</span> : null}
      </button>
      <button className="mt-3 min-h-10 rounded-full bg-clay/10 px-3 text-sm font-black text-clay" onClick={() => onDelete(record.id)} type="button">
        删除记录
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
      <button className="top-link" onClick={onBack} type="button">
        返回首页
      </button>
      <h1 className="page-title">我的训练记录</h1>
      <p className="mt-3 text-sm leading-6 text-slate">轻量记录器械训练，看看重量有没有一点点往上走。</p>

      <section className="surface-card mt-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="eyebrow">Training Log</p>
            <h2 className="section-title mt-1">训练日志</h2>
            <p className="mt-1 text-sm font-bold text-slate">按日期查看</p>
          </div>
          <button className="min-h-11 shrink-0 rounded-full bg-moss px-4 text-sm font-black text-fern" onClick={() => setSelectedDate('')} type="button">
            全部日期
          </button>
        </div>
        <div className="mt-4 grid grid-cols-7 gap-1.5 rounded-[1.2rem] bg-oat/80 p-2">
          {weekDays.map((day) => {
            const selected = day.date === selectedDate;
            const hasRecord = recordDates.has(day.date);

            return (
              <button
                aria-label={`${day.weekday} ${day.dayLabel}`}
                className="flex min-h-[4.6rem] flex-col items-center gap-1 rounded-[1rem] py-2 transition active:scale-[0.98]"
                data-selected-date={selected ? day.date : undefined}
                key={day.date}
                onClick={() => setSelectedDate(day.date)}
                type="button"
              >
                <span className="text-[0.68rem] font-black text-slate">{day.weekday}</span>
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-black ${
                    selected ? 'bg-fern text-white shadow-press' : 'bg-white text-fern'
                  }`}
                >
                  {day.dayLabel.split('/')[1]}
                </span>
                <span className={`h-1.5 w-1.5 rounded-full ${hasRecord ? 'bg-fern' : 'bg-transparent'}`} />
              </button>
            );
          })}
        </div>

        <div className="mt-5 space-y-3">
          {selectedDate && visibleRecords.length === 0 ? (
            <div className="rounded-[1.2rem] bg-moss p-5">
              <p className="text-lg font-black text-ink">这一天还没有训练记录</p>
              <p className="mt-2 text-sm leading-6 text-slate">识别器械后点击‘记录本次训练’开始记录</p>
            </div>
          ) : visibleRecords.length === 0 ? (
            <p className="rounded-[1.2rem] bg-moss p-4 text-sm font-bold leading-6 text-slate">还没有训练记录。识别器械后可以记录本次训练。</p>
          ) : (
            groupedRecords.map((group) => (
              <section className="space-y-3" key={group.date}>
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-sm font-black text-slate">{getDateGroupLabel(group.date)}</h3>
                  <span className="rounded-full bg-moss px-2 py-1 text-xs font-black text-fern">{group.records.length} 条记录</span>
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

      <section className="surface-card-muted mt-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Progress</p>
            <h2 className="section-title mt-1">进步曲线</h2>
            <p className="mt-1 text-sm font-bold text-slate">按器械看重量趋势</p>
          </div>
          <select
            className="min-h-11 max-w-36 rounded-[1rem] bg-moss px-3 py-2 text-sm font-black text-fern outline-none"
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
