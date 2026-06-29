import assert from 'node:assert/strict';
import test from 'node:test';
import { addPackage, togglePackageStatus, updatePackage } from '../src/api/package.js';
import {
  getPackageDisplayList,
  getPackages,
  initPackageTemplates,
  setPackages,
} from '../src/data/packageMock.js';

function installLocalStorage() {
  const store = new Map();
  globalThis.localStorage = {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
  };
}

function personalPackage(overrides) {
  return {
    id: 'PKG_BASE_V1',
    name: '个人基础版',
    type: 'personal',
    seriesKey: 'personal_basic',
    sku: 'SKU_PERSONAL_BASIC',
    skuName: '个人基础套餐',
    productCode: 'PROD_001',
    validity: { type: 'natural_month' },
    channels: ['own_channel'],
    shelfTime: '2026-01-01T00:00:00.000Z',
    status: 'active',
    benefits: ['标准模型不限次使用'],
    listPrice: 99,
    actualPrice: 59,
    ...overrides,
  };
}

function enterprisePackage(overrides) {
  return {
    id: 'PKG_ENTERPRISE_V1',
    name: '企业团购标准版',
    type: 'enterprise',
    seriesKey: 'enterprise_standard',
    sku: 'SKU_ENTERPRISE_STANDARD',
    skuName: '企业团购标准版',
    productCode: 'PROD_004',
    validity: { type: 'natural_year' },
    channels: ['own_channel'],
    shelfTime: '2026-01-01T00:00:00.000Z',
    status: 'active',
    benefits: ['按席位采购'],
    basePrice: 49,
    minSeats: 10,
    ...overrides,
  };
}

test('past pending package replaces the active package in the same series', async () => {
  installLocalStorage();
  setPackages([
    personalPackage({ id: 'PKG_BASE_V1', name: '个人基础版 v1' }),
    personalPackage({
      id: 'PKG_BASE_V2',
      name: '个人基础版 v2',
      shelfTime: '2026-06-01T00:00:00.000Z',
      status: 'pending',
      replacesPackageId: 'PKG_BASE_V1',
      listPrice: 109,
      actualPrice: 69,
    }),
  ]);

  const list = getPackageDisplayList();
  const oldPackage = list.find((item) => item.id === 'PKG_BASE_V1');
  const newPackage = list.find((item) => item.id === 'PKG_BASE_V2');

  assert.equal(oldPackage.status, 'replaced');
  assert.equal(oldPackage.displayStatus, 'replaced');
  assert.equal(newPackage.status, 'active');
  assert.equal(newPackage.displayStatus, 'active');
  assert.equal(getPackages().find((item) => item.id === 'PKG_BASE_V1').status, 'replaced');
});

test('replacement target must match the package type', async () => {
  installLocalStorage();
  setPackages([enterprisePackage({ id: 'PKG_ENTERPRISE_V1' })]);

  await assert.rejects(
    addPackage({
      name: '个人基础版 v2',
      type: 'personal',
      sku: 'SKU_PERSONAL_BASIC',
      validity: { type: 'natural_month' },
      shelfTime: '2026-07-01T00:00:00.000Z',
      replacesPackageId: 'PKG_ENTERPRISE_V1',
      benefits: ['标准模型不限次使用'],
      listPrice: 109,
      actualPrice: 69,
    }),
    /替换对象必须与套餐类型一致/
  );
});

test('default package seeds include one enterprise package and one 30-day topup package', () => {
  installLocalStorage();
  initPackageTemplates(true);

  const packages = getPackages();
  const enterprisePackages = packages.filter((item) => item.type === 'enterprise');
  const topupPackages = packages.filter((item) => item.type === 'topup');

  assert.equal(enterprisePackages.length, 1);
  assert.equal(topupPackages.length, 1);
  assert.deepEqual(topupPackages[0].validity, { type: 'days', value: 30 });
});

test('only pending packages can be edited', async () => {
  installLocalStorage();
  setPackages([
    personalPackage({ id: 'PKG_ACTIVE', status: 'active' }),
    personalPackage({
      id: 'PKG_PENDING',
      status: 'pending',
      shelfTime: '2026-07-01T00:00:00.000Z',
      replacesPackageId: 'PKG_ACTIVE',
      name: '个人基础版 v2',
    }),
  ]);

  await assert.rejects(
    updatePackage('PKG_ACTIVE', {
      name: '个人基础版改名',
      type: 'personal',
      sku: 'SKU_PERSONAL_BASIC',
      validity: { type: 'natural_month' },
      shelfTime: '2026-01-01T00:00:00.000Z',
      benefits: ['标准模型不限次使用'],
      listPrice: 99,
      actualPrice: 59,
    }),
    /只有待上架套餐可以编辑/
  );

  await updatePackage('PKG_PENDING', {
    name: '个人基础版 v2 调整',
    type: 'personal',
    sku: 'SKU_PERSONAL_BASIC',
    validity: { type: 'natural_month' },
    shelfTime: '2026-07-01T00:00:00.000Z',
    replacesPackageId: 'PKG_ACTIVE',
    benefits: ['标准模型不限次使用'],
    listPrice: 109,
    actualPrice: 69,
  });

  assert.equal(getPackages().find((item) => item.id === 'PKG_PENDING').name, '个人基础版 v2 调整');
});

test('inactive packages cannot be reactivated directly', async () => {
  installLocalStorage();
  setPackages([personalPackage({ id: 'PKG_INACTIVE', status: 'inactive' })]);

  await assert.rejects(
    togglePackageStatus('PKG_INACTIVE'),
    /已下架套餐不能重新上架，请复制后创建待上架版本/
  );
});
