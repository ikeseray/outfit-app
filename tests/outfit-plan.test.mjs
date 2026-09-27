import test from 'node:test';
import assert from 'node:assert/strict';
import { localOutfit, outfitSlot, parseOutfit } from '../src/outfit-plan.ts';
const items = [
  { id: 'top', name: '白衬衫', type: '衬衫' },
  { id: 'skirt', name: '半裙', type: '百褶裙' },
  { id: 'dress', name: '连衣裙', type: '连衣裙' },
  { id: 'outer', name: '夹克', type: '夹克' },
];
test('半身裙是下装，本地组合不会只推荐一条半身裙', () => {
  assert.equal(outfitSlot(items[1]), 'bottom');
  const plan = localOutfit(items.slice(0, 2));
  assert.deepEqual(plan.itemIds, ['top', 'skirt']);
});
test('拒绝虚构 ID、重复类别和连衣裙叠加上下装', () => {
  for (const itemIds of [['fake'], ['top', 'top'], ['dress', 'skirt'], ['skirt'], ['outer']]) {
    assert.equal(parseOutfit({ itemIds, title: '搭配', reason: '理由' }, items), null);
  }
  assert.deepEqual(parseOutfit('```json\n{"itemIds":["top","skirt"],"title":"搭配","reason":"理由"}\n```', items)?.itemIds, ['top', 'skirt']);
});
test('高温不默认加外套，空衣柜安全返回空集合', () => {
  assert.ok(!localOutfit(items, 30).itemIds.includes('outer'));
  assert.deepEqual(localOutfit([]).itemIds, []);
  assert.equal(parseOutfit('普通文字建议', items), null);
});
