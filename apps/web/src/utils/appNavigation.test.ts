import { describe, expect, it, vi } from 'vitest';
import { getAppViewFromHistoryState, replaceAppViewInHistory, pushAppViewToHistory } from './appNavigation.js';

describe('app browser navigation', () => {
  it('reads only valid app view states from browser history', () => {
    expect(getAppViewFromHistoryState({ gymEquipmentAiView: 'result' })).toBe('result');
    expect(getAppViewFromHistoryState({ gymEquipmentAiView: 'settings' })).toBeNull();
    expect(getAppViewFromHistoryState(null)).toBeNull();
  });

  it('pushes and replaces app view states without changing the current url', () => {
    const pushState = vi.fn();
    const replaceState = vi.fn();

    vi.stubGlobal('window', {
      history: {
        state: { preserved: true },
        pushState,
        replaceState
      },
      location: {
        href: 'https://example.com/app'
      }
    });

    pushAppViewToHistory('equipment-list');
    replaceAppViewInHistory('result');

    expect(pushState).toHaveBeenCalledWith(
      { preserved: true, gymEquipmentAiView: 'equipment-list' },
      '',
      'https://example.com/app'
    );
    expect(replaceState).toHaveBeenCalledWith(
      { preserved: true, gymEquipmentAiView: 'result' },
      '',
      'https://example.com/app'
    );

    vi.unstubAllGlobals();
  });
});
