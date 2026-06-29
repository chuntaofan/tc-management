import { getPackages, setPackages, computePackageDisplay } from '../data/packageMock';

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

function validatePackage(values) {
  if (!values.name || !values.name.trim()) throw new Error('套餐名称不能为空');
  if (!values.type) throw new Error('套餐类型不能为空');
  if (!values.sku || !values.sku.trim()) throw new Error('SKU 不能为空');

  const validityDays = Number(values.validityDays);
  if (!Number.isInteger(validityDays)) throw new Error('有效期必须是整数');

  if (values.type === 'enterprise') {
    const basePrice = Number(values.basePrice);
    if (!Number.isInteger(basePrice) || basePrice < 0) throw new Error('起价必须是大于或等于 0 的整数');

    const minSeats = Number(values.minSeats);
    if (!Number.isInteger(minSeats) || minSeats <= 0) throw new Error('起订数量必须是大于 0 的整数');

    (values.fullReductionRules || []).forEach((rule) => {
      if (!Number.isInteger(Number(rule.threshold)) || Number(rule.threshold) < 0) {
        throw new Error('满减门槛必须是大于或等于 0 的整数');
      }
      if (!Number.isInteger(Number(rule.reduction)) || Number(rule.reduction) < 0) {
        throw new Error('满减金额必须是大于或等于 0 的整数');
      }
    });
  } else {
    const points = Number(values.points);
    if (!Number.isInteger(points) || points < 0) throw new Error('积分额度必须是大于或等于 0 的整数');

    const concurrency = Number(values.concurrency);
    if (!Number.isInteger(concurrency) || concurrency < 0 || concurrency > 20) {
      throw new Error('并发任务数必须是 0~20 的整数');
    }

    const originalPrice = Number(values.originalPrice);
    if (!Number.isInteger(originalPrice) || originalPrice < 0) throw new Error('原价必须是大于或等于 0 的整数');

    const currentPrice = Number(values.currentPrice);
    if (!Number.isInteger(currentPrice) || currentPrice < 0 || currentPrice > originalPrice) {
      throw new Error('现价必须是 0~原价 之间的整数');
    }

    const couponFirstOrder = Number(values.couponFirstOrder || 0);
    if (!Number.isInteger(couponFirstOrder) || couponFirstOrder < 0) {
      throw new Error('首单优惠券必须是大于或等于 0 的整数');
    }
    const couponMonthly = Number(values.couponMonthly || 0);
    if (!Number.isInteger(couponMonthly) || couponMonthly < 0) {
      throw new Error('包月优惠券必须是大于或等于 0 的整数');
    }
  }
}

function normalizePackage(values) {
  const base = {
    ...values,
    name: values.name.trim(),
    sku: values.sku.trim(),
    status: values.status || 'active',
    channels: values.channels || ['open_platform'],
    benefits: Array.isArray(values.benefits) ? values.benefits.filter(Boolean) : [],
    validityDays: Number(values.validityDays),
  };

  if (values.type === 'enterprise') {
    base.basePrice = Number(values.basePrice);
    base.minSeats = Number(values.minSeats);
    base.fullReductionRules = (values.fullReductionRules || [])
      .filter((rule) => Number(rule.threshold) >= 0)
      .map((rule) => ({
        threshold: Number(rule.threshold),
        reduction: Number(rule.reduction),
      }));
    delete base.points;
    delete base.concurrency;
    delete base.originalPrice;
    delete base.currentPrice;
    delete base.couponFirstOrder;
    delete base.couponMonthly;
  } else {
    base.points = Number(values.points);
    base.concurrency = Number(values.concurrency);
    base.originalPrice = Number(values.originalPrice);
    base.currentPrice = Number(values.currentPrice);
    base.couponFirstOrder = Number(values.couponFirstOrder || 0);
    base.couponMonthly = Number(values.couponMonthly || 0);
    delete base.basePrice;
    delete base.minSeats;
    delete base.fullReductionRules;
  }

  return base;
}

export async function getPackageList(params = {}) {
  await delay();
  const { keyword = '', type = '', status = '' } = params;
  let list = getPackages().map(computePackageDisplay);

  if (type) list = list.filter((item) => item.type === type);
  if (status) list = list.filter((item) => item.status === status);
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
  validatePackage(values);

  const packages = getPackages();
  const exists = packages.find((p) => p.sku === values.sku.trim());
  if (exists) throw new Error('SKU 已存在');

  const newPackage = {
    ...normalizePackage(values),
    id: `PKG-${String(packages.length + 1).padStart(3, '0')}`,
  };
  packages.unshift(newPackage);
  setPackages(packages);
  return { success: true, data: computePackageDisplay(newPackage) };
}

export async function updatePackage(id, values) {
  await delay(400);
  validatePackage(values);

  const packages = getPackages();
  const index = packages.findIndex((p) => p.id === id);
  if (index === -1) throw new Error('套餐不存在');

  const skuConflict = packages.find((p) => p.sku === values.sku.trim() && p.id !== id);
  if (skuConflict) throw new Error('SKU 已存在');

  packages[index] = {
    ...packages[index],
    ...normalizePackage(values),
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
  packages[index].status = packages[index].status === 'active' ? 'inactive' : 'active';
  setPackages(packages);
  return { success: true, data: computePackageDisplay(packages[index]) };
}
