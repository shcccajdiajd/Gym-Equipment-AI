import type { EquipmentCard } from '@gym-equipment-ai/shared';
import { useState } from 'react';
import { getTodayDate, saveTrainingRecord } from '../utils/trainingRecords.js';

type TrainingRecordFormProps = {
  equipment: EquipmentCard;
  defaultExerciseName: string;
  onCancel: () => void;
  onSaved: () => void;
};

export function TrainingRecordForm({ equipment, defaultExerciseName, onCancel, onSaved }: TrainingRecordFormProps) {
  const [date, setDate] = useState(getTodayDate());
  const [exerciseName, setExerciseName] = useState(defaultExerciseName);
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [note, setNote] = useState('');

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveTrainingRecord({
      equipmentId: equipment.id,
      equipmentName: equipment.zhName,
      exerciseName: exerciseName.trim() || equipment.zhName,
      date,
      sets: Number(sets),
      reps: Number(reps),
      weight: weight.trim() ? Number(weight) : undefined,
      weightUnit: 'kg',
      note: note.trim()
    });
    onSaved();
  }

  return (
    <main className="screen">
      <button className="top-link" onClick={onCancel} type="button">
        返回结果
      </button>
      <form className="surface-card" onSubmit={handleSubmit}>
        <p className="eyebrow">Training Log</p>
        <h1 className="mt-1 text-3xl font-black tracking-[-0.04em] text-ink">记录本次训练</h1>
        <p className="mt-2 text-sm leading-6 text-slate">只记录这次器械训练，不做复杂计划。</p>

        <label className="mt-5 block text-sm font-black text-ink" htmlFor="training-date">
          日期
        </label>
        <input
          className="input-soft mt-2"
          id="training-date"
          onChange={(event) => setDate(event.target.value)}
          required
          type="date"
          value={date}
        />

        <label className="mt-4 block text-sm font-black text-ink" htmlFor="training-equipment">
          器械名称
        </label>
        <input
          className="input-soft mt-2 font-bold"
          id="training-equipment"
          readOnly
          value={equipment.zhName}
        />

        <label className="mt-4 block text-sm font-black text-ink" htmlFor="training-exercise">
          动作名称
        </label>
        <input
          className="input-soft mt-2 font-bold"
          id="training-exercise"
          onChange={(event) => setExerciseName(event.target.value)}
          required
          value={exerciseName}
        />

        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="block text-sm font-black text-ink" htmlFor="training-sets">
            组数
            <input
              className="input-soft mt-2 font-bold"
              id="training-sets"
              min="1"
              onChange={(event) => setSets(event.target.value)}
              required
              type="number"
              value={sets}
            />
          </label>
          <label className="block text-sm font-black text-ink" htmlFor="training-reps">
            每组次数
            <input
              className="input-soft mt-2 font-bold"
              id="training-reps"
              min="1"
              onChange={(event) => setReps(event.target.value)}
              required
              type="number"
              value={reps}
            />
          </label>
        </div>

        <label className="mt-4 block text-sm font-black text-ink" htmlFor="training-weight">
          重量 kg（选填）
        </label>
        <input
          className="input-soft mt-2 font-bold"
          id="training-weight"
          min="0"
          onChange={(event) => setWeight(event.target.value)}
          step="0.5"
          type="number"
          value={weight}
        />

        <label className="mt-4 block text-sm font-black text-ink" htmlFor="training-note">
          备注（选填）
        </label>
        <textarea
          className="input-soft mt-2 min-h-24"
          id="training-note"
          onChange={(event) => setNote(event.target.value)}
          placeholder="比如：动作更稳、重量略轻、肩膀感觉正常"
          value={note}
        />

        <button className="btn-primary mt-5 text-lg" type="submit">
          保存训练记录
        </button>
      </form>
    </main>
  );
}
