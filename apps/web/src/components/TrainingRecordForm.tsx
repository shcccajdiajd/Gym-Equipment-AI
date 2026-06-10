import type { EquipmentCard } from '@gym-equipment-ai/shared';
import { type FormEvent, useState } from 'react';
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
  const [error, setError] = useState('');

  function updateNumericValue(value: string, nextValue: number) {
    return String(Math.max(1, Number(value || 0) + nextValue));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!sets || !reps || Number(sets) <= 0 || Number(reps) <= 0) {
      setError('请填写组数和次数');
      return;
    }

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
      <div className="app-topbar">
        <button className="icon-button" onClick={onCancel} type="button" aria-label="取消记录">
          ×
        </button>
        <h1 className="app-topbar-title">记录本次训练</h1>
        <button className="h-11 rounded-full px-2 text-base font-black text-fern" form="training-record-form" type="submit">
          保存
        </button>
      </div>
      <form className="form-card" id="training-record-form" onSubmit={handleSubmit}>
        <label className="field-block block" htmlFor="training-date">
          <span className="field-label">日期</span>
          <input
            className="mt-1 w-full bg-transparent text-2xl font-medium text-carbon outline-none"
            id="training-date"
            onChange={(event) => setDate(event.target.value)}
            required
            type="date"
            value={date}
          />
        </label>

        <label className="field-block block" htmlFor="training-equipment">
          <span className="field-label">器械</span>
          <input
            className="mt-2 w-full rounded-xl bg-line px-3 py-3 text-xl font-black text-carbon outline-none"
            id="training-equipment"
            readOnly
            value={equipment.zhName}
          />
        </label>

        <label className="field-block flex items-center justify-between gap-4" htmlFor="training-exercise">
          <span>
            <span className="field-label">动作</span>
            <input
              className="mt-1 w-full bg-transparent text-xl font-medium text-carbon outline-none"
              id="training-exercise"
              onChange={(event) => setExerciseName(event.target.value)}
              required
              value={exerciseName}
            />
          </span>
          <span className="text-2xl text-fern">✎</span>
        </label>

        <div className="field-block space-y-4">
          <div className="flex items-center justify-between gap-4">
            <label className="text-xl font-black text-carbon" htmlFor="training-sets">
              <span className="block text-sm font-medium text-carbon">Sets <span className="font-black text-clay">(REQUIRED)</span></span>
              组数 <span className="text-clay">*</span>
            </label>
            <div className="stepper">
              <button className="stepper-button" onClick={() => setSets(updateNumericValue(sets, -1))} type="button">−</button>
              <input
                className="stepper-value w-14 bg-white text-center outline-none"
                id="training-sets"
                min="1"
                onChange={(event) => setSets(event.target.value)}
                required
                type="number"
                value={sets}
              />
              <button className="stepper-button" onClick={() => setSets(updateNumericValue(sets, 1))} type="button">+</button>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4">
            <label className="text-xl font-black text-carbon" htmlFor="training-reps">
              <span className="block text-sm font-medium text-carbon">Reps <span className="font-black text-clay">(REQUIRED)</span></span>
              每组次数 <span className="text-clay">*</span>
            </label>
            <div className="stepper">
              <button className="stepper-button" onClick={() => setReps(updateNumericValue(reps, -1))} type="button">−</button>
              <input
                className="stepper-value w-14 bg-white text-center outline-none"
                id="training-reps"
                min="1"
                onChange={(event) => setReps(event.target.value)}
                required
                type="number"
                value={reps}
              />
              <button className="stepper-button" onClick={() => setReps(updateNumericValue(reps, 1))} type="button">+</button>
            </div>
          </div>
        </div>

        <label className="field-block flex items-center justify-between gap-4" htmlFor="training-weight">
          <span className="text-xl font-black text-carbon">重量</span>
          <span className="inline-flex h-[3.25rem] items-center overflow-hidden rounded-xl border border-tertiary/70 bg-white">
            <input
              className="h-full w-20 px-3 text-xl font-medium outline-none"
              id="training-weight"
              min="0"
              onChange={(event) => setWeight(event.target.value)}
              step="0.5"
              type="number"
              value={weight}
            />
            <span className="px-3 text-xl font-medium text-slate">kg</span>
          </span>
        </label>

        <label className="field-block block" htmlFor="training-note">
          <span className="text-xl font-black text-carbon">备注</span>
          <textarea
            className="mt-2 min-h-28 w-full rounded-xl border border-tertiary/70 bg-white px-4 py-3 text-base text-carbon outline-none placeholder:text-tertiary"
            id="training-note"
            onChange={(event) => setNote(event.target.value)}
            placeholder="例如：今天胸肌发力感很好..."
            value={note}
          />
        </label>

        {error ? <p className="error-banner mt-4">{error}</p> : null}

        <button className="btn-acid mt-6 text-lg" type="submit">
          保存训练记录
        </button>
        <button className="mt-4 min-h-11 w-full text-base font-black text-slate" onClick={onCancel} type="button">
          稍后再记
        </button>
      </form>
    </main>
  );
}
