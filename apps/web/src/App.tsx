import { equipmentCatalog, getEquipmentCard, type EquipmentCard } from '@gym-equipment-ai/shared';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CandidateList } from './components/CandidateList.js';
import { EquipmentResult } from './components/EquipmentResult.js';
import { TrainingRecordForm } from './components/TrainingRecordForm.js';
import { TrainingRecordsPage } from './components/TrainingRecordsPage.js';
import { UnsupportedResult } from './components/UnsupportedResult.js';
import type { HistoryItem, RecognitionPayload } from './types.js';
import { compressImageToBase64, ImageTooLargeError } from './utils/image.js';
import { addHistoryItem, readHistory, recordWrongPrediction } from './utils/history.js';
import { recognizeEquipmentImage } from './utils/api.js';
import { isWeChatBrowser } from './utils/searchTargets.js';
import {
  getAppViewFromHistoryState,
  pushAppViewToHistory,
  replaceAppViewInHistory,
  type AppView
} from './utils/appNavigation.js';
import { trackEvent } from './utils/analytics.js';

type ResultState = {
  payload: RecognitionPayload;
  equipment?: EquipmentCard;
  previewUrl?: string;
};

type TrainingTarget = {
  equipment: EquipmentCard;
  exerciseName: string;
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
  const [trainingTarget, setTrainingTarget] = useState<TrainingTarget>();
  const [previewUrl, setPreviewUrl] = useState('');
  const [notice, setNotice] = useState('');
  const [equipmentFilter, setEquipmentFilter] = useState('');
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>(() =>
    typeof localStorage === 'undefined' ? [] : readHistory()
  );
  const inWeChat = isWeChatBrowser();

  useEffect(() => {
    replaceAppViewInHistory('home');
    void trackEvent('page_open', {
      properties: {
        inWeChat
      }
    });

    function handlePopState(event: PopStateEvent) {
      setView(getAppViewFromHistoryState(event.state) ?? 'home');
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [inWeChat]);

  useEffect(() => {
    window.scrollTo({ left: 0, top: 0, behavior: 'auto' });
    window.requestAnimationFrame(() => {
      window.scrollTo({ left: 0, top: 0, behavior: 'auto' });
    });
  }, [view]);

  function navigateTo(nextView: AppView, mode: 'push' | 'replace' = 'push') {
    if (mode === 'replace') {
      replaceAppViewInHistory(nextView);
    } else {
      pushAppViewToHistory(nextView);
    }
    setView(nextView);
  }

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
    navigateTo('result');
  }

  function handleRecognitionPayload(payload: RecognitionPayload, nextPreviewUrl: string) {
    if (payload.equipment && (payload.status === 'recognized' || payload.status === 'low_confidence')) {
      setResultState({ payload, equipment: payload.equipment, previewUrl: nextPreviewUrl });
      setHistoryItems(addHistoryItem(payload.equipment, payload.confidence));
      navigateTo('result', 'replace');
      return;
    }

    if (payload.status === 'unsupported' || payload.status === 'low_confidence') {
      setResultState({ payload, previewUrl: nextPreviewUrl });
      navigateTo('unsupported', 'replace');
      return;
    }

    setNotice(payload.message ?? '识别失败，请重试。');
    navigateTo('home', 'replace');
  }

  async function handleFile(file: File, source: 'camera' | 'album') {
    setNotice('');
    navigateTo('recognizing');
    void trackEvent('upload_start', {
      properties: {
        source,
        fileType: file.type || 'unknown',
        fileSize: file.size
      }
    });

    try {
      const compressed = await compressImageToBase64(file);
      setPreviewUrl(compressed.previewUrl);
      setNotice(compressed.warning);
      const payload = await recognizeEquipmentImage(compressed.base64, source);
      void trackEvent(payload.equipment && (payload.status === 'recognized' || payload.status === 'low_confidence')
        ? 'recognition_success'
        : 'recognition_error', {
        properties: {
          source,
          status: payload.status,
          equipmentId: payload.equipment?.id ?? null,
          confidence: payload.confidence ?? null,
          errorCode: payload.errorCode ?? null
        }
      });
      handleRecognitionPayload(payload, compressed.previewUrl);
    } catch (error) {
      setNotice(error instanceof ImageTooLargeError ? error.message : '图片处理失败，请换一张图片再试。');
      void trackEvent('recognition_error', {
        properties: {
          source,
          status: 'image_processing_error',
          errorCode: error instanceof ImageTooLargeError ? 'IMAGE_TOO_LARGE' : 'IMAGE_PROCESSING_FAILED'
        }
      });
      navigateTo('home', 'replace');
    }
  }

  function selectCandidate(equipment: EquipmentCard) {
    const predictedId = resultState?.equipment?.id;
    if (predictedId && predictedId !== equipment.id) {
      recordWrongPrediction(equipment.id, predictedId);
    }
    openEquipment(equipment, resultState?.payload.confidence);
  }

  function openTrainingForm(equipment: EquipmentCard, exerciseName: string) {
    setTrainingTarget({ equipment, exerciseName });
    navigateTo('training-form');
  }

  if (view === 'recognizing') {
    return (
      <main className="screen-center">
        <section className="surface-card text-center">
          {previewUrl ? (
            <img alt="待识别器械预览" className="mb-4 max-h-[22rem] w-full rounded-[1.5rem] object-cover" src={previewUrl} />
          ) : null}
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-fern">Recognizing</p>
          <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-ink">正在识别器械</h1>
          <div className="mx-auto mt-5 h-2 w-28 overflow-hidden rounded-full bg-moss">
            <span className="block h-full w-2/3 animate-pulse rounded-full bg-fern" />
          </div>
          <p className="mt-4 text-sm leading-6 text-slate">正在判断器械名称，并准备适合新手的教程搜索词。</p>
          {notice ? <p className="mt-3 rounded-2xl bg-moss px-4 py-3 text-sm font-bold text-fern">{notice}</p> : null}
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
        onOpenTrainingForm={openTrainingForm}
        onRetake={() => navigateTo('home', 'replace')}
        onSelectCandidate={selectCandidate}
        onWrongPrediction={() => navigateTo('equipment-list')}
      />
    );
  }

  if (view === 'training-form' && trainingTarget) {
    return (
      <TrainingRecordForm
        defaultExerciseName={trainingTarget.exerciseName}
        equipment={trainingTarget.equipment}
        onCancel={() => navigateTo('result', 'replace')}
        onSaved={() => navigateTo('training-records', 'replace')}
      />
    );
  }

  if (view === 'training-records') {
    return (
      <TrainingRecordsPage
        onBack={() => navigateTo('home', 'replace')}
        onOpenEquipment={(equipment) => openEquipment(equipment)}
      />
    );
  }

  if (view === 'unsupported' && resultState) {
    return (
      <UnsupportedResult
        candidates={getCandidates(resultState.payload.alternatives)}
        message={resultState.payload.message}
        onRetake={() => navigateTo('home', 'replace')}
        onSelectCandidate={selectCandidate}
      />
    );
  }

  if (view === 'equipment-list') {
    return (
      <main className="screen">
        <button className="top-link" onClick={() => navigateTo('home', 'replace')} type="button">
          返回首页
        </button>
        <h1 className="page-title">支持识别的器械</h1>
        <p className="mt-3 text-sm leading-6 text-slate">当前 MVP 先覆盖固定器械。也可以直接点开器械详情，查看教程搜索入口。</p>
        <input
          className="input-soft mt-5 bg-white shadow-press"
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
      <main className="screen">
        <button className="top-link" onClick={() => navigateTo('home', 'replace')} type="button">
          返回首页
        </button>
        <h1 className="page-title">最近识别</h1>
        <p className="mt-3 text-sm leading-6 text-slate">不用重新拍，也能快速回到之前看过的器械教程入口。</p>
        <div className="mt-4 space-y-3">
          {historyItems.length === 0 ? (
            <p className="surface-card text-slate">还没有历史记录。</p>
          ) : (
            historyItems.map((item) => (
              <button
                className="list-card"
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
    <main className="screen pt-7">
      <section className="hero-card">
        <div className="relative">
          <p className="eyebrow">Gym Equipment AI</p>
          <h1 className="mt-4 text-[2.75rem] font-black leading-[1.02] tracking-[-0.065em] text-ink">
            不认识器械，也能马上搜对教程
          </h1>
          <p className="mt-5 text-[1.03rem] leading-8 text-slate">
            在健身房拍一下器械，先认出它叫什么，再生成适合新手的教程搜索词。
          </p>
          <div className="scanner-preview">
            <span className="scanner-badge">AI 识别</span>
            <div className="scanner-core">
              <span>对准器械</span>
              <span>生成教程入口</span>
            </div>
          </div>
          <div className="step-rail mt-5">
            {[
              ['01', '拍器械'],
              ['02', '认名称'],
              ['03', '去搜索']
            ].map(([number, label]) => (
              <span className="step-chip" key={label}>
                <span className="text-[0.68rem] font-black text-fern/55">{number}</span>
                <span className="mt-1 text-xs font-black text-fern">{label}</span>
              </span>
            ))}
          </div>
          {inWeChat ? (
            <p className="mt-4 rounded-2xl bg-clay/15 px-4 py-3 text-sm font-bold text-clay">
              为了更好跳转 B站/抖音，请点击右上角，用浏览器打开。
            </p>
          ) : null}
          {notice ? <p className="mt-4 rounded-2xl bg-moss px-4 py-3 text-sm font-bold text-fern">{notice}</p> : null}
          <input
            accept="image/*"
            aria-label="拍照识别器械"
            capture="environment"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                void handleFile(file, 'camera');
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
                void handleFile(file, 'album');
              }
              event.currentTarget.value = '';
            }}
            ref={albumInputRef}
            type="file"
          />
          <button className="btn-primary mt-7 text-lg" onClick={() => cameraInputRef.current?.click()} type="button">
            拍照识别器械
          </button>
          <button className="btn-secondary mt-3" onClick={() => albumInputRef.current?.click()} type="button">
            从相册上传
          </button>
          <p className="trust-strip mt-4">
            识别后重点给你“怎么搜”：B站、抖音、小红书、百度都能一键跳转或复制搜索词。
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <button className="btn-ghost" onClick={() => navigateTo('equipment-list')} type="button">
              支持器械
            </button>
            <button
              className="btn-ghost"
              onClick={() => {
                setHistoryItems(readHistory());
                navigateTo('history');
              }}
              type="button"
            >
              最近识别
            </button>
          </div>
          <button
            className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-[1.05rem] border border-line/60 bg-white/55 px-4 py-3 text-sm font-black text-fern"
            onClick={() => navigateTo('training-records')}
            type="button"
          >
            我的训练记录
          </button>
        </div>
      </section>
    </main>
  );
}
