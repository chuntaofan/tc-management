export const PACKAGE_TYPE_MAP = {
  personal: { label: '个人套餐', color: 'orange' },
  enterprise: { label: '企业团购', color: 'blue' },
  topup: { label: '加油包', color: 'green' },
};

export const PACKAGE_STATUS_MAP = {
  active: { label: '已上架', color: 'success' },
  pending: { label: '待上架', color: 'warning' },
  replaced: { label: '已被替换', color: 'default' },
  inactive: { label: '已下架', color: 'default' },
};

export const CHANNEL_OPTIONS = [
  { value: 'own_channel', label: '自有渠道' },
];

export const VALIDITY_TYPE_MAP = {
  natural_month: { label: '自然月' },
  natural_year: { label: '自然年' },
  days: { label: '指定天数' },
};

export const SKU_OPTIONS = [
  { skuCode: 'SKU_PERSONAL_EXPERIENCE', skuName: '个人体验套餐', productCode: 'PROD_000' },
  { skuCode: 'SKU_PERSONAL_BASIC', skuName: '个人基础套餐', productCode: 'PROD_001' },
  { skuCode: 'SKU_PERSONAL_STANDARD', skuName: '个人标准套餐', productCode: 'PROD_002' },
  { skuCode: 'SKU_PERSONAL_FLAGSHIP', skuName: '个人旗舰套餐', productCode: 'PROD_003' },
  { skuCode: 'SKU_ENTERPRISE_STANDARD', skuName: '企业团购标准版', productCode: 'PROD_004' },
  { skuCode: 'SKU_ENTERPRISE_FLAGSHIP', skuName: '企业团购旗舰版', productCode: 'PROD_005' },
  { skuCode: 'SKU_TOPUP_1K', skuName: '积分加油包 1K', productCode: 'PROD_006' },
  { skuCode: 'SKU_TOPUP_3K', skuName: '积分加油包 3K', productCode: 'PROD_007' },
  { skuCode: 'SKU_TOPUP_10K', skuName: '积分加油包 10K', productCode: 'PROD_008' },
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
  {
    id: 'PKG_PERSONAL_001',
    name: '个人体验版',
    type: 'personal',
    seriesKey: 'personal_experience',
    sku: 'SKU_PERSONAL_EXPERIENCE',
    skuName: '个人体验套餐',
    productCode: 'PROD_000',
    validity: { type: 'natural_month' },
    channels: ['own_channel'],
    shelfTime: new Date().toISOString(),
    status: 'active',
    benefits: DEFAULT_BENEFITS.personal.experience,
    listPrice: 49,
    actualPrice: 0,
  },
  {
    id: 'PKG_PERSONAL_002',
    name: '个人基础版',
    type: 'personal',
    seriesKey: 'personal_basic',
    sku: 'SKU_PERSONAL_BASIC',
    skuName: '个人基础套餐',
    productCode: 'PROD_001',
    validity: { type: 'natural_month' },
    channels: ['own_channel'],
    shelfTime: new Date().toISOString(),
    status: 'active',
    benefits: DEFAULT_BENEFITS.personal.basic,
    listPrice: 99,
    actualPrice: 59,
  },
  {
    id: 'PKG_PERSONAL_003',
    name: '个人标准版',
    type: 'personal',
    seriesKey: 'personal_standard',
    sku: 'SKU_PERSONAL_STANDARD',
    skuName: '个人标准套餐',
    productCode: 'PROD_002',
    validity: { type: 'natural_month' },
    channels: ['own_channel'],
    shelfTime: new Date().toISOString(),
    status: 'active',
    benefits: DEFAULT_BENEFITS.personal.standard,
    listPrice: 199,
    actualPrice: 119,
  },
  {
    id: 'PKG_PERSONAL_004',
    name: '个人旗舰版',
    type: 'personal',
    seriesKey: 'personal_flagship',
    sku: 'SKU_PERSONAL_FLAGSHIP',
    skuName: '个人旗舰套餐',
    productCode: 'PROD_003',
    validity: { type: 'natural_month' },
    channels: ['own_channel'],
    shelfTime: new Date().toISOString(),
    status: 'active',
    benefits: DEFAULT_BENEFITS.personal.flagship,
    listPrice: 499,
    actualPrice: 299,
  },

  {
    id: 'PKG_ENTERPRISE_001',
    name: '企业团购标准版',
    type: 'enterprise',
    seriesKey: 'enterprise_standard',
    sku: 'SKU_ENTERPRISE_STANDARD',
    skuName: '企业团购标准版',
    productCode: 'PROD_004',
    validity: { type: 'natural_year' },
    channels: ['own_channel'],
    shelfTime: new Date().toISOString(),
    status: 'active',
    benefits: DEFAULT_BENEFITS.enterprise.enterprise_standard,
    basePrice: 49,
    minSeats: 10,
  },

  {
    id: 'PKG_TOPUP_001',
    name: '积分加油包 1K',
    type: 'topup',
    seriesKey: 'topup_1k',
    sku: 'SKU_TOPUP_1K',
    skuName: '积分加油包 1K',
    productCode: 'PROD_006',
    validity: { type: 'days', value: 30 },
    channels: ['own_channel'],
    shelfTime: new Date().toISOString(),
    status: 'active',
    benefits: DEFAULT_BENEFITS.topup.topup_1k,
    listPrice: 29,
    actualPrice: 19,
  },
];

function formatPrice(value) {
  if (value === undefined || value === null) return '-';
  return `¥${Number(value).toFixed(0)}`;
}

function formatValidity(validity) {
  if (!validity || !validity.type) return '-';
  const config = VALIDITY_TYPE_MAP[validity.type];
  if (validity.type === 'days') {
    return `${validity.value || 0} 天`;
  }
  return config?.label || validity.type;
}

function formatChannel(value) {
  if (!value || value.length === 0) return '全部';
  return value
    .map((v) => CHANNEL_OPTIONS.find((item) => item.value === v)?.label || v)
    .join('、');
}

function formatDiscountTag(listPrice, actualPrice) {
  if (actualPrice === 0) return '免费';
  if (!listPrice || listPrice <= 0) return '-';
  const zhe = Math.floor((actualPrice / listPrice) * 100) / 10;
  return `约 ${zhe.toFixed(1)} 折`;
}

function computeDisplayStatus(pkg) {
  if (pkg.status === 'replaced') return 'replaced';
  if (pkg.status === 'inactive') return 'inactive';
  if (pkg.status === 'pending') return 'pending';
  const shelfTime = pkg.shelfTime ? new Date(pkg.shelfTime).getTime() : 0;
  return Date.now() < shelfTime ? 'pending' : 'active';
}

function formatBenefits(item) {
  if (!Array.isArray(item.benefits) || item.benefits.length === 0) return '-';
  return item.benefits.join('、');
}

export function computePackageDisplay(pkg) {
  const isEnterprise = pkg.type === 'enterprise';
  const displayStatus = computeDisplayStatus(pkg);

  let priceInfo;
  let priceText;
  let discountTag;

  if (isEnterprise) {
    priceInfo = `¥${pkg.basePrice || 0}/人/月`;
    priceText = `¥${pkg.basePrice || 0}/人/月`;
    discountTag = '-';
  } else {
    priceInfo = formatPrice(pkg.listPrice);
    priceText = formatPrice(pkg.actualPrice);
    discountTag = formatDiscountTag(Number(pkg.listPrice), Number(pkg.actualPrice));
  }

  return {
    ...pkg,
    benefitsText: formatBenefits(pkg),
    validityText: isEnterprise ? '-' : formatValidity(pkg.validity),
    priceInfo,
    priceText,
    discountTag,
    channelText: formatChannel(pkg.channels),
    displayStatus,
  };
}

export function getPackages() {
  return JSON.parse(localStorage.getItem('package_templates') || '[]');
}

export function setPackages(list) {
  localStorage.setItem('package_templates', JSON.stringify(list));
}

export function getPackageDisplayList() {
  const packages = getPackages();
  const { list, changed } = syncPackageLifecycle(packages);
  if (changed) setPackages(list);
  return list.map(computePackageDisplay);
}

export function inferPackageSeriesKey(pkg) {
  if (pkg.seriesKey) return pkg.seriesKey;
  if (pkg.sku) return `${pkg.type}_${pkg.sku.toLowerCase()}`;
  return `${pkg.type}_${String(pkg.name || '').trim().replace(/\s+/g, '_').toLowerCase()}`;
}

export function syncPackageLifecycle(packages, now = Date.now()) {
  let changed = false;
  const list = packages.map((pkg) => {
    const seriesKey = inferPackageSeriesKey(pkg);
    if (pkg.seriesKey === seriesKey) return { ...pkg };
    changed = true;
    return { ...pkg, seriesKey };
  });

  list.forEach((pkg) => {
    if (pkg.status !== 'pending') return;
    const shelfTime = pkg.shelfTime ? new Date(pkg.shelfTime).getTime() : 0;
    if (shelfTime > now) return;

    pkg.status = 'active';
    changed = true;

    const replacedIds = new Set();
    if (pkg.replacesPackageId) replacedIds.add(pkg.replacesPackageId);
    list.forEach((candidate) => {
      if (
        candidate.id !== pkg.id &&
        candidate.seriesKey === pkg.seriesKey &&
        candidate.status === 'active'
      ) {
        replacedIds.add(candidate.id);
      }
    });

    list.forEach((candidate) => {
      if (replacedIds.has(candidate.id) && candidate.status !== 'replaced') {
        candidate.status = 'replaced';
        candidate.replacedByPackageId = pkg.id;
        changed = true;
      }
    });
  });

  return { list, changed };
}

export function initPackageTemplates(force = false) {
  const version = localStorage.getItem('package_data_version');
  if (force || version !== '19') {
    setPackages(defaultPackages);
    localStorage.setItem('package_data_version', '19');
  }
}
