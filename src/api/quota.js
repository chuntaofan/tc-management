import dayjs from 'dayjs';
import {
  getUsers,
  getPlans,
  setPlans,
  getRecords,
  setRecords,
  PLAN_TYPE_MAP,
  STATUS_MAP,
} from '../data/mock';

export const EXPANDABLE_TYPES = ['internal_staff', 'trial_official'];

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

function computeStatus(expireDate) {
  return dayjs(expireDate).isBefore(dayjs(), 'day') ? 'expired' : 'active';
}

function formatPointsLimit(plan) {
  return `${plan.pointsValue} 积分`;
}

function enrichPlan(plan, userMap) {
  const user = userMap.get(plan.userId) || {};
  const status = computeStatus(plan.expireDate);
  const totalPoints = plan.pointsUnlimited ? Infinity : Number(plan.pointsValue) || 0;
  const consumedPoints = Number(plan.consumedPoints) || 0;
  const remainingPoints = plan.pointsUnlimited
    ? Infinity
    : Math.max(0, totalPoints - consumedPoints);

  return {
    ...plan,
    accountId: plan.userId,
    nickname: user.name || '-',
    phone: user.phone || '-',
    companyName: user.companyName || '-',
    status,
    statusLabel: STATUS_MAP[status]?.label || status,
    typeLabel: PLAN_TYPE_MAP[plan.type]?.label || plan.type,
    pointsLimitText: formatPointsLimit(plan),
    concurrencyText: `${plan.concurrencyValue}`,
    consumedPoints,
    remainingPoints: plan.pointsUnlimited ? '-' : remainingPoints,
  };
}

export async function getQuotaList(params = {}) {
  await delay();

  const { keyword = '', type = '', status = '' } = params;
  const users = getUsers();
  const plans = getPlans();
  const userMap = new Map(users.map((u) => [u.id, u]));

  let list = plans.map((plan) => enrichPlan(plan, userMap));

  if (type) list = list.filter((item) => item.type === type);
  if (status) list = list.filter((item) => item.status === status);

  if (keyword) {
    const lowerKeyword = keyword.toLowerCase();
    list = list.filter(
      (item) =>
        item.userId.toLowerCase().includes(lowerKeyword) ||
        (item.nickname && item.nickname.includes(keyword)) ||
        (item.phone && item.phone.includes(keyword)) ||
        (item.project && item.project.includes(keyword)) ||
        (item.applicant && item.applicant.includes(keyword))
    );
  }

  return { data: list, total: list.length };
}

function validatePlan(values) {
  if (!values.userId || !values.userId.trim()) throw new Error('用户账号不能为空');
  if (!values.project || !values.project.trim()) throw new Error('所属项目不能为空');
  if (!values.applicant || !values.applicant.trim()) throw new Error('申请人不能为空');
  if (!values.type) throw new Error('套餐权益不能为空');
  if (!values.startDate || !values.expireDate) throw new Error('套餐有效期不能为空');
  if (dayjs(values.expireDate).isBefore(dayjs(values.startDate))) {
    throw new Error('到期时间不能早于开始时间');
  }

  const valPoints = Number(values.pointsValue);
  if (!Number.isInteger(valPoints) || valPoints < 0) {
    throw new Error('积分额度必须是大于或等于 0 的整数');
  }

  const valConcurrency = Number(values.concurrencyValue);
  if (!Number.isInteger(valConcurrency) || valConcurrency < 0 || valConcurrency > 20) {
    throw new Error('并发任务数必须是 0~20 之间的整数');
  }
}

const FIELD_LABELS = {
  userId: '用户账号',
  project: '所属项目',
  applicant: '申请人',
  type: '套餐权益',
  startDate: '开始时间',
  expireDate: '到期时间',
  applyUrl: '申请凭证 URL',
  pointsValue: '积分额度',
  concurrencyValue: '并发任务数',
};

function formatFieldValue(key, value) {
  if (value == null || value === '') return '-';
  if (key === 'type') return PLAN_TYPE_MAP[value]?.label || value;
  if (key === 'pointsValue') return `${value} 积分`;
  if (key === 'concurrencyValue') return `${value}`;
  return value;
}

function computeChanges(values, existing = null) {
  const fields = Object.keys(FIELD_LABELS);
  if (!existing) {
    return fields
      .map((key) => ({
        field: FIELD_LABELS[key],
        before: null,
        after: formatFieldValue(key, values[key]),
      }))
      .filter((item) => item.after !== '-');
  }
  return fields
    .map((key) => {
      const before = formatFieldValue(key, existing[key]);
      const after = formatFieldValue(key, values[key]);
      return before !== after ? { field: FIELD_LABELS[key], before, after } : null;
    })
    .filter(Boolean);
}

function buildPlanFromValues(values, existing = null) {
  const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
  const pointsValue = Number(values.pointsValue);
  const consumedPoints = existing ? Number(existing.consumedPoints) || 0 : 0;
  const remainingPoints = Math.max(0, pointsValue - consumedPoints);

  return {
    ...(existing || {}),
    id: existing ? existing.id : `P${String(getPlans().length + 1).padStart(5, '0')}`,
    userId: values.userId.trim(),
    type: values.type,
    project: values.project.trim(),
    applicant: values.applicant.trim(),
    operator: '运营管理员',
    startDate: dayjs(values.startDate).format('YYYY-MM-DD HH:mm:ss'),
    expireDate: dayjs(values.expireDate).format('YYYY-MM-DD HH:mm:ss'),
    applyUrl: values.applyUrl || '',
    pointsUnlimited: false,
    pointsValue,
    consumedPoints,
    remainingPoints,
    concurrencyUnlimited: false,
    concurrencyValue: Number(values.concurrencyValue),
    updateTime: now,
  };
}

export async function addQuota(values) {
  await delay(400);
  validatePlan(values);

  const plans = getPlans();
  const newPlan = buildPlanFromValues(values);
  plans.unshift(newPlan);
  setPlans(plans);

  const records = getRecords();
  records.unshift({
    id: `R${String(records.length + 1).padStart(6, '0')}`,
    planId: newPlan.id,
    userId: newPlan.userId,
    action: '新增',
    operator: newPlan.operator,
    applyUrl: values.applyUrl,
    createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    changes: computeChanges(values),
  });
  setRecords(records);

  return { success: true, data: newPlan };
}

export async function updateQuota(planId, values) {
  await delay(400);
  validatePlan(values);

  const plans = getPlans();
  const index = plans.findIndex((p) => p.id === planId);
  if (index === -1) throw new Error('套餐记录不存在');

  const updated = buildPlanFromValues(values, plans[index]);
  plans[index] = updated;
  setPlans(plans);

  const records = getRecords();
  records.unshift({
    id: `R${String(records.length + 1).padStart(6, '0')}`,
    planId: updated.id,
    userId: updated.userId,
    action: '编辑',
    operator: updated.operator,
    applyUrl: values.applyUrl,
    createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    changes: computeChanges(values, plans[index]),
  });
  setRecords(records);

  return { success: true, data: updated };
}

export async function deleteQuota(planId) {
  await delay(300);
  const plans = getPlans();
  const newPlans = plans.filter((p) => p.id !== planId);
  if (newPlans.length === plans.length) throw new Error('套餐记录不存在');
  setPlans(newPlans);
  return { success: true };
}

export async function getQuotaRecords(planId) {
  await delay(200);
  const records = getRecords();
  return records.filter((r) => r.planId === planId);
}
