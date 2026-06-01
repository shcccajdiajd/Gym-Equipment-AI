import { equipmentCatalog, getEquipmentCard, type EquipmentCard } from '@gym-equipment-ai/shared';
import { useMemo, useRef, useState } from 'react';
import { CandidateList } from './components/CandidateList.js';
import { EquipmentResult } from './components/EquipmentResult.js';
import { UnsupportedResult } from './components/UnsupportedResult.js';
import type { HistoryItem, RecognitionPayload } from './types.js';
import { compressImageToBase64, ImageTooLargeError } from './utils/image.js';
import { addHistoryItem, readHistory, recordWrongPrediction } from './utils/history.js';
import { recognizeEquipmentImage } from './utils/api.js';
import { isWeChatBrowser } from './utils/searchTargets.js';

type AppView = 'home' | 'recognizing' | 'result' | 'unsupported' | 'equipment-list' | 'history';

type ResultState = {
  payload: RecognitionPayload;
  equipment?: EquipmentCard;
  previewUrl?: string;
};

function getCandidates(ids: string[] = []) {
  return ids.map((id) => getEquipmentCard(id)).filter((item): item is EquipmentCard => Boolean(item));
}

function getSimilarCandidates(equipment?: EquipmentCard) {
  return getCandidates(equipment?.similarEquipmentIds ?? []).slice(0, 4);
}

export function App() {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const albumInputRef = useRef<HTMLInputElement>(null);
  const [view, setView] = useState<AppView>('home');
  const [resultState, setResultState] = useState<ResultState>();
  const [previewUrl, setPreviewUrl] = useState('');
  const [notice, setNotice] = useState('');
  const [equipmentFilter, setEquipmentFilter] = useState('');
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>(() =>
    typeof localStorage === 'undefined' ? [] : readHistory()
  );
  const inWeChat = isWeChatBrowser();

  const filteredEquipment = useMemo(() => {
    const query = equipmentFilter.trim().toLowerCase();
    if (!query) {
      return equipmentCatalog;
    }

    return equipmentCatalog.filter((equipment) =>
      [equipment.zhName, equipment.enName, equipment.category].join(' ').toLowerCase().includes(query)
    );
  }, [equipmentFilter]);

  function openEquipment(equipment: EquipmentCard, confidence?: number) {
    setResultState({
      payload: {
        status: confidence ? 'recognized' : 'low_confidence',
        equipment,
        confidence,
        alternatives: equipment.similarEquipmentIds
      },
      equipment
    });
    setHistoryItems(addHistoryItem(equipment, confidence));
    setView('result');
  }

  function handleRecognitionPayload(payload: RecognitionPayload, nextPreviewUrl: string) {
    if (payload.equipment && (payload.status === 'recognized' || payload.status === 'low_confidence')) {
      setResultState({ payload, equipment: payload.equipment, previewUrl: nextPreviewUrl });
      setHistoryItems(addHistoryItem(payload.equipment, payload.confidence));
      setView('result');
      return;
    }

    if (payload.status === 'unsupported' || payload.status === 'low_confidence') {
      setResultState({ payload, previewUrl: nextPreviewUrl });
      setView('unsupported');
      return;
    }

    setNotice(payload.message ?? '识别失败，请重试。');
    setView('home');
  }

  async function handleFile(file: File) {
    setNotice('');
    setView('recognizing');

    try {
      const compressed = await compressImageToBase64(file);
      setPreviewUrl(compressed.previewUrl);
      setNotice(compressed.warning);
      const payload = await recognizeEquipmentImage(compressed.base64, 'album');
      handleRecognitionPayload(payload, compressed.previewUrl);
    } catch (error) {
      setNotice(error instanceof ImageTooLargeError ? error.message : '图片处理失败，请换一张图片再试。');
      setView('home');
    }
  }

  function selectCandidate(equipment: EquipmentCard) {
    const predictedId = resultState?.equipment?.id;
    if (predictedId && predictedId !== equipment.id) {
      recordWrongPrediction(equipment.id, predictedId);
    }
    openEquipment(equipment, resultState?.payload.confidence);
  }

  if (view === 'recognizing') {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
        <section className="rounded-[2rem] bg-white p-5 text-center shadow-soft">
          {previewUrl ? <img alt="待识别器械预览" className="mb-4 rounded-3xl" src={previewUrl} /> : null}
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-fern">Recognizing</p>
          <h1 className="mt-2 text-3xl font-black text-ink">正在识别器械</h1>
          <p className="mt-3 text-ink/65">正在生成正确搜索入口，通常几秒内完成。</p>
          {notice ? <p className="mt-3 rounded-2xl bg-moss px-4 py-3 text-sm text-fern">{notice}</p> : null}
        </section>
      </main>
    );
  }

  if (view === 'result' && resultState?.equipment) {
    return (
      <EquipmentResult
        candidates={getSimilarCandidates(resultState.equipment)}
        confidence={resultState.payload.confidence}
        equipment={resultState.equipment}
        onRetake={() => setView('home')}
        onSelectCandidate={selectCandidate}
        onWrongPrediction={() => setView('equipment-list')}
      />
    );
  }

  if (view === 'unsupported' && resultState) {
    return (
      <UnsupportedResult
        candidates={getCandidates(resultState.payload.alternatives)}
        message={resultState.payload.message}
        onRetake={() => setView('home')}
        onSelectCandidate={selectCandidate}
      />
    );
  }

  if (view === 'equipment-list') {
    return (
      <main className="mx-auto min-h-screen max-w-md px-4 pb-10 pt-5">
        <button className="mb-4 text-sm font-bold text-fern" onClick={() => setView('home')} type="button">
          返回首页
        </button>
        <h1 className="text-3xl font-black text-ink">支持识别的器械</h1>
        <input
          className="mt-4 w-full rounded-2xl border-0 bg-white px-4 py-3 shadow-soft outline-none"
          onChange={(event) => setEquipmentFilter(event.target.value)}
          placeholder="搜索器械名称 / 英文 / 分类"
          value={equipmentFilter}
        />
        <section className="mt-4">
          <CandidateList candidates={filteredEquipment} onSelect={(equipment) => openEquipment(equipment)} />
        </section>
      </main>
    );
  }

  if (view === 'history') {
    return (
      <main className="mx-auto min-h-screen max-w-md px-4 pb-10 pt-5">
        <button className="mb-4 text-sm font-bold text-fern" onClick={() => setView('home')} type="button">
          返回首页
        </button>
        <h1 className="text-3xl font-black text-ink">最近识别</h1>
        <div className="mt-4 space-y-3">
          {historyItems.length === 0 ? (
            <p className="rounded-3xl bg-white p-4 text-ink/65">还没有历史记录。</p>
          ) : (
            historyItems.map((item) => (
              <button
                className="w-full rounded-3xl bg-white p-4 text-left shadow-soft"
                key={`${item.id}-${item.createdAt}`}
                onClick={() => {
                  const equipment = getEquipmentCard(item.id);
                  if (equipment) {
                    openEquipment(equipment, item.confidence);
                  }
                }}
                type="button"
              >
                <span className="block text-lg font-black">{item.zhName}</span>
                <span className="block text-sm text-ink/55">{item.searchQuery}</span>
              </button>
            ))
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-md px-4 pb-10 pt-8">
      <section className="rounded-[2.4rem] bg-white/90 p-6 shadow-soft">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-fern">Gym Equipment AI</p>
        <h1 className="mt-4 text-4xl font-black leading-tight text-ink">拍一下，马上知道器械怎么搜</h1>
        <p className="mt-4 text-base leading-7 text-ink/70">
          面向健身新手的器械识别入口。识别器械后，直接生成 B站、抖音、小红书和百度的教程搜索词。
        </p>
        {inWeChat ? (
          <p className="mt-4 rounded-2xl bg-clay/15 px-4 py-3 text-sm font-bold text-clay">
            为了更好跳转 B站/抖音，请点击右上角，用浏览器打开。
          </p>
        ) : null}
        {notice ? <p className="mt-4 rounded-2xl bg-moss px-4 py-3 text-sm text-fern">{notice}</p> : null}
        <input
          accept="image/*"
          aria-label="拍照识别器械"
          capture="environment"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              void handleFile(file);
            }
            event.currentTarget.value = '';
          }}
          ref={cameraInputRef}
          type="file"
        />
        <input
          accept="image/*"
          aria-label="从相册上传器械图片"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              void handleFile(file);
            }
            event.currentTarget.value = '';
          }}
          ref={albumInputRef}
          type="file"
        />
        <button
          className="mt-6 w-full rounded-3xl bg-fern px-5 py-4 text-lg font-black text-white shadow-soft"
          onClick={() => cameraInputRef.current?.click()}
          type="button"
        >
          拍照识别
        </button>
        <button
          className="mt-3 w-full rounded-3xl bg-moss px-5 py-4 text-base font-black text-fern shadow-soft"
          onClick={() => albumInputRef.current?.click()}
          type="button"
        >
          从相册上传
        </button>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <button
            className="rounded-2xl bg-moss px-4 py-3 text-sm font-black text-fern"
            onClick={() => setView('equipment-list')}
            type="button"
          >
            支持器械
          </button>
          <button
            className="rounded-2xl bg-moss px-4 py-3 text-sm font-black text-fern"
            onClick={() => {
              setHistoryItems(readHistory());
              setView('history');
            }}
            type="button"
          >
            最近识别
          </button>
        </div>
      </section>
    </main>
  );
}
