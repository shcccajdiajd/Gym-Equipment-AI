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
    <main className="mx-auto min-h-screen max-w-md px-4 pb-10 pt-5">
      <button className="mb-4 text-sm font-bold text-fern" onClick={onCancel} type="button">
        返回结果
      </button>
      <form className="rounded-[2rem] bg-white p-5 shadow-soft" onSubmit={handleSubmit}>
        <p className="text-xs font-black uppercase tracking-[0.24em] text-fern">Training Log</p>
        <h1 className="mt-1 text-3xl font-black text-ink">记录本次训练</h1>
        <p className="mt-2 text-sm text-ink/60">只记录这次器械训练，不做复杂计划。</p>

        <label className="mt-5 block text-sm font-black text-ink" htmlFor="training-date">
          日期
        </label>
        <input
          className="mt-2 w-full rounded-2xl bg-moss px-4 py-3 text-base font-bold text-ink outline-none"
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
          className="mt-2 w-full rounded-2xl bg-moss px-4 py-3 text-base font-bold text-ink outline-none"
          id="training-equipment"
          readOnly
          value={equipment.zhName}
        />

        <label className="mt-4 block text-sm font-black text-ink" htmlFor="training-exercise">
          动作名称
        </label>
        <input
          className="mt-2 w-full rounded-2xl bg-moss px-4 py-3 text-base font-bold text-ink outline-none"
          id="training-exercise"
          onChange={(event) => setExerciseName(event.target.value)}
          required
          value={exerciseName}
        />

        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="block text-sm font-black text-ink" htmlFor="training-sets">
            组数
            <input
              className="mt-2 w-full rounded-2xl bg-moss px-4 py-3 text-base font-bold text-ink outline-none"
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
              className="mt-2 w-full rounded-2xl bg-moss px-4 py-3 text-base font-bold text-ink outline-none"
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
          className="mt-2 w-full rounded-2xl bg-moss px-4 py-3 text-base font-bold text-ink outline-none"
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
          className="mt-2 min-h-24 w-full rounded-2xl bg-moss px-4 py-3 text-base text-ink outline-none"
          id="training-note"
          onChange={(event) => setNote(event.target.value)}
          placeholder="比如：动作更稳、重量略轻、肩膀感觉正常"
          value={note}
        />

        <button className="mt-5 w-full rounded-3xl bg-fern px-5 py-4 text-lg font-black text-white" type="submit">
          保存训练记录
        </button>
      </form>
    </main>
  );
}
