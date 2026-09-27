const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

// Run the pure service with the project's existing TypeScript dependency.
// Resolve Expo's @/ alias without adding a test framework or changing app config.
const root = path.resolve(__dirname, '../..');
const cache = new Map();
function load(filename) {
  if (cache.has(filename)) return cache.get(filename).exports;
  const module = { exports: {} };
  cache.set(filename, module);
  const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const localRequire = name => name.startsWith('@/')
    ? load(path.join(root, name.slice(2) + '.ts')) : require(name);
  vm.runInThisContext(`(function(require, module, exports) {${source}\n})`, { filename })(localRequire, module, module.exports);
  return module.exports;
}
const service = load(path.join(__dirname, 'ai-outfit-service.ts'));
const { MockWeatherService } = load(path.join(root, 'services/mock/mock-weather-service.ts'));
const { mockClothingItems } = load(path.join(root, 'services/mock/mock-clothing-data-service.ts'));
const wardrobe = items => ({ getAvailableItems: async () => items, listItems: async () => items,
  getItem: async id => items.find(item => item.id === id) ?? null });

test('scene affects selection and weekly plans keep the requested scene', async () => {
  const work = await service.generateOutfits({ scene: '上班' }, false);
  const sport = await service.generateOutfits({ scene: '运动' }, true);
  assert.equal(work.plans.length, 1);
  assert.equal(sport.plans.length, 7);
  assert.equal(new Set(sport.plans.map(plan => plan.date)).size, 7);
  assert.ok(sport.plans.every(plan => plan.scene.scene === '运动'));
  assert.equal(work.plans[0].slots.find(slot => slot.category === 'bottom').item.id, 'bottom-1');
  assert.equal(sport.plans[0].slots.find(slot => slot.category === 'bottom').item.id, 'bottom-2');
});

test('style choices change the profile, ranking and explanation', async () => {
  const minimal = service.styleProfileFromSelection(['minimal']);
  const casual = service.styleProfileFromSelection(['casual']);
  assert.equal(minimal.baseStyle, '极简通勤');
  assert.equal(casual.baseStyle, '休闲基础');
  const formalPlan = (await service.generateOutfits({ scene: '上班' }, false, undefined, minimal)).plans[0];
  const relaxedPlan = (await service.generateOutfits({ scene: '出门玩' }, false, undefined, casual)).plans[0];
  assert.match(formalPlan.reason, /极简通勤/);
  assert.match(relaxedPlan.reason, /休闲基础/);
  assert.ok(Object.values(minimal.weights).every(value => value === 1));
  assert.ok(formalPlan.scores.style >= 0 && formalPlan.scores.style <= 100);
});

test('replacement updates explanation and scores without mutating the source', async () => {
  const { plans: [plan], items } = await service.generateOutfits({ scene: '上班' }, false);
  const before = structuredClone(plan);
  const index = plan.slots.findIndex(slot => slot.category === 'bottom');
  const next = service.replaceOutfitItem(plan, index, 'bottom-2', items);
  assert.deepEqual(plan, before);
  assert.notEqual(next.scores.scene, plan.scores.scene);
  assert.match(next.reason, /浅蓝直筒牛仔裤/);
  assert.doesNotMatch(next.reason, /深蓝直筒长裤/);
  assert.equal(next.slots[0], plan.slots[0]);
});

test('replacement rejects unavailable, wrong category and invalid slot candidates', async () => {
  const { plans: [plan], items } = await service.generateOutfits({ scene: '上班' }, false);
  const index = plan.slots.findIndex(slot => slot.category === 'bottom');
  assert.equal(service.replaceOutfitItem(plan, index, 'top-1', items), plan);
  assert.equal(service.replaceOutfitItem(plan, -1, 'bottom-2', items), plan);
  const blocked = items.map(item => item.id === 'bottom-2' ? { ...item, status: 'washing' } : item);
  assert.equal(service.replaceOutfitItem(plan, index, 'bottom-2', blocked), plan);
  assert.deepEqual(service.replacementOptions(plan, index, blocked), []);
});

test('empty wardrobe produces explicit gaps and zero scores; filling a slot clears its gap', async () => {
  const { plans: [plan] } = await service.generateOutfits({ scene: '旅行' }, false,
    { clothing: wardrobe([]), weather: new MockWeatherService() });
  assert.equal(plan.gaps.length, 4);
  assert.ok(Object.values(plan.scores).every(score => score === 0));
  const next = service.replaceOutfitItem(plan, 0, 'top-1', mockClothingItems);
  assert.equal(next.gaps.length, 3);
  assert.ok(!next.gaps.includes('top'));
  assert.equal(plan.gaps.length, 4);
});

test('generation filters unavailable items even if the provider returns them', async () => {
  const items = mockClothingItems.map(item => ({ ...item, status: 'donated' }));
  const result = await service.generateOutfits({ scene: '上班' }, false,
    { clothing: wardrobe(items), weather: new MockWeatherService() });
  assert.equal(result.items.length, 0);
  assert.ok(result.plans[0].slots.every(slot => slot.item === null));
});

test('weather failures propagate and a subsequent generation can recover', async () => {
  const weather = new MockWeatherService();
  let fail = true;
  const deps = { clothing: wardrobe(mockClothingItems), weather: {
    getToday: city => weather.getToday(city),
    getForecast: async (city, days) => {
      if (fail) throw new Error('offline');
      return weather.getForecast(city, days);
    },
  } };
  await assert.rejects(service.generateOutfits({ scene: '上班' }, false, deps), /offline/);
  fail = false;
  assert.equal((await service.generateOutfits({ scene: '上班' }, false, deps)).plans.length, 1);
});

test('rain affects weather scores and all scene scores stay within bounds', async () => {
  for (const scene of service.sceneOptions) {
    const { plans } = await service.generateOutfits({ scene }, true);
    assert.ok(plans[2].scores.weather < plans[0].scores.weather);
    assert.ok(plans.every(plan => Object.values(plan.scores).every(score => Number.isInteger(score) && score >= 0 && score <= 100)));
  }
});
