export const PACKAGE_TYPE_MAP = {
  personal: { label: '个人套餐', color: 'orange' },
  enterprise: { label: '企业团购', color: 'blue' },
  topup: { label: '加油包', color: 'green' },
};

export const PACKAGE_STATUS_MAP = {
  active: { label: '已上架', color: 'success' },
  inactive: { label: '已下架', color: 'default' },
};

export const CHANNEL_OPTIONS = [
  { value: 'open_platform', label: '开放平台' },
  { value: 'own_channel', label: '自有渠道' },
];

const DEFAULT_BENEFITS = {
  personal: {
    experience: ['标准模型不限次使用'],
    basic: ['标准模型不限次使用', 'API 调用支持'],
    standard: ['全模型不限次使用', 'API 调用支持'],
    flagship: ['全模型不限次使用', 'API 调用支持', '优先客服'],
  },
  topup: {
    topup_1k: ['自购买起 1 年有效', '可与主套餐叠加'],
    topup_3k: ['自购买起 1 年有效', '可与主套餐叠加'],
    topup_10k: ['自购买起 1 年有效', '可与主套餐叠加'],
  },
  enterprise: {
    enterprise_standard: ['按席位采购', '最低 10 席位起购', '可批量分配、回收席位', '离职自动释放'],
    enterprise_flagship: ['按席位采购', '最低 50 席位起购', '可批量分配、回收席位', '离职自动释放', '专属客户成功'],
  },
};

const defaultPackages = [
  // 个人套餐
  {
    id: 'PKG_PERSONAL_001',
    name: '个人体验版',
    type: 'personal',
    sku: 'experience',
    points: 1000,
    concurrency: 1,
    validityDays: 30,
    originalPrice: 49,
    currentPrice: 0,
    couponFirstOrder: 0,
    couponMonthly: 0,
    benefits: DEFAULT_BENEFITS.personal.experience,
    channels: ['open_platform', 'own_channel'],
    status: 'active',
  },
  {
    id: 'PKG_PERSONAL_002',
    name: '个人基础版',
    type: 'personal',
    sku: 'basic',
    points: 3000,
    concurrency: 3,
    validityDays: 30,
    originalPrice: 99,
    currentPrice: 59,
    couponFirstOrder: 10,
    couponMonthly: 5,
    benefits: DEFAULT_BENEFITS.personal.basic,
    channels: ['open_platform', 'own_channel'],
    status: 'active',
  },
  {
    id: 'PKG_PERSONAL_003',
    name: '个人标准版',
    type: 'personal',
    sku: 'standard',
    points: 6000,
    concurrency: 5,
    validityDays: 30,
    originalPrice: 199,
    currentPrice: 119,
    couponFirstOrder: 20,
    couponMonthly: 10,
    benefits: DEFAULT_BENEFITS.personal.standard,
    channels: ['open_platform', 'own_channel'],
    status: 'active',
  },
  {
    id: 'PKG_PERSONAL_004',
    name: '个人旗舰版',
    type: 'personal',
    sku: 'flagship',
    points: 20000,
    concurrency: 10,
    validityDays: 30,
    originalPrice: 499,
    currentPrice: 299,
    couponFirstOrder: 50,
    couponMonthly: 30,
    benefits: DEFAULT_BENEFITS.personal.flagship,
    channels: ['open_platform', 'own_channel'],
    status: 'active',
  },

  // 企业团购
  {
    id: 'PKG_ENTERPRISE_001',
    name: '企业团购标准版',
    type: 'enterprise',
    sku: 'enterprise_standard',
    basePrice: 49,
    minSeats: 10,
    fullReductionRules: [
      { threshold: 500, reduction: 210 },
      { threshold: 1000, reduction: 500 },
      { threshold: 2000, reduction: 1200 },
    ],
    benefits: DEFAULT_BENEFITS.enterprise.enterprise_standard,
    channels: ['open_platform', 'own_channel'],
    status: 'active',
  },
  {
    id: 'PKG_ENTERPRISE_002',
    name: '企业团购旗舰版',
    type: 'enterprise',
    sku: 'enterprise_flagship',
    basePrice: 99,
    minSeats: 50,
    fullReductionRules: [
      { threshold: 2000, reduction: 500 },
      { threshold: 5000, reduction: 1500 },
      { threshold: 10000, reduction: 4000 },
    ],
    benefits: DEFAULT_BENEFITS.enterprise.enterprise_flagship,
    channels: ['open_platform', 'own_channel'],
    status: 'active',
  },

  // 加油包
  {
    id: 'PKG_TOPUP_001',
    name: '积分加油包 1K',
    type: 'topup',
    sku: 'topup_1k',
    points: 1000,
    concurrency: 0,
    validityDays: 365,
    originalPrice: 29,
    currentPrice: 19,
    couponFirstOrder: 5,
    couponMonthly: 0,
    benefits: DEFAULT_BENEFITS.topup.topup_1k,
    channels: ['open_platform', 'own_channel'],
    status: 'active',
  },
  {
    id: 'PKG_TOPUP_002',
    name: '积分加油包 3K',
    type: 'topup',
    sku: 'topup_3k',
    points: 3000,
    concurrency: 0,
    validityDays: 365,
    originalPrice: 79,
    currentPrice: 49,
    couponFirstOrder: 10,
    couponMonthly: 0,
    benefits: DEFAULT_BENEFITS.topup.topup_3k,
    channels: ['open_platform', 'own_channel'],
    status: 'active',
  },
  {
    id: 'PKG_TOPUP_003',
    name: '积分加油包 10K',
    type: 'topup',
    sku: 'topup_10k',
    points: 10000,
    concurrency: 0,
    validityDays: 365,
    originalPrice: 249,
    currentPrice: 149,
    couponFirstOrder: 30,
    couponMonthly: 0,
    benefits: DEFAULT_BENEFITS.topup.topup_10k,
    channels: ['open_platform', 'own_channel'],
    status: 'active',
  },
];

function formatPrice(value) {
  if (value === undefined || value === null) return '-';
  return `¥${Number(value).toFixed(0)}`;
}

function formatValidity(days) {
  if (days === -1) return '长期有效';
  return `${days} 天`;
}

function formatChannel(value) {
  if (!value || value.length === 0) return '全部';
  if (value.length === CHANNEL_OPTIONS.length) return '全部';
  return value
    .map((v) => CHANNEL_OPTIONS.find((item) => item.value === v)?.label || v)
    .join('、');
}

function formatBenefitsForPersonal(item) {
  const parts = [];
  parts.push(`${item.points?.toLocaleString?.() ?? item.points} 积分/月`);
  if (item.concurrency > 0) {
    parts.push(`${item.concurrency} 个并发任务`);
  }
  if (Array.isArray(item.benefits)) {
    parts.push(...item.benefits);
  }
  return parts.join('、');
}

function formatBenefitsForTopup(item) {
  const parts = [`${item.points?.toLocaleString?.() ?? item.points} 积分`];
  if (Array.isArray(item.benefits)) {
    parts.push(...item.benefits);
  }
  return parts.join('、');
}

function formatBenefitsForEnterprise(item) {
  if (!Array.isArray(item.benefits) || item.benefits.length === 0) return '-';
  return item.benefits.join('、');
}

function formatPromotion(item) {
  if (item.type === 'enterprise') {
    if (!Array.isArray(item.fullReductionRules) || item.fullReductionRules.length === 0) return '-';
    return item.fullReductionRules
      .map((rule) => `满 ${rule.threshold} 减 ${rule.reduction}`)
      .join('；');
  }

  const parts = [];
  if (item.couponFirstOrder > 0) {
    parts.push(`首单立减 ${item.couponFirstOrder} 元`);
  }
  if (item.couponMonthly > 0) {
    parts.push(`连续包月减 ${item.couponMonthly} 元`);
  }
  return parts.length ? parts.join('、') : '无';
}

export function computePackageDisplay(pkg) {
  let benefitsText;
  let priceInfo;
  let priceText;

  if (pkg.type === 'enterprise') {
    benefitsText = formatBenefitsForEnterprise(pkg);
    priceInfo = `¥${pkg.basePrice || 0}起/人/月`;
    priceText = `起订 ${pkg.minSeats || 1} 席`;
  } else if (pkg.type === 'topup') {
    benefitsText = formatBenefitsForTopup(pkg);
    priceInfo = formatPrice(pkg.originalPrice);
    priceText = formatPrice(pkg.currentPrice);
  } else {
    benefitsText = formatBenefitsForPersonal(pkg);
    priceInfo = formatPrice(pkg.originalPrice);
    priceText = formatPrice(pkg.currentPrice);
  }

  return {
    ...pkg,
    benefitsText,
    validityText: formatValidity(pkg.validityDays),
    priceInfo,
    priceText,
    promotionText: formatPromotion(pkg),
    channelText: formatChannel(pkg.channels),
  };
}

export function getPackages() {
  return JSON.parse(localStorage.getItem('package_templates') || '[]');
}

export function setPackages(list) {
  localStorage.setItem('package_templates', JSON.stringify(list));
}

export function getPackageDisplayList() {
  return getPackages().map(computePackageDisplay);
}

export function initPackageTemplates(force = false) {
  const version = localStorage.getItem('package_data_version');
  if (force || version !== '16') {
    localStorage.setItem('package_templates', JSON.stringify(defaultPackages));
    localStorage.setItem('package_data_version', '16');
  }
}
