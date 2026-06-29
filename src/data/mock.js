import dayjs from 'dayjs';

const STORAGE_KEYS = {
  USERS: 'quota_users',
  PLANS: 'quota_plans',
  RECORDS: 'quota_records',
  VERSION: 'quota_data_version',
};

const DATA_VERSION = '16';

const FIRST_NAMES = ['张', '李', '王', '赵', '陈', '刘', '杨', '黄', '周', '吴'];
const LAST_NAMES = ['伟', '芳', '娜', '敏', '静', '强', '磊', '洋', '艳', '杰', '勇', '军', '平', '刚'];

const COMPANIES = [
  '中国电信北京分公司',
  '中国电信上海分公司',
  '中国电信广东分公司',
  '中国电信江苏分公司',
  '中国电信浙江分公司',
  '中国电信四川分公司',
  '中国电信湖北分公司',
  '中国电信福建分公司',
  '中国电信陕西分公司',
  '中国电信河南分公司',
];

const ENTERPRISE_NAMES = [
  '北京智云科技有限公司',
  '上海数联信息技术有限公司',
  '广州星河互联科技有限公司',
  '深圳未来网络有限公司',
  '杭州云启智能科技有限公司',
  '成都百川创新科技有限公司',
  '武汉极光数据科技有限公司',
];

const PROJECTS = ['内部组', '销售试点', '研发测试', '市场推广', '客户成功', '生态合作'];
const APPLICANTS = ['张三', '李四', '王五', '赵六', '陈七', '刘八'];
const OPERATORS = ['姜饼', 'Admin', '运营小明'];

const PACKAGE_TYPES = ['internal_staff', 'trial_official', 'personal', 'enterprise'];

const ROLES = ['owner', 'admin', 'member'];
const DEPTS = ['技术部', '产品部', '销售部', '运营部', '市场部', '客服部'];

export const SKU_MAP = {
  experience: { label: '体验版', points: 1000, concurrency: 3, price: 0 },
  basic: { label: '基础版', points: 1000, concurrency: 5, price: 49 },
  standard: { label: '标准版', points: 2500, concurrency: 7, price: 99 },
  flagship: { label: '旗舰版', points: 6000, concurrency: 10, price: 199 },
};

const PERSONAL_SKUS = ['experience', 'basic', 'standard', 'flagship'];
const ENTERPRISE_SKUS = ['basic', 'standard', 'flagship'];

function randomName() {
  return FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)] +
    LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
}

function randomPhone() {
  return '1' + [3, 4, 5, 7, 8][Math.floor(Math.random() * 5)] +
    String(Math.floor(Math.random() * 100000000)).padStart(8, '0');
}

function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBool() {
  return Math.random() > 0.5;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateOrderNo() {
  return `ORD${Date.now().toString(36).toUpperCase()}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
}

function generateTopUpInventory(count = 1) {
  const inventory = [];
  for (let i = 0; i < count; i++) {
    const total = randomInt(1, 5);
    const allocated = 0;
    inventory.push({
      expireDate: dayjs().add(30, 'day').format('YYYY-MM-DD'),
      total,
      allocated,
      remaining: total,
    });
  }
  return inventory;
}

function generateEnterpriseMembers(sku, expireDate, count) {
  const members = [];
  const config = SKU_MAP[sku];
  for (let i = 0; i < count; i++) {
    const total = config.points;
    const consumed = randomInt(0, total);
    members.push({
      userId: `uid_${Math.random().toString(36).substring(2, 8)}`,
      name: randomName(),
      role: i === 0 ? 'owner' : randomPick(ROLES),
      dept: randomPick(DEPTS),
      sku,
      expireDate,
      totalPoints: total,
      remainingPoints: total - consumed,
      consumedPoints: consumed,
      concurrency: config.concurrency,
      topUpCount: randomInt(0, 3),
    });
  }
  return members;
}

function generateEnterpriseData(plan, user) {
  const channel = randomBool() ? 'open_platform' : 'own_channel';
  const autoRenew = randomBool();
  const planSku = randomPick(ENTERPRISE_SKUS);
  const skuConfig = SKU_MAP[planSku];
  const purchasedSeats = randomPick([10, 50, 100]);
  const allocatedSeats = Math.min(randomInt(0, purchasedSeats), 20);
  const availableSeats = purchasedSeats - allocatedSeats;

  const planPoints = skuConfig.points * purchasedSeats;
  const topUpInventory = generateTopUpInventory(randomInt(0, 2));
  const topUpPoints = topUpInventory.reduce((sum, item) => sum + item.total * 500, 0);
  const pointsValue = planPoints + topUpPoints;

  const members = generateEnterpriseMembers(planSku, plan.expireDate, allocatedSeats);
  if (members.length > 0 && user) {
    members[0] = {
      ...members[0],
      userId: user.id,
      name: user.name,
      role: 'owner',
      dept: '-',
    };
  }
  const consumedPoints = members.reduce((sum, m) => sum + m.consumedPoints, 0);
  const remainingPoints = pointsValue - consumedPoints;

  const consumedAmount = skuConfig.price * purchasedSeats;

  const seatInventory = [];
  if (availableSeats > 0) {
    const resignedCount = randomInt(0, availableSeats);
    if (resignedCount > 0) {
      seatInventory.push({ sku: planSku, expireDate: plan.expireDate, source: 'resigned', count: resignedCount });
    }
    const normalCount = availableSeats - resignedCount;
    if (normalCount > 0) {
      seatInventory.push({ sku: planSku, expireDate: plan.expireDate, source: 'normal', count: normalCount });
    }
  }

  const resignedRecords = [];
  const resignedCount = randomInt(0, 3);
  for (let i = 0; i < resignedCount; i++) {
    resignedRecords.push({
      userId: `uid_${Math.random().toString(36).substring(2, 8)}`,
      name: randomName(),
      releasedAt: dayjs().subtract(randomInt(1, 30), 'day').format('YYYY-MM-DD HH:mm:ss'),
      remainingPoints: randomInt(0, skuConfig.points),
      expireDate: plan.expireDate,
      reason: '确认离职',
      status: 'available',
    });
  }

  const purchaseRecords = [
    {
      id: '',
      planId: plan.id,
      userId: plan.userId,
      action: '购买',
      operator: plan.operator,
      content: `购买 ${skuConfig.label} × ${purchasedSeats} 席`,
      consumedAmount,
      applyUrl: '',
      createdAt: plan.startDate,
    },
  ];

  return {
    enterpriseName: randomPick(ENTERPRISE_NAMES),
    orderNo: generateOrderNo(),
    channel,
    autoRenew,
    planSku,
    planPoints,
    topUpPoints,
    purchasedSeats,
    allocatedSeats,
    availableSeats,
    pointsValue,
    consumedPoints,
    remainingPoints,
    seatInventory,
    topUpInventory,
    members,
    resignedRecords,
    purchaseRecords,
    concurrencyValue: skuConfig.concurrency,
    concurrencyUnlimited: false,
  };
}

function generatePersonalData(plan) {
  const channel = randomBool() ? 'open_platform' : 'own_channel';
  const autoRenew = randomBool();
  const planSku = randomPick(PERSONAL_SKUS);
  const skuConfig = SKU_MAP[planSku];
  const planPoints = skuConfig.points;

  const topUpInventory = generateTopUpInventory(randomInt(0, 3));
  const topUpPoints = topUpInventory.reduce((sum, item) => sum + item.total * 500, 0);
  const pointsValue = planPoints + topUpPoints;
  const consumedPoints = randomInt(0, pointsValue);
  const remainingPoints = pointsValue - consumedPoints;
  const consumedAmount = skuConfig.price;

  const purchaseRecords = [
    {
      id: '',
      planId: plan.id,
      userId: plan.userId,
      action: '购买',
      operator: plan.operator,
      content: `购买 ${skuConfig.label}`,
      consumedAmount,
      applyUrl: '',
      createdAt: plan.startDate,
    },
  ];

  return {
    orderNo: generateOrderNo(),
    channel,
    autoRenew,
    planSku,
    planPoints,
    topUpPoints,
    pointsValue,
    consumedPoints,
    remainingPoints,
    topUpInventory,
    purchaseRecords,
    concurrencyValue: skuConfig.concurrency,
    concurrencyUnlimited: false,
  };
}

function generateMockData() {
  const users = [];
  const plans = [];
  const records = [];
  let recordIndex = 0;

  for (let i = 1; i <= 30; i++) {
    const userId = `uid_${Math.random().toString(36).substring(2, 8)}`;
    const name = randomName();
    const phone = randomPhone();
    const user = {
      id: userId,
      name,
      phone,
      companyName: randomPick(COMPANIES),
    };
    users.push(user);

    const type = randomPick(PACKAGE_TYPES);
    const startDate = dayjs().subtract(Math.floor(Math.random() * 180), 'day').format('YYYY-MM-DD');
    const expireDate = dayjs().add(Math.floor(Math.random() * 180) - 30, 'day').format('YYYY-MM-DD');

    let plan = {
      id: `P${String(plans.length + 1).padStart(5, '0')}`,
      userId,
      type,
      project: randomPick(PROJECTS),
      applicant: randomPick(APPLICANTS),
      operator: randomPick(OPERATORS),
      startDate,
      expireDate,
      applyUrl: '',
      updateTime: dayjs().subtract(Math.floor(Math.random() * 30), 'day').format('YYYY-MM-DD HH:mm:ss'),
    };

    if (type === 'enterprise') {
      const enterpriseData = generateEnterpriseData(plan, user);
      plan = { ...plan, ...enterpriseData };
      (enterpriseData.purchaseRecords || []).forEach((r) => {
        recordIndex += 1;
        records.push({ ...r, id: `R${String(recordIndex).padStart(6, '0')}` });
      });
    } else if (type === 'personal') {
      const personalData = generatePersonalData(plan);
      plan = { ...plan, ...personalData };
      (personalData.purchaseRecords || []).forEach((r) => {
        recordIndex += 1;
        records.push({ ...r, id: `R${String(recordIndex).padStart(6, '0')}` });
      });
    } else {
      const pointsValue = Math.floor(Math.random() * 200000) + 5000;
      const consumedPoints = Math.floor(Math.random() * pointsValue);
      plan = {
        ...plan,
        pointsUnlimited: false,
        pointsValue,
        consumedPoints,
        remainingPoints: pointsValue - consumedPoints,
        concurrencyUnlimited: false,
        concurrencyValue: randomInt(1, 20),
      };
    }

    plans.push(plan);
  }

  return { users, plans, records };
}

export function initMockData() {
  const currentVersion = localStorage.getItem(STORAGE_KEYS.VERSION);
  if (currentVersion !== DATA_VERSION || !localStorage.getItem(STORAGE_KEYS.USERS)) {
    const { users, plans, records } = generateMockData();
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(plans));
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
    localStorage.setItem(STORAGE_KEYS.VERSION, DATA_VERSION);
  }
}

export function getUsers() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
}

export function getPlans() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.PLANS) || '[]');
}

export function setPlans(plans) {
  localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(plans));
}

export function getRecords() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.RECORDS) || '[]');
}

export function setRecords(records) {
  localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
}

export const PLAN_TYPE_MAP = {
  internal_staff: { label: '内部员工套餐', color: 'purple', expandable: true },
  trial_official: { label: '试用套餐', color: 'cyan', expandable: true },
  personal: { label: '个人版', color: 'orange', expandable: false },
  enterprise: { label: '企业团购', color: 'blue', expandable: false },
};

export const STATUS_MAP = {
  active: { label: '生效中', color: 'success' },
  expired: { label: '已过期', color: 'error' },
};
