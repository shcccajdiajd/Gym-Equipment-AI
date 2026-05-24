# Gym Equipment AI Mini Program V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a personal-developer-friendly WeChat mini program that lets beginners photograph or import a gym machine image, identify one supported fixed machine, and read a curated safety-first equipment card with a video learning handoff.

**Architecture:** Use a small `pnpm` workspace with three units: a native WeChat mini program frontend in `apps/miniprogram`, a Fastify API in `services/api`, and shared domain types/content in `packages/shared`. Keep all training guidance curated in structured data, and keep AI limited to image recognition through a recognizer interface that supports a deterministic mock provider for tests and an OpenAI Responses API provider for real image recognition.

**Tech Stack:** Node 20, `pnpm`, TypeScript, Fastify, Zod, Vitest, native WeChat Mini Program, `openai`, `@types/wechat-miniprogram`

---

## File Structure

- Root: `package.json`, `pnpm-workspace.yaml`, `tsconfig.base.json`, `vitest.workspace.ts`, `.gitignore`
- Shared domain package: `packages/shared/src/catalog.ts`, `packages/shared/src/schemas.ts`, `packages/shared/src/index.ts`, `packages/shared/src/catalog.test.ts`
- API service: `services/api/src/app.ts`, `services/api/src/server.ts`, `services/api/src/env.ts`, `services/api/src/routes/recognitions.ts`, `services/api/src/routes/recognitions.test.ts`, `services/api/src/lib/catalog-service.ts`, `services/api/src/lib/recognizers/types.ts`, `services/api/src/lib/recognizers/mock.ts`, `services/api/src/lib/recognizers/openai.ts`
- Mini program app shell: `apps/miniprogram/miniprogram/app.ts`, `apps/miniprogram/miniprogram/app.json`, `apps/miniprogram/miniprogram/app.wxss`
- Mini program local data bridge: `scripts/sync-catalog.ts`, `apps/miniprogram/miniprogram/data/catalog.ts`
- Mini program pages: `apps/miniprogram/miniprogram/pages/home/*`, `apps/miniprogram/miniprogram/pages/capture/*`, `apps/miniprogram/miniprogram/pages/result/*`, `apps/miniprogram/miniprogram/pages/equipment-list/*`
- Mini program utilities: `apps/miniprogram/miniprogram/utils/api.ts`, `apps/miniprogram/miniprogram/utils/history.ts`, `apps/miniprogram/miniprogram/utils/result-view-model.ts`
- Mini program typing: `apps/miniprogram/miniprogram/app.d.ts`
- Frontend tests: `apps/miniprogram/tests/result-view-model.test.ts`
- Docs and env: `README.md`, `services/api/.env.example`, `docs/qa/manual-smoke-test.md`

## Implementation Notes

- Ship V1 with `20` fixed machines.
- Store curated teaching content in `packages/shared/src/catalog.ts`; do not generate safety instructions on the fly.
- Because personal-type mini programs commonly cannot rely on `web-view`, implement the video handoff in V1 as `platform + video title + exact search query + copy button`. Only add direct H5 opening later if your account capabilities are confirmed.
- Keep user-facing results single-choice by default, but expose a low-confidence footer for similar machines.

## Launch Catalog

Use these exact equipment ids in the launch catalog:

- `seated-chest-press`
- `pec-deck-fly`
- `lat-pulldown`
- `seated-row`
- `shoulder-press-machine`
- `leg-press`
- `leg-extension`
- `seated-leg-curl`
- `lying-leg-curl`
- `hip-abductor`
- `hip-adductor`
- `glute-kickback`
- `hip-thrust-machine`
- `biceps-curl-machine`
- `triceps-extension-machine`
- `ab-crunch-machine`
- `back-extension-machine`
- `assisted-pull-up-dip`
- `hack-squat-machine`
- `calf-raise-machine`

### Task 1: Bootstrap the workspace and shared equipment catalog

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `tsconfig.base.json`
- Create: `vitest.workspace.ts`
- Create: `.gitignore`
- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/src/catalog.ts`
- Create: `packages/shared/src/schemas.ts`
- Create: `packages/shared/src/index.ts`
- Create: `packages/shared/src/catalog.test.ts`

- [ ] **Step 1: Write the failing shared catalog test**

```ts
// packages/shared/src/catalog.test.ts
import { describe, expect, it } from 'vitest';
import { equipmentCatalog, getEquipmentCard, getSupportedEquipmentIds } from './catalog';

describe('equipment catalog', () => {
  it('contains the complete V1 launch set without duplicate ids', () => {
    const ids = getSupportedEquipmentIds();
    expect(ids).toHaveLength(20);
    expect(new Set(ids).size).toBe(20);
    expect(ids).toContain('seated-chest-press');
    expect(ids).not.toContain('smith-machine');
  });

  it('returns the chest press card with curated teaching content', () => {
    const card = getEquipmentCard('seated-chest-press');
    expect(card?.zhName).toBe('坐姿推胸机');
    expect(card?.primaryMuscles).toEqual(['胸大肌']);
    expect(card?.videoRecommendation.searchQuery).toContain('坐姿推胸机');
  });

  it('keeps similar equipment links inside the launch catalog', () => {
    const ids = new Set(equipmentCatalog.map((item) => item.id));
    for (const item of equipmentCatalog) {
      for (const similarId of item.similarEquipmentIds) {
        expect(ids.has(similarId)).toBe(true);
      }
    }
  });
});
```

- [ ] **Step 2: Run the test to verify the workspace is missing**

Run:

```bash
corepack pnpm vitest run packages/shared/src/catalog.test.ts
```

Expected: FAIL with an error such as `ERR_PNPM_NO_IMPORTER_MANIFEST_FOUND` or `Cannot find module './catalog'`.

- [ ] **Step 3: Create the workspace manifests and the shared catalog**

```json
// package.json
{
  "name": "gym-equipment-ai",
  "private": true,
  "packageManager": "pnpm@10.12.1",
  "scripts": {
    "dev:api": "pnpm --filter @gym-equipment-ai/api dev",
    "sync:catalog": "tsx scripts/sync-catalog.ts",
    "test": "pnpm -r test",
    "typecheck": "pnpm -r typecheck"
  },
  "devDependencies": {
    "tsx": "^4.19.4"
  }
}
```

```yaml
# pnpm-workspace.yaml
packages:
  - apps/*
  - packages/*
  - services/*
```

```json
// tsconfig.base.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

```ts
// vitest.workspace.ts
import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  'packages/shared',
  'services/api',
  'apps/miniprogram'
]);
```

```gitignore
# .gitignore
node_modules
dist
.turbo
.env
.env.local
coverage
apps/miniprogram/project.private.config.json
```

```json
// packages/shared/package.json
{
  "name": "@gym-equipment-ai/shared",
  "version": "0.1.0",
  "type": "module",
  "main": "src/index.ts",
  "scripts": {
    "test": "vitest run",
    "typecheck": "tsc -p tsconfig.json --noEmit"
  },
  "dependencies": {
    "zod": "^4.0.0"
  },
  "devDependencies": {
    "typescript": "^5.8.3",
    "vitest": "^3.2.4"
  }
}
```

```json
// packages/shared/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src"
  },
  "include": ["src"]
}
```

```ts
// packages/shared/src/schemas.ts
import { z } from 'zod';

export const videoRecommendationSchema = z.object({
  platform: z.string().min(1),
  title: z.string().min(1),
  searchQuery: z.string().min(1)
});

export const equipmentCardSchema = z.object({
  id: z.string().min(1),
  zhName: z.string().min(1),
  enName: z.string().min(1),
  category: z.enum([
    'chest',
    'back',
    'shoulders',
    'legs',
    'glutes',
    'arms',
    'core',
    'compound'
  ]),
  primaryMuscles: z.array(z.string().min(1)).min(1),
  secondaryMuscles: z.array(z.string().min(1)).default([]),
  summary: z.string().min(1),
  adjustment: z.string().min(1),
  steps: z.array(z.string().min(1)).min(3),
  safety: z.array(z.string().min(1)).min(2),
  commonErrors: z.array(z.string().min(1)).min(2),
  beginnerTip: z.string().min(1),
  videoRecommendation: videoRecommendationSchema,
  similarEquipmentIds: z.array(z.string().min(1)).min(1)
});

export type EquipmentCard = z.infer<typeof equipmentCardSchema>;
```

```ts
// packages/shared/src/catalog.ts
import { equipmentCardSchema, type EquipmentCard } from './schemas';

const rawCatalog: EquipmentCard[] = [
  {
    id: 'seated-chest-press',
    zhName: '坐姿推胸机',
    enName: 'Seated Chest Press',
    category: 'chest',
    primaryMuscles: ['胸大肌'],
    secondaryMuscles: ['前三角肌', '肱三头肌'],
    summary: '固定轨迹胸推器械，适合新手建立推的发力感。',
    adjustment: '将座椅调到把手与胸中部齐平，双脚踩稳，肩胛自然后收。',
    steps: ['坐稳并收紧核心。', '握住把手后向前推出。', '手臂接近伸直时停顿，再控制回到起点。'],
    safety: ['全程保持肩膀下沉，不要耸肩。', '不要为了重量牺牲活动幅度。'],
    commonErrors: ['座椅太低导致推举轨迹偏上。', '锁死肘关节并猛推。'],
    beginnerTip: '先从能稳定完成 10 次的轻重量开始。',
    videoRecommendation: {
      platform: 'Bilibili',
      title: '坐姿推胸机使用教学',
      searchQuery: '坐姿推胸机 正确使用 教学'
    },
    similarEquipmentIds: ['pec-deck-fly', 'shoulder-press-machine']
  },
  {
    id: 'pec-deck-fly',
    zhName: '蝴蝶机夹胸',
    enName: 'Pec Deck Fly',
    category: 'chest',
    primaryMuscles: ['胸大肌'],
    secondaryMuscles: ['前三角肌'],
    summary: '通过夹胸动作强化胸部收缩感的固定器械。',
    adjustment: '调到肘部与肩同高，背部贴住靠垫。',
    steps: ['双臂打开至胸部轻微拉伸。', '像拥抱一样向中间夹拢。', '停顿一秒后缓慢还原。'],
    safety: ['手肘保持微屈，不要完全伸直。', '若肩前侧不适，缩小动作幅度。'],
    commonErrors: ['借惯性猛夹。', '肩膀前顶导致胸部发力下降。'],
    beginnerTip: '把注意力放在胸部向中间夹紧，而不是手臂摆动。',
    videoRecommendation: {
      platform: 'Bilibili',
      title: '蝴蝶机夹胸教学',
      searchQuery: '蝴蝶机夹胸 正确使用 教学'
    },
    similarEquipmentIds: ['seated-chest-press', 'shoulder-press-machine']
  },
  {
    id: 'lat-pulldown',
    zhName: '高位下拉',
    enName: 'Lat Pulldown',
    category: 'back',
    primaryMuscles: ['背阔肌'],
    secondaryMuscles: ['肱二头肌', '菱形肌'],
    summary: '适合新手学习背部下拉发力模式的固定器械。',
    adjustment: '调好腿垫让大腿被固定，握距略宽于肩。',
    steps: ['先沉肩并挺胸。', '将横杆拉向锁骨上方。', '控制横杆回到顶部。'],
    safety: ['不要把横杆拉到脖子后面。', '避免身体大幅后仰借力。'],
    commonErrors: ['耸肩代偿。', '回放时完全放松导致重量砸回。'],
    beginnerTip: '先学会沉肩再拉肘，背阔肌感觉会更明显。',
    videoRecommendation: {
      platform: 'Bilibili',
      title: '高位下拉新手教学',
      searchQuery: '高位下拉 正确使用 教学'
    },
    similarEquipmentIds: ['assisted-pull-up-dip', 'seated-row']
  },
  {
    id: 'seated-row',
    zhName: '坐姿划船',
    enName: 'Seated Row',
    category: 'back',
    primaryMuscles: ['背阔肌', '菱形肌'],
    secondaryMuscles: ['肱二头肌', '后三角肌'],
    summary: '帮助新手学习水平拉的背部器械。',
    adjustment: '胸口贴垫或坐稳，双手握住把手时肩膀不过度前探。',
    steps: ['先沉肩并收紧核心。', '向后拉肘，把把手拉向下腹。', '控制回程到背部被拉长。'],
    safety: ['保持腰背稳定，不要甩动。', '回程不要塌肩。'],
    commonErrors: ['只用手臂拉而不带动肘部。', '身体前后摆动过大。'],
    beginnerTip: '想象用肘部带动动作，而不是用手拽。',
    videoRecommendation: {
      platform: 'Bilibili',
      title: '坐姿划船教学',
      searchQuery: '坐姿划船器械 正确使用 教学'
    },
    similarEquipmentIds: ['lat-pulldown', 'back-extension-machine']
  },
  {
    id: 'shoulder-press-machine',
    zhName: '肩推机',
    enName: 'Shoulder Press Machine',
    category: 'shoulders',
    primaryMuscles: ['三角肌前束', '三角肌中束'],
    secondaryMuscles: ['肱三头肌'],
    summary: '固定轨迹肩推器械，适合新手建立肩上推举感觉。',
    adjustment: '把座椅调到把手略低于耳朵位置。',
    steps: ['背部贴靠垫坐稳。', '向上推出把手。', '控制下放到起始位置。'],
    safety: ['下放到肩膀舒适范围即可。', '如果肩部不适，立刻减轻重量。'],
    commonErrors: ['耸肩代偿。', '腰部过度反弓。'],
    beginnerTip: '全程保持肋骨回收，别为了推高而挺腰。',
    videoRecommendation: {
      platform: 'Bilibili',
      title: '肩推机教学',
      searchQuery: '肩推机 正确使用 教学'
    },
    similarEquipmentIds: ['seated-chest-press', 'pec-deck-fly']
  },
  {
    id: 'leg-press',
    zhName: '腿举机',
    enName: 'Leg Press',
    category: 'legs',
    primaryMuscles: ['股四头肌', '臀大肌'],
    secondaryMuscles: ['腘绳肌'],
    summary: '下肢复合固定器械，适合新手做腿部力量入门。',
    adjustment: '双脚与肩同宽踩在踏板中部，臀部和腰部贴靠垫。',
    steps: ['解锁安全扣后缓慢下放。', '下放到大腿与腹部接近时停住。', '脚跟发力把踏板推回。'],
    safety: ['整个过程不要让腰部离开靠垫。', '膝盖不要内扣。'],
    commonErrors: ['下放太深导致骨盆后卷。', '膝盖完全锁死。'],
    beginnerTip: '先用中等脚位，等熟悉后再调整脚位体验不同刺激。',
    videoRecommendation: {
      platform: 'Bilibili',
      title: '腿举机使用教学',
      searchQuery: '腿举机 正确使用 教学'
    },
    similarEquipmentIds: ['hack-squat-machine', 'calf-raise-machine']
  },
  {
    id: 'leg-extension',
    zhName: '腿屈伸机',
    enName: 'Leg Extension',
    category: 'legs',
    primaryMuscles: ['股四头肌'],
    secondaryMuscles: [],
    summary: '针对股四头肌的孤立器械。',
    adjustment: '膝关节对准转轴，脚背卡在滚轮下方。',
    steps: ['坐稳后收紧核心。', '将小腿向前抬起到接近伸直。', '控制下放回起点。'],
    safety: ['不要猛甩小腿。', '如果膝盖不适，缩小活动范围。'],
    commonErrors: ['动作太快。', '上顶时锁死膝盖。'],
    beginnerTip: '轻重量慢速做，更容易感受到大腿前侧发力。',
    videoRecommendation: {
      platform: 'Bilibili',
      title: '腿屈伸机教学',
      searchQuery: '腿屈伸机 正确使用 教学'
    },
    similarEquipmentIds: ['seated-leg-curl', 'leg-press']
  },
  {
    id: 'seated-leg-curl',
    zhName: '坐姿腿弯举',
    enName: 'Seated Leg Curl',
    category: 'legs',
    primaryMuscles: ['腘绳肌'],
    secondaryMuscles: ['腓肠肌'],
    summary: '坐姿版本的腿后侧孤立训练器械。',
    adjustment: '膝盖对准转轴，脚踝贴住滚轮，靠垫压稳大腿。',
    steps: ['坐直并抓稳把手。', '向下勾小腿。', '控制回程直到腿后侧被拉长。'],
    safety: ['不要借腰部后仰。', '不要为了重量牺牲完整回程。'],
    commonErrors: ['只做半程。', '动作末端猛弹回去。'],
    beginnerTip: '把脚尖轻微勾起，常能更好感受到腿后侧。',
    videoRecommendation: {
      platform: 'Bilibili',
      title: '坐姿腿弯举教学',
      searchQuery: '坐姿腿弯举 正确使用 教学'
    },
    similarEquipmentIds: ['lying-leg-curl', 'leg-extension']
  },
  {
    id: 'lying-leg-curl',
    zhName: '俯卧腿弯举',
    enName: 'Lying Leg Curl',
    category: 'legs',
    primaryMuscles: ['腘绳肌'],
    secondaryMuscles: ['腓肠肌'],
    summary: '俯卧版本的腿后侧孤立训练器械。',
    adjustment: '膝盖与转轴对齐，滚轮压在脚踝上方。',
    steps: ['俯卧贴稳身体。', '向臀部方向弯曲小腿。', '慢慢下放还原。'],
    safety: ['骨盆保持稳定，不要塌腰。', '出现膝后侧刺痛时立即停止。'],
    commonErrors: ['抬头挺腰借力。', '放下时失控。'],
    beginnerTip: '可以把腹部轻轻收紧，帮助骨盆更稳定。',
    videoRecommendation: {
      platform: 'Bilibili',
      title: '俯卧腿弯举教学',
      searchQuery: '俯卧腿弯举 正确使用 教学'
    },
    similarEquipmentIds: ['seated-leg-curl', 'leg-extension']
  },
  {
    id: 'hip-abductor',
    zhName: '髋外展机',
    enName: 'Hip Abductor',
    category: 'glutes',
    primaryMuscles: ['臀中肌'],
    secondaryMuscles: ['臀小肌'],
    summary: '针对臀部外侧的固定器械。',
    adjustment: '坐稳后把膝盖贴在护垫内侧，起始位置不要过窄。',
    steps: ['保持上身稳定。', '向外打开双腿。', '控制回到起点。'],
    safety: ['不要快速弹开弹回。', '腰部不要左右晃动。'],
    commonErrors: ['身体前后甩动。', '完全靠惯性把腿甩开。'],
    beginnerTip: '动作慢一点，臀部外侧发力会更清楚。',
    videoRecommendation: {
      platform: 'Bilibili',
      title: '髋外展机教学',
      searchQuery: '髋外展机 正确使用 教学'
    },
    similarEquipmentIds: ['hip-adductor', 'glute-kickback']
  },
  {
    id: 'hip-adductor',
    zhName: '髋内收机',
    enName: 'Hip Adductor',
    category: 'legs',
    primaryMuscles: ['内收肌群'],
    secondaryMuscles: [],
    summary: '针对大腿内侧的固定器械。',
    adjustment: '让膝盖外侧靠住护垫，保持坐姿端正。',
    steps: ['双腿从打开位开始。', '向中间夹拢双腿。', '慢慢回到起点。'],
    safety: ['动作幅度在舒适范围内。', '不要用惯性猛夹。'],
    commonErrors: ['夹到中间直接放掉。', '含胸塌腰。'],
    beginnerTip: '重量偏轻时更容易保持动作控制。',
    videoRecommendation: {
      platform: 'Bilibili',
      title: '髋内收机教学',
      searchQuery: '髋内收机 正确使用 教学'
    },
    similarEquipmentIds: ['hip-abductor', 'leg-press']
  },
  {
    id: 'glute-kickback',
    zhName: '后踢腿机',
    enName: 'Glute Kickback Machine',
    category: 'glutes',
    primaryMuscles: ['臀大肌'],
    secondaryMuscles: ['腘绳肌'],
    summary: '通过髋伸动作强化臀大肌发力。',
    adjustment: '上身贴稳支撑垫，脚掌踩稳踏板或滚轮。',
    steps: ['核心收紧并固定骨盆。', '向后蹬出训练腿。', '控制回到起始位置。'],
    safety: ['不要通过扭腰增加幅度。', '避免动作末端甩腿。'],
    commonErrors: ['腰部代偿。', '脚踝和膝盖过度发力。'],
    beginnerTip: '想象把大腿向后推，而不是小腿乱甩。',
    videoRecommendation: {
      platform: 'Bilibili',
      title: '后踢腿机教学',
      searchQuery: '后踢腿机 正确使用 教学'
    },
    similarEquipmentIds: ['hip-thrust-machine', 'hip-abductor']
  },
  {
    id: 'hip-thrust-machine',
    zhName: '臀推机',
    enName: 'Hip Thrust Machine',
    category: 'glutes',
    primaryMuscles: ['臀大肌'],
    secondaryMuscles: ['腘绳肌'],
    summary: '适合新手学习髋伸和顶髋发力的臀部器械。',
    adjustment: '让上背稳定贴住靠垫，脚掌位于膝盖正下方附近。',
    steps: ['从髋部下沉位开始。', '脚跟发力向上顶髋。', '顶端收紧臀部后控制下放。'],
    safety: ['不要过度仰头和挺腰。', '顶端保持肋骨回收。'],
    commonErrors: ['脚位太远导致腿后侧代偿。', '用下背发力顶起。'],
    beginnerTip: '先找臀部顶紧的感觉，再逐渐加重量。',
    videoRecommendation: {
      platform: 'Bilibili',
      title: '臀推机教学',
      searchQuery: '臀推机 正确使用 教学'
    },
    similarEquipmentIds: ['glute-kickback', 'leg-press']
  },
  {
    id: 'biceps-curl-machine',
    zhName: '二头弯举机',
    enName: 'Biceps Curl Machine',
    category: 'arms',
    primaryMuscles: ['肱二头肌'],
    secondaryMuscles: ['肱肌'],
    summary: '帮助新手稳定训练手臂前侧的器械。',
    adjustment: '腋窝贴住垫子，肘部与器械转轴大致对齐。',
    steps: ['手臂自然伸直起始。', '弯曲手肘把把手拉起。', '缓慢下放。'],
    safety: ['不要耸肩。', '不要用身体抬起重量。'],
    commonErrors: ['上半身晃动借力。', '放下时完全失控。'],
    beginnerTip: '动作末端停顿半秒，二头肌感觉更明显。',
    videoRecommendation: {
      platform: 'Bilibili',
      title: '二头弯举机教学',
      searchQuery: '二头弯举机 正确使用 教学'
    },
    similarEquipmentIds: ['triceps-extension-machine', 'seated-row']
  },
  {
    id: 'triceps-extension-machine',
    zhName: '三头伸展机',
    enName: 'Triceps Extension Machine',
    category: 'arms',
    primaryMuscles: ['肱三头肌'],
    secondaryMuscles: [],
    summary: '针对手臂后侧的固定训练器械。',
    adjustment: '坐稳后让肘部自然固定在器械运动轨迹内。',
    steps: ['从手肘弯曲位开始。', '向下或向前伸直手臂。', '控制回到起点。'],
    safety: ['手腕保持中立。', '肘部不要过度外张。'],
    commonErrors: ['耸肩代偿。', '借惯性猛甩。'],
    beginnerTip: '重量略轻时更容易感受到三头肌持续紧张。',
    videoRecommendation: {
      platform: 'Bilibili',
      title: '三头伸展机教学',
      searchQuery: '三头伸展机 正确使用 教学'
    },
    similarEquipmentIds: ['biceps-curl-machine', 'shoulder-press-machine']
  },
  {
    id: 'ab-crunch-machine',
    zhName: '卷腹机',
    enName: 'Ab Crunch Machine',
    category: 'core',
    primaryMuscles: ['腹直肌'],
    secondaryMuscles: ['腹斜肌'],
    summary: '提供阻力的腹部屈曲训练器械。',
    adjustment: '把手和靠垫调到能让胸廓自然向骨盆卷起的位置。',
    steps: ['收紧腹部并微含胸。', '向前卷曲上半身。', '缓慢还原到腹部有拉伸的位置。'],
    safety: ['不要用手臂猛拉把手。', '腰部不适时减轻重量。'],
    commonErrors: ['动作变成单纯低头。', '利用惯性摆动。'],
    beginnerTip: '想象肋骨向骨盆靠近，而不是头往下冲。',
    videoRecommendation: {
      platform: 'Bilibili',
      title: '卷腹机教学',
      searchQuery: '卷腹机 正确使用 教学'
    },
    similarEquipmentIds: ['back-extension-machine', 'assisted-pull-up-dip']
  },
  {
    id: 'back-extension-machine',
    zhName: '背部伸展机',
    enName: 'Back Extension Machine',
    category: 'core',
    primaryMuscles: ['竖脊肌'],
    secondaryMuscles: ['臀大肌', '腘绳肌'],
    summary: '针对后链和下背稳定能力的器械。',
    adjustment: '支撑垫高度放在髋部以下，让髋可以自然折叠。',
    steps: ['从身体前屈位开始。', '用臀部和下背力量抬起躯干。', '到身体接近一条线时停住后再下放。'],
    safety: ['不要过度后仰。', '全程保持颈部中立。'],
    commonErrors: ['在顶端过度折腰。', '抬起时速度过快。'],
    beginnerTip: '先做小幅度，确认没有下背不适后再增加范围。',
    videoRecommendation: {
      platform: 'Bilibili',
      title: '背部伸展机教学',
      searchQuery: '背部伸展机 正确使用 教学'
    },
    similarEquipmentIds: ['ab-crunch-machine', 'seated-row']
  },
  {
    id: 'assisted-pull-up-dip',
    zhName: '辅助引体向上/双杠臂屈伸机',
    enName: 'Assisted Pull-up Dip',
    category: 'compound',
    primaryMuscles: ['背阔肌', '肱三头肌'],
    secondaryMuscles: ['胸大肌', '肱二头肌'],
    summary: '通过配重辅助完成引体或双杠臂屈伸的复合器械。',
    adjustment: '先确认膝垫配重，辅助越大配重通常越重。',
    steps: ['踩上踏板并跪稳膝垫。', '选择引体或双杠握位完成动作。', '控制身体回到起始位置。'],
    safety: ['上下器械时一定扶稳。', '不要突然松手让膝垫弹回。'],
    commonErrors: ['把配重逻辑理解反。', '动作底部完全塌肩。'],
    beginnerTip: '第一次用时先从辅助更大的重量开始。',
    videoRecommendation: {
      platform: 'Bilibili',
      title: '辅助引体机教学',
      searchQuery: '辅助引体向上机 正确使用 教学'
    },
    similarEquipmentIds: ['lat-pulldown', 'triceps-extension-machine']
  },
  {
    id: 'hack-squat-machine',
    zhName: '哈克深蹲机',
    enName: 'Hack Squat Machine',
    category: 'legs',
    primaryMuscles: ['股四头肌', '臀大肌'],
    secondaryMuscles: ['腘绳肌'],
    summary: '固定轨迹深蹲器械，适合练下肢力量。',
    adjustment: '肩膀顶住护垫，脚位略靠前，双脚与肩同宽。',
    steps: ['解锁安全把手。', '屈膝下蹲到合适深度。', '脚掌踩实向上推回。'],
    safety: ['膝盖方向跟随脚尖。', '不要在底部失控反弹。'],
    commonErrors: ['膝盖内扣。', '脚跟抬起。'],
    beginnerTip: '先用较浅范围熟悉轨迹，再逐步加深。',
    videoRecommendation: {
      platform: 'Bilibili',
      title: '哈克深蹲机教学',
      searchQuery: '哈克深蹲机 正确使用 教学'
    },
    similarEquipmentIds: ['leg-press', 'calf-raise-machine']
  },
  {
    id: 'calf-raise-machine',
    zhName: '提踵机',
    enName: 'Calf Raise Machine',
    category: 'legs',
    primaryMuscles: ['腓肠肌', '比目鱼肌'],
    secondaryMuscles: [],
    summary: '针对小腿肌群的固定器械。',
    adjustment: '前脚掌踩在踏板边缘，肩部或髋部顶住支撑垫。',
    steps: ['从脚跟略低于踏板开始。', '向上踮起脚尖。', '缓慢下放到拉伸位。'],
    safety: ['动作不要弹震。', '脚踝活动范围以舒适为准。'],
    commonErrors: ['只做上半程。', '借膝盖晃动。'],
    beginnerTip: '顶端停顿一秒，会更容易感受到小腿收缩。',
    videoRecommendation: {
      platform: 'Bilibili',
      title: '提踵机教学',
      searchQuery: '提踵机 正确使用 教学'
    },
    similarEquipmentIds: ['leg-press', 'hack-squat-machine']
  }
];

export const equipmentCatalog = rawCatalog.map((item) => equipmentCardSchema.parse(item));

export function getSupportedEquipmentIds(): string[] {
  return equipmentCatalog.map((item) => item.id);
}

export function getEquipmentCard(id: string): EquipmentCard | undefined {
  return equipmentCatalog.find((item) => item.id === id);
}
```

```ts
// packages/shared/src/index.ts
export * from './catalog';
export * from './schemas';
```

- [ ] **Step 4: Run the shared package tests**

Run:

```bash
corepack pnpm install
corepack pnpm vitest run packages/shared/src/catalog.test.ts
```

Expected: PASS with `3 passed`.

- [ ] **Step 5: Commit the bootstrap**

```bash
git add package.json pnpm-workspace.yaml tsconfig.base.json vitest.workspace.ts .gitignore packages/shared
git commit -m "feat: bootstrap shared equipment catalog"
```

### Task 2: Implement the recognition API with deterministic test coverage

**Files:**
- Create: `services/api/package.json`
- Create: `services/api/tsconfig.json`
- Create: `services/api/src/app.ts`
- Create: `services/api/src/server.ts`
- Create: `services/api/src/env.ts`
- Create: `services/api/src/lib/catalog-service.ts`
- Create: `services/api/src/lib/recognizers/types.ts`
- Create: `services/api/src/lib/recognizers/mock.ts`
- Create: `services/api/src/routes/recognitions.ts`
- Create: `services/api/src/routes/recognitions.test.ts`

- [ ] **Step 1: Write the failing API route test**

```ts
// services/api/src/routes/recognitions.test.ts
import { describe, expect, it } from 'vitest';
import { buildApp } from '../app';
import type { Recognizer } from '../lib/recognizers/types';

const stubRecognizer: Recognizer = {
  async recognize() {
    return {
      topMatchId: 'lat-pulldown',
      confidence: 0.91,
      alternatives: ['assisted-pull-up-dip', 'seated-row']
    };
  }
};

describe('POST /api/recognitions', () => {
  it('returns a recognized equipment card payload', async () => {
    const app = buildApp({ recognizer: stubRecognizer });

    const response = await app.inject({
      method: 'POST',
      url: '/api/recognitions',
      payload: {
        imageBase64: Buffer.from('fixture-image').toString('base64'),
        source: 'camera'
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      status: 'recognized',
      equipment: {
        id: 'lat-pulldown',
        zhName: '高位下拉'
      },
      confidence: 0.91,
      alternatives: ['assisted-pull-up-dip', 'seated-row']
    });
  });
});
```

- [ ] **Step 2: Run the API test to verify the service does not exist yet**

Run:

```bash
corepack pnpm vitest run services/api/src/routes/recognitions.test.ts
```

Expected: FAIL with `Cannot find module '../app'`.

- [ ] **Step 3: Create the API package, route, and mock recognizer**

```json
// services/api/package.json
{
  "name": "@gym-equipment-ai/api",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "test": "vitest run",
    "typecheck": "tsc -p tsconfig.json --noEmit"
  },
  "dependencies": {
    "@fastify/cors": "^11.0.1",
    "@gym-equipment-ai/shared": "workspace:*",
    "fastify": "^5.3.2",
    "zod": "^4.0.0"
  },
  "devDependencies": {
    "@types/node": "^24.0.0",
    "tsx": "^4.19.4",
    "typescript": "^5.8.3",
    "vitest": "^3.2.4"
  }
}
```

```json
// services/api/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "types": ["node"]
  },
  "include": ["src"]
}
```

```ts
// services/api/src/lib/recognizers/types.ts
export interface RecognitionResult {
  topMatchId: string | null;
  confidence: number;
  alternatives: string[];
}

export interface Recognizer {
  recognize(input: { imageBase64: string; source: 'camera' | 'album' }): Promise<RecognitionResult>;
}
```

```ts
// services/api/src/lib/catalog-service.ts
import { getEquipmentCard, getSupportedEquipmentIds } from '@gym-equipment-ai/shared';

export function resolveEquipmentPayload(id: string) {
  return getEquipmentCard(id);
}

export function isSupportedEquipment(id: string) {
  return getSupportedEquipmentIds().includes(id);
}
```

```ts
// services/api/src/lib/recognizers/mock.ts
import type { Recognizer } from './types';

const fixtureMap: Record<string, { id: string; confidence: number; alternatives: string[] }> = {
  chest: { id: 'seated-chest-press', confidence: 0.88, alternatives: ['pec-deck-fly', 'shoulder-press-machine'] },
  back: { id: 'lat-pulldown', confidence: 0.91, alternatives: ['assisted-pull-up-dip', 'seated-row'] },
  legs: { id: 'leg-press', confidence: 0.9, alternatives: ['hack-squat-machine', 'leg-extension'] }
};

export const mockRecognizer: Recognizer = {
  async recognize({ imageBase64 }) {
    const decoded = Buffer.from(imageBase64, 'base64').toString('utf8').toLowerCase();
    if (decoded.includes('chest')) return { topMatchId: fixtureMap.chest.id, confidence: fixtureMap.chest.confidence, alternatives: fixtureMap.chest.alternatives };
    if (decoded.includes('back')) return { topMatchId: fixtureMap.back.id, confidence: fixtureMap.back.confidence, alternatives: fixtureMap.back.alternatives };
    if (decoded.includes('legs')) return { topMatchId: fixtureMap.legs.id, confidence: fixtureMap.legs.confidence, alternatives: fixtureMap.legs.alternatives };
    return { topMatchId: null, confidence: 0.12, alternatives: [] };
  }
};
```

```ts
// services/api/src/routes/recognitions.ts
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { resolveEquipmentPayload } from '../lib/catalog-service';
import type { Recognizer } from '../lib/recognizers/types';

const requestSchema = z.object({
  imageBase64: z.string().min(16),
  source: z.enum(['camera', 'album'])
});

export function registerRecognitionRoutes(app: FastifyInstance, recognizer: Recognizer) {
  app.post('/api/recognitions', async (request, reply) => {
    const body = requestSchema.parse(request.body);
    const result = await recognizer.recognize(body);

    if (!result.topMatchId) {
      return reply.status(200).send({
        status: 'unsupported',
        message: '这类器械暂未收录，请尝试重新拍摄或查看支持列表。'
      });
    }

    const equipment = resolveEquipmentPayload(result.topMatchId);
    if (!equipment) {
      return reply.status(500).send({
        status: 'error',
        message: '识别结果未能映射到器械内容，请检查目录数据。'
      });
    }

    return {
      status: result.confidence >= 0.75 ? 'recognized' : 'low_confidence',
      equipment,
      confidence: result.confidence,
      alternatives: result.alternatives
    };
  });
}
```

```ts
// services/api/src/app.ts
import cors from '@fastify/cors';
import Fastify from 'fastify';
import { registerRecognitionRoutes } from './routes/recognitions';
import { mockRecognizer } from './lib/recognizers/mock';
import type { Recognizer } from './lib/recognizers/types';

export function buildApp(options?: { recognizer?: Recognizer }) {
  const app = Fastify({ logger: false });
  app.register(cors, { origin: true });
  registerRecognitionRoutes(app, options?.recognizer ?? mockRecognizer);
  return app;
}
```

```ts
// services/api/src/env.ts
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  RECOGNIZER_PROVIDER: z.enum(['mock', 'openai']).default('mock')
});

export const env = envSchema.parse(process.env);
```

```ts
// services/api/src/server.ts
import { buildApp } from './app';
import { env } from './env';

const app = buildApp();

app.listen({ host: '0.0.0.0', port: env.PORT }).catch((error) => {
  app.log.error(error);
  process.exit(1);
});
```

- [ ] **Step 4: Run the API tests**

Run:

```bash
corepack pnpm vitest run services/api/src/routes/recognitions.test.ts
```

Expected: PASS with `1 passed`.

- [ ] **Step 5: Commit the API vertical slice**

```bash
git add services/api
git commit -m "feat: add recognition api with mock recognizer"
```

### Task 3: Integrate the OpenAI image recognizer behind the recognizer interface

**Files:**
- Modify: `services/api/package.json`
- Modify: `services/api/src/env.ts`
- Create: `services/api/src/lib/recognizers/openai.ts`
- Modify: `services/api/src/app.ts`
- Modify: `services/api/src/routes/recognitions.test.ts`
- Create: `services/api/.env.example`

- [ ] **Step 1: Add a failing recognizer selection test**

```ts
// services/api/src/routes/recognitions.test.ts
import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildApp } from '../app';
import type { Recognizer } from '../lib/recognizers/types';

afterEach(() => {
  vi.restoreAllMocks();
});

it('uses the provided recognizer implementation instead of the default provider', async () => {
  const recognizer: Recognizer = {
    recognize: vi.fn(async () => ({
      topMatchId: 'leg-press',
      confidence: 0.93,
      alternatives: ['hack-squat-machine', 'leg-extension']
    }))
  };

  const app = buildApp({ recognizer });
  await app.inject({
    method: 'POST',
    url: '/api/recognitions',
    payload: {
      imageBase64: Buffer.from('legs-fixture').toString('base64'),
      source: 'album'
    }
  });

  expect(recognizer.recognize).toHaveBeenCalledWith({
    imageBase64: Buffer.from('legs-fixture').toString('base64'),
    source: 'album'
  });
});
```

- [ ] **Step 2: Run the recognizer-selection test**

Run:

```bash
corepack pnpm vitest run services/api/src/routes/recognitions.test.ts
```

Expected: FAIL with a matcher error if the recognizer wiring is not yet verified end to end.

- [ ] **Step 3: Add the OpenAI provider and provider selection**

```json
// services/api/package.json
{
  "name": "@gym-equipment-ai/api",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "test": "vitest run",
    "typecheck": "tsc -p tsconfig.json --noEmit"
  },
  "dependencies": {
    "@fastify/cors": "^11.0.1",
    "@gym-equipment-ai/shared": "workspace:*",
    "fastify": "^5.3.2",
    "openai": "^5.7.0",
    "zod": "^4.0.0"
  },
  "devDependencies": {
    "@types/node": "^24.0.0",
    "tsx": "^4.19.4",
    "typescript": "^5.8.3",
    "vitest": "^3.2.4"
  }
}
```

```ts
// services/api/src/env.ts
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  RECOGNIZER_PROVIDER: z.enum(['mock', 'openai']).default('mock'),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-4.1-mini')
});

export const env = envSchema.parse(process.env);
```

```ts
// services/api/src/lib/recognizers/openai.ts
import OpenAI from 'openai';
import { getSupportedEquipmentIds } from '@gym-equipment-ai/shared';
import type { Recognizer, RecognitionResult } from './types';

export function createOpenAiRecognizer(options: { apiKey: string; model: string }): Recognizer {
  const client = new OpenAI({ apiKey: options.apiKey });
  const supportedIds = getSupportedEquipmentIds();

  return {
    async recognize({ imageBase64, source }): Promise<RecognitionResult> {
      const response = await client.responses.create({
        model: options.model,
        input: [
          {
            role: 'system',
            content: [
              {
                type: 'input_text',
                text: `You classify Chinese gym machine photos. Choose one id from this list only: ${supportedIds.join(', ')}. If the machine is not confidently one of these ids, return topMatchId as null and confidence <= 0.4.`
              }
            ]
          },
          {
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: `Source: ${source}. Return JSON only.`
              },
              {
                type: 'input_image',
                image_url: `data:image/jpeg;base64,${imageBase64}`,
                detail: 'high'
              }
            ]
          }
        ],
        text: {
          format: {
            type: 'json_schema',
            name: 'equipment_recognition',
            schema: {
              type: 'object',
              additionalProperties: false,
              properties: {
                topMatchId: {
                  anyOf: [
                    { type: 'string', enum: supportedIds },
                    { type: 'null' }
                  ]
                },
                confidence: { type: 'number', minimum: 0, maximum: 1 },
                alternatives: {
                  type: 'array',
                  items: { type: 'string', enum: supportedIds },
                  maxItems: 3
                }
              },
              required: ['topMatchId', 'confidence', 'alternatives']
            }
          }
        }
      });

      const parsed = JSON.parse(response.output_text);
      return {
        topMatchId: parsed.topMatchId,
        confidence: parsed.confidence,
        alternatives: parsed.alternatives
      };
    }
  };
}
```

```ts
// services/api/src/app.ts
import cors from '@fastify/cors';
import Fastify from 'fastify';
import { env } from './env';
import { mockRecognizer } from './lib/recognizers/mock';
import { createOpenAiRecognizer } from './lib/recognizers/openai';
import type { Recognizer } from './lib/recognizers/types';
import { registerRecognitionRoutes } from './routes/recognitions';

function defaultRecognizer(): Recognizer {
  if (env.RECOGNIZER_PROVIDER === 'openai') {
    if (!env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is required when RECOGNIZER_PROVIDER=openai');
    }

    return createOpenAiRecognizer({
      apiKey: env.OPENAI_API_KEY,
      model: env.OPENAI_MODEL
    });
  }

  return mockRecognizer;
}

export function buildApp(options?: { recognizer?: Recognizer }) {
  const app = Fastify({ logger: false });
  app.register(cors, { origin: true });
  registerRecognitionRoutes(app, options?.recognizer ?? defaultRecognizer());
  return app;
}
```

```dotenv
# services/api/.env.example
PORT=3001
RECOGNIZER_PROVIDER=mock
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
```

- [ ] **Step 4: Re-run the API tests and typecheck**

Run:

```bash
corepack pnpm vitest run services/api/src/routes/recognitions.test.ts
corepack pnpm --filter @gym-equipment-ai/api typecheck
```

Expected: PASS for tests, and `Found 0 errors` or equivalent for TypeScript.

- [ ] **Step 5: Commit the production recognizer integration**

```bash
git add services/api
git commit -m "feat: add openai-backed equipment recognizer"
```

### Task 4: Build the mini program shell and photo capture flow

**Files:**
- Create: `apps/miniprogram/package.json`
- Create: `apps/miniprogram/tsconfig.json`
- Create: `apps/miniprogram/project.config.json`
- Create: `apps/miniprogram/miniprogram/app.ts`
- Create: `apps/miniprogram/miniprogram/app.d.ts`
- Create: `apps/miniprogram/miniprogram/app.json`
- Create: `apps/miniprogram/miniprogram/app.wxss`
- Create: `apps/miniprogram/miniprogram/pages/home/index.json`
- Create: `apps/miniprogram/miniprogram/pages/home/index.wxml`
- Create: `apps/miniprogram/miniprogram/pages/home/index.wxss`
- Create: `apps/miniprogram/miniprogram/pages/home/index.ts`
- Create: `apps/miniprogram/miniprogram/pages/capture/index.json`
- Create: `apps/miniprogram/miniprogram/pages/capture/index.wxml`
- Create: `apps/miniprogram/miniprogram/pages/capture/index.wxss`
- Create: `apps/miniprogram/miniprogram/pages/capture/index.ts`
- Create: `apps/miniprogram/miniprogram/utils/api.ts`

- [ ] **Step 1: Write the failing frontend utility test**

```ts
// apps/miniprogram/tests/result-view-model.test.ts
import { describe, expect, it } from 'vitest';
import { buildResultNavigationUrl } from '../miniprogram/utils/api';

describe('result navigation url', () => {
  it('builds a result page url from an API payload id', () => {
    expect(buildResultNavigationUrl('lat-pulldown')).toBe('/pages/result/index?id=lat-pulldown');
  });
});
```

- [ ] **Step 2: Run the frontend test to verify the utility is missing**

Run:

```bash
corepack pnpm vitest run apps/miniprogram/tests/result-view-model.test.ts
```

Expected: FAIL with `Cannot find module '../miniprogram/utils/api'`.

- [ ] **Step 3: Create the mini program shell, home page, capture page, and API client**

```json
// apps/miniprogram/package.json
{
  "name": "@gym-equipment-ai/miniprogram",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "vitest run",
    "typecheck": "tsc -p tsconfig.json --noEmit"
  },
  "devDependencies": {
    "@types/wechat-miniprogram": "^3.4.7",
    "typescript": "^5.8.3",
    "vitest": "^3.2.4"
  }
}
```

```json
// apps/miniprogram/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "types": ["wechat-miniprogram", "node"],
    "rootDir": "."
  },
  "include": ["miniprogram/**/*.ts", "tests/**/*.ts"]
}
```

```json
// apps/miniprogram/project.config.json
{
  "miniprogramRoot": "miniprogram/",
  "projectname": "gym-equipment-ai",
  "appid": "touristappid",
  "compileType": "miniprogram",
  "setting": {
    "es6": true,
    "minified": false
  }
}
```

```ts
// apps/miniprogram/miniprogram/app.ts
App<IAppOption>({
  globalData: {
    apiBaseUrl: 'http://127.0.0.1:3001'
  }
});
```

```json
// apps/miniprogram/miniprogram/app.json
{
  "pages": [
    "pages/home/index",
    "pages/capture/index",
    "pages/result/index",
    "pages/equipment-list/index"
  ],
  "window": {
    "navigationBarTitleText": "器械识别",
    "navigationBarBackgroundColor": "#f7f5ef",
    "navigationBarTextStyle": "black",
    "backgroundColor": "#f7f5ef"
  },
  "style": "v2"
}
```

```ts
// apps/miniprogram/miniprogram/app.d.ts
interface IAppOption {
  globalData: {
    apiBaseUrl: string;
  };
}
```

```css
/* apps/miniprogram/miniprogram/app.wxss */
page {
  background: #f7f5ef;
  color: #1f2a1f;
  font-family: Arial, sans-serif;
}

.primary-button {
  background: #1f6f50;
  color: #fff;
  border-radius: 16rpx;
}
```

```ts
// apps/miniprogram/miniprogram/utils/api.ts
type RecognitionPayload = {
  status: 'recognized' | 'low_confidence' | 'unsupported';
  equipment?: {
    id: string;
  };
  confidence?: number;
  alternatives?: string[];
  message?: string;
};

function getApiBaseUrl() {
  return getApp<IAppOption>().globalData.apiBaseUrl;
}

export function buildResultNavigationUrl(id: string) {
  return `/pages/result/index?id=${encodeURIComponent(id)}`;
}

export async function recognizeEquipment(imageBase64: string, source: 'camera' | 'album'): Promise<RecognitionPayload> {
  return new Promise((resolve, reject) => {
    wx.request<RecognitionPayload>({
      url: `${getApiBaseUrl()}/api/recognitions`,
      method: 'POST',
      data: {
        imageBase64,
        source
      },
      success: (response) => resolve(response.data),
      fail: reject
    });
  });
}

export async function readFileAsBase64(path: string): Promise<string> {
  const fileSystemManager = wx.getFileSystemManager();
  return new Promise((resolve, reject) => {
    fileSystemManager.readFile({
      filePath: path,
      encoding: 'base64',
      success: (result) => resolve(result.data as string),
      fail: reject
    });
  });
}

export async function chooseSingleImageFromAlbum(): Promise<string> {
  return new Promise((resolve, reject) => {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album'],
      success: (media) => resolve(media.tempFiles[0].tempFilePath),
      fail: reject
    });
  });
}

export async function takeSinglePhoto(): Promise<string> {
  const cameraContext = wx.createCameraContext();
  return new Promise((resolve, reject) => {
    cameraContext.takePhoto({
      quality: 'high',
      success: (photo) => resolve(photo.tempImagePath),
      fail: reject
    });
  });
}
```

```json
// apps/miniprogram/miniprogram/pages/home/index.json
{
  "navigationBarTitleText": "拍照识别器械"
}
```

```xml
<!-- apps/miniprogram/miniprogram/pages/home/index.wxml -->
<view class="page">
  <view class="hero">
    <text class="title">拍一下，马上知道器械怎么用</text>
    <text class="subtitle">适合健身新手的固定器械识别与入门说明</text>
  </view>

  <button class="primary-button action" bindtap="goToCapture">拍照识别器械</button>
  <button class="secondary-button action" bindtap="chooseFromAlbum">从相册导入</button>
  <button class="ghost-link" bindtap="goToEquipmentList">查看支持识别的器械</button>
</view>
```

```css
/* apps/miniprogram/miniprogram/pages/home/index.wxss */
.page {
  padding: 48rpx 32rpx;
}

.hero {
  margin-top: 80rpx;
  margin-bottom: 72rpx;
}

.title {
  display: block;
  font-size: 52rpx;
  font-weight: 700;
  line-height: 1.3;
}

.subtitle {
  display: block;
  margin-top: 20rpx;
  font-size: 28rpx;
  color: #4d5f53;
  line-height: 1.6;
}

.action {
  margin-top: 24rpx;
}

.secondary-button {
  background: #dfe9e1;
  color: #1f2a1f;
  border-radius: 16rpx;
}

.ghost-link {
  margin-top: 32rpx;
  color: #1f6f50;
  text-align: center;
}
```

```ts
// apps/miniprogram/miniprogram/pages/home/index.ts
import { chooseSingleImageFromAlbum, readFileAsBase64, recognizeEquipment, buildResultNavigationUrl } from '../../utils/api';

Page({
  async chooseFromAlbum() {
    const tempFilePath = await chooseSingleImageFromAlbum();
    wx.showLoading({ title: '识别中' });
    try {
      const imageBase64 = await readFileAsBase64(tempFilePath);
      const result = await recognizeEquipment(imageBase64, 'album');
      if (result.equipment?.id) {
        wx.navigateTo({ url: buildResultNavigationUrl(result.equipment.id) });
        return;
      }

      wx.navigateTo({ url: `/pages/result/index?status=${result.status}` });
    } finally {
      wx.hideLoading();
    }
  },

  goToCapture() {
    wx.navigateTo({ url: '/pages/capture/index' });
  },

  goToEquipmentList() {
    wx.navigateTo({ url: '/pages/equipment-list/index' });
  }
});
```

```json
// apps/miniprogram/miniprogram/pages/capture/index.json
{
  "navigationBarTitleText": "拍照识别"
}
```

```xml
<!-- apps/miniprogram/miniprogram/pages/capture/index.wxml -->
<view class="camera-page">
  <camera id="camera" class="camera" device-position="back" flash="off"></camera>
  <view class="hint-card">
    <text>请尽量拍完整器械，避免多人遮挡</text>
  </view>
  <button class="primary-button capture-button" bindtap="takePhoto">拍照识别</button>
</view>
```

```css
/* apps/miniprogram/miniprogram/pages/capture/index.wxss */
.camera-page {
  padding: 24rpx;
}

.camera {
  width: 100%;
  height: 920rpx;
  border-radius: 24rpx;
  overflow: hidden;
}

.hint-card {
  margin-top: 24rpx;
  padding: 24rpx;
  background: #ffffff;
  border-radius: 20rpx;
  color: #4d5f53;
}

.capture-button {
  margin-top: 24rpx;
}
```

```ts
// apps/miniprogram/miniprogram/pages/capture/index.ts
import { buildResultNavigationUrl, readFileAsBase64, recognizeEquipment, takeSinglePhoto } from '../../utils/api';

Page({
  async takePhoto() {
    wx.showLoading({ title: '识别中' });
    try {
      const tempImagePath = await takeSinglePhoto();
      const imageBase64 = await readFileAsBase64(tempImagePath);
      const result = await recognizeEquipment(imageBase64, 'camera');

      if (result.equipment?.id) {
        wx.navigateTo({ url: buildResultNavigationUrl(result.equipment.id) });
        return;
      }

      wx.navigateTo({ url: `/pages/result/index?status=${result.status}` });
    } finally {
      wx.hideLoading();
    }
  }
});
```

- [ ] **Step 4: Run the frontend test and typecheck**

Run:

```bash
corepack pnpm vitest run apps/miniprogram/tests/result-view-model.test.ts
corepack pnpm --filter @gym-equipment-ai/miniprogram typecheck
```

Expected: PASS for the unit test, and no TypeScript errors.

- [ ] **Step 5: Commit the mini program capture flow**

```bash
git add apps/miniprogram
git commit -m "feat: add mini program shell and capture flow"
```

### Task 5: Implement the result page, supported-equipment list, and client-side history

**Files:**
- Create: `scripts/sync-catalog.ts`
- Create: `apps/miniprogram/miniprogram/data/catalog.ts`
- Create: `apps/miniprogram/miniprogram/pages/result/index.json`
- Create: `apps/miniprogram/miniprogram/pages/result/index.wxml`
- Create: `apps/miniprogram/miniprogram/pages/result/index.wxss`
- Create: `apps/miniprogram/miniprogram/pages/result/index.ts`
- Create: `apps/miniprogram/miniprogram/pages/equipment-list/index.json`
- Create: `apps/miniprogram/miniprogram/pages/equipment-list/index.wxml`
- Create: `apps/miniprogram/miniprogram/pages/equipment-list/index.wxss`
- Create: `apps/miniprogram/miniprogram/pages/equipment-list/index.ts`
- Create: `apps/miniprogram/miniprogram/utils/history.ts`
- Create: `apps/miniprogram/miniprogram/utils/result-view-model.ts`
- Modify: `apps/miniprogram/tests/result-view-model.test.ts`

- [ ] **Step 1: Expand the failing frontend tests for result rendering**

```ts
// apps/miniprogram/tests/result-view-model.test.ts
import { describe, expect, it } from 'vitest';
import { buildResultNavigationUrl } from '../miniprogram/utils/api';
import { buildUnsupportedState, buildVideoSearchCopy } from '../miniprogram/utils/result-view-model';

describe('result view model', () => {
  it('builds a result page url from an API payload id', () => {
    expect(buildResultNavigationUrl('lat-pulldown')).toBe('/pages/result/index?id=lat-pulldown');
  });

  it('builds an unsupported fallback message', () => {
    expect(buildUnsupportedState()).toEqual({
      title: '这类器械暂未收录',
      actionLabel: '查看支持识别的器械'
    });
  });

  it('formats a copy-friendly video search string', () => {
    expect(
      buildVideoSearchCopy({
        platform: 'Bilibili',
        title: '高位下拉新手教学',
        searchQuery: '高位下拉 正确使用 教学'
      })
    ).toBe('Bilibili｜高位下拉新手教学｜高位下拉 正确使用 教学');
  });
});
```

- [ ] **Step 2: Run the frontend tests to verify the result helpers are missing**

Run:

```bash
corepack pnpm vitest run apps/miniprogram/tests/result-view-model.test.ts
```

Expected: FAIL with `Cannot find module '../miniprogram/utils/result-view-model'`.

- [ ] **Step 3: Create the result page, equipment list, and local history helpers**

```ts
// apps/miniprogram/miniprogram/utils/history.ts
const HISTORY_KEY = 'equipment-history';

export function readHistory(): string[] {
  return wx.getStorageSync(HISTORY_KEY) || [];
}

export function pushHistory(id: string) {
  const current = readHistory().filter((item) => item !== id);
  const next = [id, ...current].slice(0, 10);
  wx.setStorageSync(HISTORY_KEY, next);
}
```

```ts
// apps/miniprogram/miniprogram/utils/result-view-model.ts
type VideoRecommendation = {
  platform: string;
  title: string;
  searchQuery: string;
};

export function buildUnsupportedState() {
  return {
    title: '这类器械暂未收录',
    actionLabel: '查看支持识别的器械'
  };
}

export function buildVideoSearchCopy(video: VideoRecommendation) {
  return `${video.platform}｜${video.title}｜${video.searchQuery}`;
}
```

```ts
// scripts/sync-catalog.ts
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { equipmentCatalog } from '../packages/shared/src/catalog.ts';

const targetPath = resolve('apps/miniprogram/miniprogram/data/catalog.ts');
const output = `export const equipmentCatalog = ${JSON.stringify(equipmentCatalog, null, 2)} as const;

export function getEquipmentCard(id: string) {
  return equipmentCatalog.find((item) => item.id === id) ?? null;
}
`;

await mkdir(resolve('apps/miniprogram/miniprogram/data'), { recursive: true });
await writeFile(targetPath, output, 'utf8');
console.log(`Catalog synced to ${targetPath}`);
```

```ts
// apps/miniprogram/miniprogram/data/catalog.ts
export const equipmentCatalog = [] as const;

export function getEquipmentCard(_id: string) {
  return null;
}
```

```json
// apps/miniprogram/miniprogram/pages/result/index.json
{
  "navigationBarTitleText": "识别结果"
}
```

```xml
<!-- apps/miniprogram/miniprogram/pages/result/index.wxml -->
<view wx:if="{{unsupported}}" class="result-page">
  <view class="card">
    <text class="result-title">{{unsupported.title}}</text>
    <button class="primary-button" bindtap="goToEquipmentList">{{unsupported.actionLabel}}</button>
  </view>
</view>

<view wx:else class="result-page">
  <view class="hero-card">
    <text class="zh-name">{{equipment.zhName}}</text>
    <text class="en-name">{{equipment.enName}}</text>
    <text class="summary">{{equipment.summary}}</text>
  </view>

  <view class="section-card">
    <text class="section-title">主要训练肌群</text>
    <text>{{equipment.primaryMuscles.join('、')}}</text>
  </view>

  <view class="section-card">
    <text class="section-title">怎么调节</text>
    <text>{{equipment.adjustment}}</text>
  </view>

  <view class="section-card">
    <text class="section-title">标准使用步骤</text>
    <block wx:for="{{equipment.steps}}" wx:key="index">
      <text class="list-line">{{index + 1}}. {{item}}</text>
    </block>
  </view>

  <view class="section-card">
    <text class="section-title">安全注意事项</text>
    <block wx:for="{{equipment.safety}}" wx:key="index">
      <text class="list-line">- {{item}}</text>
    </block>
  </view>

  <view class="section-card">
    <text class="section-title">常见错误</text>
    <block wx:for="{{equipment.commonErrors}}" wx:key="index">
      <text class="list-line">- {{item}}</text>
    </block>
  </view>

  <view class="section-card">
    <text class="section-title">继续看教学</text>
    <text>{{equipment.videoRecommendation.platform}}</text>
    <text>{{equipment.videoRecommendation.title}}</text>
    <text>{{equipment.videoRecommendation.searchQuery}}</text>
    <button class="primary-button" bindtap="copyVideoSearch">复制视频搜索词</button>
  </view>

  <view wx:if="{{showLowConfidence}}" class="section-card warning-card">
    <text class="section-title">识别可能有误</text>
    <text>你可以改看这些相似器械：{{equipment.similarEquipmentIds.join('、')}}</text>
  </view>

  <view class="footer-note">
    <text>内容仅供健身入门参考，如有伤病或特殊身体情况，请咨询专业人士。</text>
  </view>
</view>
```

```css
/* apps/miniprogram/miniprogram/pages/result/index.wxss */
.result-page {
  padding: 24rpx;
}

.hero-card,
.section-card {
  margin-bottom: 20rpx;
  padding: 28rpx;
  background: #ffffff;
  border-radius: 20rpx;
}

.zh-name {
  display: block;
  font-size: 48rpx;
  font-weight: 700;
}

.en-name {
  display: block;
  margin-top: 8rpx;
  color: #617166;
}

.summary {
  display: block;
  margin-top: 20rpx;
  line-height: 1.7;
}

.section-title {
  display: block;
  margin-bottom: 14rpx;
  font-size: 30rpx;
  font-weight: 600;
}

.list-line {
  display: block;
  margin-top: 10rpx;
  line-height: 1.7;
}

.warning-card {
  border: 2rpx solid #d8b24a;
}

.footer-note {
  padding: 12rpx 8rpx 32rpx;
  color: #617166;
  line-height: 1.6;
}
```

```ts
// apps/miniprogram/miniprogram/pages/result/index.ts
import { getEquipmentCard } from '../../data/catalog';
import { pushHistory } from '../../utils/history';
import { buildUnsupportedState, buildVideoSearchCopy } from '../../utils/result-view-model';

Page({
  data: {
    equipment: null,
    unsupported: null,
    showLowConfidence: false
  },

  onLoad(query: Record<string, string>) {
    if (query.status === 'unsupported') {
      this.setData({ unsupported: buildUnsupportedState() });
      return;
    }

    const equipment = query.id ? getEquipmentCard(query.id) : null;
    if (!equipment) {
      this.setData({ unsupported: buildUnsupportedState() });
      return;
    }

    pushHistory(equipment.id);
    this.setData({
      equipment,
      showLowConfidence: query.status === 'low_confidence'
    });
  },

  copyVideoSearch() {
    const equipment = this.data.equipment;
    if (!equipment) return;

    wx.setClipboardData({
      data: buildVideoSearchCopy(equipment.videoRecommendation),
      success: () => {
        wx.showToast({ title: '已复制搜索词', icon: 'success' });
      }
    });
  },

  goToEquipmentList() {
    wx.navigateTo({ url: '/pages/equipment-list/index' });
  }
});
```

```json
// apps/miniprogram/miniprogram/pages/equipment-list/index.json
{
  "navigationBarTitleText": "支持识别的器械"
}
```

```xml
<!-- apps/miniprogram/miniprogram/pages/equipment-list/index.wxml -->
<view class="list-page">
  <block wx:for="{{equipmentList}}" wx:key="id">
    <view class="equipment-card" bindtap="openResult" data-id="{{item.id}}">
      <text class="zh-name">{{item.zhName}}</text>
      <text class="en-name">{{item.enName}}</text>
      <text class="summary">{{item.summary}}</text>
    </view>
  </block>
</view>
```

```css
/* apps/miniprogram/miniprogram/pages/equipment-list/index.wxss */
.list-page {
  padding: 24rpx;
}

.equipment-card {
  margin-bottom: 18rpx;
  padding: 24rpx;
  background: #ffffff;
  border-radius: 18rpx;
}
```

```ts
// apps/miniprogram/miniprogram/pages/equipment-list/index.ts
import { equipmentCatalog } from '../../data/catalog';

Page({
  data: {
    equipmentList: equipmentCatalog
  },

  openResult(event: WechatMiniprogram.BaseEvent) {
    const id = event.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/result/index?id=${id}` });
  }
});
```

Run after creating the script:

```bash
corepack pnpm sync:catalog
```

Expected: `Catalog synced to .../apps/miniprogram/miniprogram/data/catalog.ts`

- [ ] **Step 4: Run the frontend tests again**

Run:

```bash
corepack pnpm vitest run apps/miniprogram/tests/result-view-model.test.ts
corepack pnpm --filter @gym-equipment-ai/miniprogram typecheck
```

Expected: PASS with `3 passed`, and no TypeScript errors.

- [ ] **Step 5: Commit the result experience**

```bash
git add apps/miniprogram
git commit -m "feat: add result page and equipment browser"
```

### Task 6: Add developer setup docs, manual QA, and a release checklist

**Files:**
- Create: `README.md`
- Create: `docs/qa/manual-smoke-test.md`

- [ ] **Step 1: Write the failing documentation expectation as a checklist**

```md
<!-- docs/qa/manual-smoke-test.md -->
# Manual Smoke Test

- [ ] The API starts locally on port `3001`
- [ ] The mini program home page shows primary and secondary actions
- [ ] Camera capture can navigate to a result page
- [ ] Album import can navigate to a result page
- [ ] Unsupported input shows the fallback state
- [ ] The result page can copy the video search string
- [ ] The equipment list opens a known result page
```

- [ ] **Step 2: Run a workspace test pass before writing the docs**

Run:

```bash
corepack pnpm test
```

Expected: PASS for the existing Vitest suites.

- [ ] **Step 3: Write the project README and QA procedure**

```md
<!-- README.md -->
# Gym Equipment AI

WeChat mini program plus Fastify API for recognizing common fixed gym machines and serving curated beginner-friendly teaching cards.

## Workspace layout

- `apps/miniprogram`: native WeChat mini program client
- `services/api`: recognition API
- `packages/shared`: shared catalog and schemas

## Local development

1. Install dependencies:
   ```bash
   corepack pnpm install
   ```
2. Start the API:
   ```bash
   cp services/api/.env.example services/api/.env
   corepack pnpm --filter @gym-equipment-ai/api dev
   ```
3. Open `apps/miniprogram` in WeChat Developer Tools.
4. Set the request domain to local debug mode or add a local tunnel before device testing.

## Recognition providers

- `mock`: deterministic local development provider
- `openai`: image recognition through the OpenAI Responses API

## Release checklist

1. Confirm the 20 launch equipment cards are complete and reviewed for safety wording.
2. Run `corepack pnpm test`.
3. Run `corepack pnpm typecheck`.
4. Execute `docs/qa/manual-smoke-test.md` in WeChat Developer Tools.
5. Replace `touristappid` in `apps/miniprogram/project.config.json` with the real AppID before upload.
```

```md
<!-- docs/qa/manual-smoke-test.md -->
# Manual Smoke Test

## Environment

- API running on `http://127.0.0.1:3001`
- WeChat Developer Tools opened on `apps/miniprogram`
- `RECOGNIZER_PROVIDER=mock`

## Checks

1. Open the home page and confirm you can see:
   - `拍照识别器械`
   - `从相册导入`
   - `查看支持识别的器械`
2. Tap `查看支持识别的器械` and confirm the list contains `坐姿推胸机` and `高位下拉`.
3. Return home, open camera capture, and take a test photo whose mock payload includes the word `back`.
4. Confirm the result page shows `高位下拉`.
5. Go back, use album import with a mock payload containing no known keyword.
6. Confirm the result page shows `这类器械暂未收录`.
7. Open a recognized result page and tap `复制视频搜索词`.
8. Confirm a toast appears and the clipboard contains the platform, title, and search query string.
9. Re-open a known equipment from the equipment list and confirm the result page still renders.
```

- [ ] **Step 4: Run the full workspace verification**

Run:

```bash
corepack pnpm test
corepack pnpm typecheck
```

Expected: PASS for all tests and no type errors.

- [ ] **Step 5: Commit the docs and QA checklist**

```bash
git add README.md docs/qa/manual-smoke-test.md services/api/.env.example
git commit -m "docs: add setup and release checklist"
```

## Self-Review

- Spec coverage: The plan covers the agreed scope of WeChat mini program frontend, capture flow, album import, 20 supported fixed machines, curated equipment cards, video-learning handoff, supported-equipment list, and unsupported/low-confidence fallbacks. History stays lightweight and local, which is compatible with the spec's V1.1 flexibility.
- Placeholder scan: No `TBD`, `TODO`, or “implement later” placeholders are left in the steps.
- Type consistency: The core payload names are consistent across tasks: `imageBase64`, `source`, `topMatchId`, `confidence`, `alternatives`, `videoRecommendation`, `similarEquipmentIds`.
