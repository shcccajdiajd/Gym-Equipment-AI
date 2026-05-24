const HISTORY_KEY = 'equipment-history';

export function readHistory(): string[] {
  return wx.getStorageSync<string[]>(HISTORY_KEY) || [];
}

export function pushHistory(id: string) {
  const current = readHistory().filter((item) => item !== id);
  const next = [id, ...current].slice(0, 10);
  wx.setStorageSync(HISTORY_KEY, next);
}
