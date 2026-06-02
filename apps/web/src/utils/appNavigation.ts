export type AppView =
  | 'home'
  | 'recognizing'
  | 'result'
  | 'unsupported'
  | 'equipment-list'
  | 'history'
  | 'training-form'
  | 'training-records';

const APP_VIEW_STATE_KEY = 'gymEquipmentAiView';

const appViews = new Set<AppView>([
  'home',
  'recognizing',
  'result',
  'unsupported',
  'equipment-list',
  'history',
  'training-form',
  'training-records'
]);

type AppHistoryState = {
  [APP_VIEW_STATE_KEY]?: AppView;
};

function canUseBrowserHistory() {
  return typeof window !== 'undefined' && Boolean(window.history?.pushState);
}

function getCurrentUrl() {
  return typeof window === 'undefined' ? '' : window.location.href;
}

function getMergedHistoryState(view: AppView): AppHistoryState {
  const currentState = typeof window !== 'undefined' && typeof window.history.state === 'object' && window.history.state
    ? window.history.state
    : {};

  return {
    ...currentState,
    [APP_VIEW_STATE_KEY]: view
  };
}

export function getAppViewFromHistoryState(state: unknown): AppView | null {
  if (!state || typeof state !== 'object') {
    return null;
  }

  const view = (state as AppHistoryState)[APP_VIEW_STATE_KEY];
  return view && appViews.has(view) ? view : null;
}

export function pushAppViewToHistory(view: AppView) {
  if (!canUseBrowserHistory()) {
    return;
  }

  window.history.pushState(getMergedHistoryState(view), '', getCurrentUrl());
}

export function replaceAppViewInHistory(view: AppView) {
  if (!canUseBrowserHistory()) {
    return;
  }

  window.history.replaceState(getMergedHistoryState(view), '', getCurrentUrl());
}
