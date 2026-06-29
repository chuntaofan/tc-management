import {
  getPackages,
  setPackages,
  computePackageDisplay,
  getPackageDisplayList,
  SKU_OPTIONS,
} from '../data/packageMock.js';

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

function validateValidity(validity) {
  if (!validity || !validity.type) {
    throw new Error('请选择有效期类型');
  }
  const validTypes = ['natural_month', 'natural_year', 'days'];
  if (!validTypes.includes(validity.type)) {
    throw new Error('有效期类型不合法');
  }
  if (validity.type === 'days') {
    const value = Number(validity.value);
    if (!Number.isInteger(value) || value <= 0) {
      throw new Error('指定天数必须是大于 0 的整数');
    }
  }
}

function validateShelfTime(shelfTime) {
  if (!shelfTime) {
    throw new Error('请选择上架时间');
  }
  const date = new Date(shelfTime);
  if (Number.isNaN(date.getTime())) {
    throw new Error('上架时间格式不正确');
  }
}

function validatePackage(values) {
  if (!values.name || !values.name.trim()) throw new Error('套餐名称不能为空');
  if (!values.type) throw new Error('套餐类型不能为空');
  if (values.sku && !values.sku.trim()) throw new Error('SKU 编码不能为空');

  validateValidity(values.validity);
  validateShelfTime(values.shelfTime);

  const isFutureShelf = new Date(values.shelfTime).getTime() > Date.now();
  if (values.status !== 'inactive' && isFutureShelf && !values.replacesPackageId) {
    throw new Error('待上架套餐必须选择替换对象');
  }

  if (values.type === 'enterprise') {
    const basePrice = Number(values.basePrice);
    if (!Number.isInteger(basePrice) || basePrice < 0) throw new Error('起价必须是大于或等于 0 的整数');

    const minSeats = Number(values.minSeats);
    if (!Number.isInteger(minSeats) || minSeats <= 0) throw new Error('起订数量必须是大于 0 的整数');
  } else {
    const listPrice = Number(values.listPrice);
    if (!Number.isInteger(listPrice) || listPrice < 0) throw new Error('刊例价必须是大于或等于 0 的整数');

    const actualPrice = Number(values.actualPrice);
    if (!Number.isInteger(actualPrice) || actualPrice < 0 || actualPrice > listPrice) {
      throw new Error('实际售价必须是 0~刊例价 之间的整数');
    }
  }
}

function attachSeriesFromReplacement(values, packages) {
  if (!values.replacesPackageId) return values;
  const target = packages.find((p) => p.id === values.replacesPackageId);
  if (!target) throw new Error('替换对象不存在');
  if (values.type && target.type !== values.type) {
    throw new Error('替换对象必须与套餐类型一致');
  }
  return {
    ...values,
    seriesKey: target.seriesKey,
  };
}

function normalizePackage(values) {
  const skuInfo = values.sku ? SKU_OPTIONS.find((item) => item.skuCode === values.sku.trim()) : null;
  const shelfTime = new Date(values.shelfTime);
  const status = values.status === 'inactive' ? 'inactive' : shelfTime.getTime() > Date.now() ? 'pending' : 'active';

  const base = {
    ...values,
    name: values.name.trim(),
    sku: values.sku ? values.sku.trim() : '',
    skuName: skuInfo?.skuName || '',
    productCode: skuInfo?.productCode || '',
    status,
    seriesKey: values.seriesKey || '',
    replacesPackageId: values.replacesPackageId || '',
    channels: ['own_channel'],
    benefits: Array.isArray(values.benefits) ? values.benefits.filter(Boolean) : [],
    validity: {
      type: values.validity.type,
      ...(values.validity.type === 'days' ? { value: Number(values.validity.value) } : {}),
    },
    shelfTime: shelfTime.toISOString(),
  };

  if (values.type === 'enterprise') {
    base.basePrice = Number(values.basePrice);
    base.minSeats = Number(values.minSeats);
    delete base.listPrice;
    delete base.actualPrice;
  } else {
    base.listPrice = Number(values.listPrice);
    base.actualPrice = Number(values.actualPrice);
    delete base.basePrice;
    delete base.minSeats;
  }

  // 清理已废弃字段
  delete base.points;
  delete base.concurrency;
  delete base.couponFirstOrder;
  delete base.couponMonthly;
  delete base.fullReductionRules;
  delete base.originalPrice;
  delete base.currentPrice;
  delete base.validityDays;

  return base;
}

export async function getPackageList(params = {}) {
  await delay();
  const { keyword = '', type = '', status = '' } = params;
  let list = getPackageDisplayList();

  if (type) list = list.filter((item) => item.type === type);
  if (status) list = list.filter((item) => item.displayStatus === status);
  if (keyword) {
    const lower = keyword.toLowerCase();
    list = list.filter(
      (item) =>
        item.name.toLowerCase().includes(lower) ||
        item.sku.toLowerCase().includes(lower) ||
        (item.benefitsText && item.benefitsText.toLowerCase().includes(lower))
    );
  }

  return { data: list, total: list.length };
}

export async function addPackage(values) {
  await delay(400);
  const packages = getPackages();
  const payload = attachSeriesFromReplacement(values, packages);
  validatePackage(payload);

  if (payload.sku) {
    const exists = packages.find(
      (p) =>
        p.sku === payload.sku.trim() &&
        p.status !== 'replaced' &&
        !(payload.replacesPackageId && p.id === payload.replacesPackageId)
    );
    if (exists) throw new Error('SKU 已存在');
  }

  const newPackage = {
    ...normalizePackage(payload),
    id: `PKG-${String(packages.length + 1).padStart(3, '0')}`,
  };
  packages.unshift(newPackage);
  setPackages(packages);
  return { success: true, data: computePackageDisplay(newPackage) };
}

export async function updatePackage(id, values) {
  await delay(400);
  const packages = getPackages();
  const index = packages.findIndex((p) => p.id === id);
  if (index === -1) throw new Error('套餐不存在');
  if (computePackageDisplay(packages[index]).displayStatus !== 'pending') {
    throw new Error('只有待上架套餐可以编辑');
  }
  const payload = attachSeriesFromReplacement(values, packages);
  validatePackage(payload);

  if (payload.sku) {
    const skuConflict = packages.find(
      (p) =>
        p.sku === payload.sku.trim() &&
        p.id !== id &&
        p.status !== 'replaced' &&
        !(payload.replacesPackageId && p.id === payload.replacesPackageId)
    );
    if (skuConflict) throw new Error('SKU 已存在');
  }

  packages[index] = {
    ...packages[index],
    ...normalizePackage(payload),
  };
  setPackages(packages);
  return { success: true, data: computePackageDisplay(packages[index]) };
}

export async function deletePackage(id) {
  await delay(300);
  const packages = getPackages();
  const newPackages = packages.filter((p) => p.id !== id);
  if (newPackages.length === packages.length) throw new Error('套餐不存在');
  setPackages(newPackages);
  return { success: true };
}

export async function togglePackageStatus(id) {
  await delay(200);
  const packages = getPackages();
  const index = packages.findIndex((p) => p.id === id);
  if (index === -1) throw new Error('套餐不存在');
  const displayStatus = computePackageDisplay(packages[index]).displayStatus;
  if (!['active', 'pending'].includes(displayStatus)) {
    throw new Error('已下架套餐不能重新上架，请复制后创建待上架版本');
  }
  packages[index].status = 'inactive';
  setPackages(packages);
  return { success: true, data: computePackageDisplay(packages[index]) };
}
