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

function getEquipmentInitial(equipment: Pick<EquipmentCard, 'zhName'>) {
  return equipment.zhName.slice(0, 1);
}

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
  const [categoryFilter, setCategoryFilter] = useState('全部');
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
    const categoryMatched = (equipment: EquipmentCard) => categoryFilter === '全部' || equipment.category === categoryFilter;
    if (!query) {
      return equipmentCatalog.filter(categoryMatched);
    }

    return equipmentCatalog.filter((equipment) =>
      categoryMatched(equipment)
      && [equipment.zhName, equipment.enName, equipment.category].join(' ').toLowerCase().includes(query)
    );
  }, [categoryFilter, equipmentFilter]);

  const categories = useMemo(() => {
    return ['全部', ...Array.from(new Set(equipmentCatalog.map((equipment) => equipment.category)))];
  }, []);

  const recentHistory = useMemo(() => {
    if (historyItems.length === 0) {
      return equipmentCatalog;
    }

    return historyItems
      .map((item) => getEquipmentCard(item.id))
      .filter((item): item is EquipmentCard => Boolean(item))
      .slice(0, 4);
  }, [historyItems]);

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
      <main className="recognition-page">
        <div className="app-topbar bg-white text-carbon">
          <button className="icon-button" onClick={() => navigateTo('home', 'replace')} type="button" aria-label="返回首页">
            ‹
          </button>
          <h1 className="app-topbar-title">识别中</h1>
          <button className="h-11 rounded-full px-2 text-base font-black text-slate" onClick={() => navigateTo('home', 'replace')} type="button">
            取消
          </button>
        </div>
        <section className="screen px-4 pt-0">
          <div className="recognition-frame">
            {previewUrl ? (
              <img alt="待识别器械预览" src={previewUrl} />
            ) : (
              <div className="grid h-full min-h-[32rem] place-items-center bg-fern text-white/70">等待图片预览</div>
            )}
            <span className="scan-line" />
            <span className="pointer-events-none absolute left-4 top-4 h-9 w-9 rounded-tl-xl border-l-4 border-t-4 border-acid" />
            <span className="pointer-events-none absolute right-4 top-4 h-9 w-9 rounded-tr-xl border-r-4 border-t-4 border-acid" />
            <span className="pointer-events-none absolute bottom-4 left-4 h-9 w-9 rounded-bl-xl border-b-4 border-l-4 border-acid" />
            <span className="pointer-events-none absolute bottom-4 right-4 h-9 w-9 rounded-br-xl border-b-4 border-r-4 border-acid" />
            <div className="recognition-overlay">
              <div className="spinner" />
              <h2 className="mt-5 text-3xl font-black tracking-[-0.04em]">正在识别器械...</h2>
              <p className="mt-3 text-sm leading-6 text-white/70">请稍候，AI 正在分析图片特征</p>
              <div className="progress-track">
                <span className="progress-fill" />
              </div>
              <p className="mt-5 text-sm leading-6 text-white/60">
                识别时间较长时，请检查网络
                <button className="ml-3 font-black text-acid" onClick={() => navigateTo('home', 'replace')} type="button">
                  重新尝试
                </button>
              </p>
              {notice ? <p className="mt-3 text-xs leading-5 text-acid">{notice}</p> : null}
            </div>
          </div>
          <button className="btn-secondary mt-8 border-white bg-transparent text-white" onClick={() => navigateTo('home', 'replace')} type="button">
            取消识别
          </button>
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
        <div className="app-topbar">
          <button className="icon-button" onClick={() => navigateTo('home', 'replace')} type="button" aria-label="返回首页">
            ‹
          </button>
          <h1 className="app-topbar-title">支持器械</h1>
          <span className="h-11 w-11" />
        </div>
        <input
          className="input-soft"
          onChange={(event) => setEquipmentFilter(event.target.value)}
          placeholder="搜索器械名称 / 英文 / 分类"
          value={equipmentFilter}
        />
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((category) => (
            <button
              className={`min-h-10 shrink-0 rounded-full border px-4 text-sm font-black transition active:scale-[0.98] ${
                categoryFilter === category ? 'border-acid bg-acid text-carbon shadow-acid' : 'border-fern bg-white text-fern'
              }`}
              key={category}
              onClick={() => setCategoryFilter(category)}
              type="button"
            >
              {category}
            </button>
          ))}
        </div>
        <section className="mt-3">
          <CandidateList candidates={filteredEquipment} onSelect={(equipment) => openEquipment(equipment)} />
        </section>
      </main>
    );
  }

  if (view === 'history') {
    return (
      <main className="screen">
        <div className="app-topbar">
          <button className="icon-button" onClick={() => navigateTo('home', 'replace')} type="button" aria-label="返回首页">
            ‹
          </button>
          <h1 className="app-topbar-title">最近识别</h1>
          <button className="icon-button" onClick={() => navigateTo('home', 'replace')} type="button" aria-label="关闭">
            ×
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {historyItems.length === 0 ? (
            <p className="surface-card text-slate">还没有历史记录。识别结果只保存器械名称和搜索词，不保存原始图片。</p>
          ) : (
            historyItems.map((item) => (
              <button
                className="candidate-card"
                key={`${item.id}-${item.createdAt}`}
                onClick={() => {
                  const equipment = getEquipmentCard(item.id);
                  if (equipment) {
                    openEquipment(equipment, item.confidence);
                  }
                }}
                type="button"
              >
                <span className="candidate-thumb">{item.zhName.slice(0, 1)}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-lg font-black tracking-[-0.03em] text-carbon">{item.zhName}</span>
                  <span className="mt-1 block text-sm font-bold text-slate">{Math.round((item.confidence ?? 0) * 100)}% 置信度</span>
                  <span className="mt-1 block truncate text-xs text-tertiary">{item.searchQuery}</span>
                </span>
                <span className="text-2xl text-tertiary">□</span>
              </button>
            ))
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="upload-stage">
      {inWeChat ? (
        <p className="brand-alert">为了更好跳转 B站/抖音，请点击右上角，用浏览器打开</p>
      ) : null}
      <div className="brand-bar">
        <span className="brand-mark">
          <span className="brand-bracket">[ ]</span>
          GYM.AI
        </span>
        <span className="flex gap-1">
          <button className="inline-flex h-11 w-11 items-center justify-center rounded-full text-lg font-black text-white transition active:scale-95" onClick={() => navigateTo('history')} type="button" aria-label="最近识别">
            ↻
          </button>
          <button className="inline-flex h-11 w-11 items-center justify-center rounded-full text-lg font-black text-white transition active:scale-95" onClick={() => navigateTo('equipment-list')} type="button" aria-label="支持器械">
            ⚙
          </button>
        </span>
      </div>
      <section className="screen pt-7">
        <div>
          <h1 className="upload-title">拍一下器械</h1>
          <p className="upload-subtitle">就知道它叫什么、练哪里、怎么搜教程</p>
          {notice ? <p className="mt-4 rounded-xl bg-moss px-4 py-3 text-sm font-black text-fern">{notice}</p> : null}
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
          <button className="upload-zone" onClick={() => cameraInputRef.current?.click()} type="button">
            <span className="upload-corner upload-corner-tl" />
            <span className="upload-corner upload-corner-tr" />
            <span className="upload-corner upload-corner-bl" />
            <span className="upload-corner upload-corner-br" />
            <span className="camera-orb">
              <span className="camera-symbol" />
            </span>
            <span className="mt-5 text-3xl font-black tracking-[-0.04em] text-fern">拍一下</span>
            <span className="mt-1 text-base font-medium text-slate">或上传图片</span>
          </button>
          <button className="album-link mx-auto flex" onClick={() => albumInputRef.current?.click()} type="button">
            <span className="text-2xl leading-none">↥</span>
            从相册上传
          </button>
          <button className="btn-secondary mt-4" onClick={() => navigateTo('equipment-list')} type="button">
            查看支持的器械
          </button>

          <div className="mt-5 border-t border-line pt-4">
            <h2 className="text-lg font-black tracking-[-0.03em] text-fern">最近识别</h2>
            <div className="mt-3 flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {recentHistory.slice(0, 4).map((equipment) => (
                <button
                  className="recent-tile"
                  key={equipment.id}
                  onClick={() => openEquipment(equipment)}
                  type="button"
                >
                  <span className="equipment-thumb">{getEquipmentInitial(equipment)}</span>
                  <span className="mt-2 block truncate text-sm font-black text-fern">{equipment.zhName}</span>
                </button>
              ))}
            </div>
          </div>
          <button
            className="mt-2 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-base font-black text-fern shadow-press"
            onClick={() => navigateTo('training-records')}
            type="button"
          >
            <span className="grid h-7 w-7 place-items-center rounded-md border-2 border-fern text-sm">▤</span>
            我的训练记录
          </button>
        </div>
      </section>
    </main>
  );
}
