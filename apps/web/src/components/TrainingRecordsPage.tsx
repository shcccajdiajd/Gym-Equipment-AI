import { equipmentCatalog, getEquipmentCard, type EquipmentCard } from '@gym-equipment-ai/shared';
import { useMemo, useState } from 'react';
import type { ProgressPoint, ProgressSummary, TrainingRecord } from '../types.js';
import {
  buildProgressSeries,
  deleteTrainingRecord,
  filterTrainingRecordsByEquipment,
  readTrainingRecords
} from '../utils/trainingRecords.js';

type TrainingRecordsPageProps = {
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
    <svg aria-label="单器械重量进步曲线" className="mt-4 w-full" role="img" viewBox={`0 0 ${width} ${height}`}>
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
      <div className="rounded-2xl bg-moss p-3">
        <p className="text-xs text-ink/55">最近重量</p>
        <p className="mt-1 text-lg font-black text-ink">{summary.latestWeight}kg</p>
      </div>
      <div className="rounded-2xl bg-moss p-3">
        <p className="text-xs text-ink/55">最高重量</p>
        <p className="mt-1 text-lg font-black text-ink">{summary.maxWeight}kg</p>
      </div>
      <div className="rounded-2xl bg-moss p-3">
        <p className="text-xs text-ink/55">较首次</p>
        <p className="mt-1 text-lg font-black text-ink">{summary.improvement >= 0 ? '+' : ''}{summary.improvement}kg</p>
      </div>
    </div>
  );
}

export function TrainingRecordsPage({ onBack, onOpenEquipment }: TrainingRecordsPageProps) {
  const [records, setRecords] = useState<TrainingRecord[]>(() =>
    typeof localStorage === 'undefined' ? [] : readTrainingRecords()
  );
  const [equipmentFilter, setEquipmentFilter] = useState('');
  const visibleRecords = useMemo(
    () => filterTrainingRecordsByEquipment(records, equipmentFilter),
    [equipmentFilter, records]
  );
  const selectedEquipmentId = equipmentFilter || visibleRecords[0]?.equipmentId || '';
  const selectedEquipmentRecords = filterTrainingRecordsByEquipment(records, selectedEquipmentId);
  const progress = buildProgressSeries(selectedEquipmentRecords);

  function removeRecord(id: string) {
    if (typeof localStorage === 'undefined') {
      return;
    }
    setRecords(deleteTrainingRecord(id));
  }

  return (
    <main className="mx-auto min-h-screen max-w-md px-4 pb-10 pt-5">
      <button className="mb-4 text-sm font-bold text-fern" onClick={onBack} type="button">
        返回首页
      </button>
      <h1 className="text-3xl font-black text-ink">我的训练记录</h1>
      <p className="mt-2 text-sm leading-6 text-ink/60">轻量记录器械训练，看看重量有没有一点点往上走。</p>

      <section className="mt-4 rounded-[2rem] bg-white p-5 shadow-soft">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-fern">Progress</p>
            <h2 className="mt-1 text-2xl font-black text-ink">进步曲线</h2>
          </div>
          <select
            className="max-w-36 rounded-2xl bg-moss px-3 py-2 text-sm font-bold text-fern outline-none"
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
          <p className="mt-4 rounded-3xl bg-moss p-4 text-sm font-bold text-fern">
            继续记录几次后即可看到进步曲线
          </p>
        )}
      </section>

      <section className="mt-4">
        <h2 className="text-xl font-black text-ink">历史记录</h2>
        <div className="mt-3 space-y-3">
          {visibleRecords.length === 0 ? (
            <p className="rounded-3xl bg-white p-4 text-ink/65">还没有训练记录。识别器械后可以记录本次训练。</p>
          ) : (
            visibleRecords.map((record) => {
              const equipment = getEquipmentCard(record.equipmentId);

              return (
                <article className="rounded-3xl bg-white p-4 shadow-soft" key={record.id}>
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
                    <span className="block text-xs font-bold text-ink/50">{record.date}</span>
                    <span className="mt-1 block text-lg font-black text-ink">{record.equipmentName}</span>
                    <span className="mt-1 block text-sm text-ink/60">{record.exerciseName}</span>
                    <span className="mt-3 block rounded-2xl bg-moss px-3 py-2 text-sm font-bold text-fern">
                      {record.sets} 组 x {record.reps} 次 · {formatWeight(record.weight)}
                    </span>
                    {record.note ? <span className="mt-2 block text-sm text-ink/55">{record.note}</span> : null}
                  </button>
                  <button
                    className="mt-3 text-sm font-black text-clay"
                    onClick={() => removeRecord(record.id)}
                    type="button"
                  >
                    删除记录
                  </button>
                </article>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}
