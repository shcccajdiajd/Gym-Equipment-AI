import { describe, expect, it } from 'vitest';
import { buildRecognitionPrompt, RECOGNIZED_CONFIDENCE_THRESHOLD } from './prompt.js';

describe('buildRecognitionPrompt', () => {
  it('includes human-readable catalog labels and visual cues for confusing machines', () => {
    const prompt = buildRecognitionPrompt('album');

    expect(prompt).toContain('pec-deck-fly');
    expect(prompt).toContain('蝴蝶机夹胸');
    expect(prompt).toContain('Pec Deck Fly');
    expect(prompt).toContain('双臂从身体两侧向胸前夹拢');
    expect(prompt).toContain('seated-row');
    expect(prompt).toContain('坐姿划船');
    expect(prompt).toContain('水平向后拉到躯干');
    expect(prompt).toContain('"topMatchId":"one-supported-id-or-null"');
    expect(prompt).toContain('Use catalog ids in topMatchId and alternatives');
  });

  it('guards against confusing pec deck photos with assisted pull-up dip machines', () => {
    const prompt = buildRecognitionPrompt('album');

    expect(prompt).toContain('Do not return assisted-pull-up-dip unless');
    expect(prompt).toContain('knee pad');
    expect(prompt).toContain('dip handles');
    expect(prompt).toContain('pull-up handles');
    expect(prompt).toContain('pec-deck-fly is likely');
    expect(prompt).toContain('two chest-height swing arms');
  });

  it('uses a stricter confidence threshold for beginner-safe recognized results', () => {
    expect(RECOGNIZED_CONFIDENCE_THRESHOLD).toBe(0.82);
  });
});
