import type {
  AdminReportDetail,
  AdminReportListItem,
  HistoryEntry,
  IssueSanctionPayload,
  IssueSanctionResponse,
  RelatedReportEntry,
  ReportResolution,
} from '@/features/admin-report/types/adminReport';
import type {
  ReportReasonCode,
  ReportStatus,
  ReportTarget,
} from '@/features/report/types/report';

const COURSE_TARGETS: ReportTarget[] = [
  { type: 'course', id: '21', ownerId: '힙스터김', title: '성수동 힙플레이스 완전 정복', contextUrl: '/course/21' },
  { type: 'course', id: '27', ownerId: '여행초보', title: '경주 한옥마을 1박2일', contextUrl: '/course/27' },
  { type: 'course', id: '33', ownerId: '맛집헌터', title: '제주 동부 카페 투어', contextUrl: '/course/33' },
  { type: 'course', id: '41', ownerId: '도시탐험가', title: '망원동 골목 산책', contextUrl: '/course/41' },
  { type: 'course', id: '45', ownerId: '바다러버', title: '강릉 일출 명소 5선', contextUrl: '/course/45' },
];

const COMMENT_TARGETS: ReportTarget[] = [
  { type: 'comment', id: 'cm12', ownerId: '익명러', courseId: '21', snippet: '여기 진짜 별로예요. 시간 낭비.', contextUrl: '/course/21#comment-cm12' },
  { type: 'comment', id: 'cm18', ownerId: '쓴소리', courseId: '27', snippet: '광고 같음. 신뢰 안 감', contextUrl: '/course/27#comment-cm18' },
  { type: 'comment', id: 'cm24', ownerId: '하이에나', courseId: '33', snippet: '여기 사장이랑 친한 거 아냐?', contextUrl: '/course/33#comment-cm24' },
  { type: 'comment', id: 'cm31', ownerId: '독설가', courseId: '41', snippet: '이 정도면 영업방해', contextUrl: '/course/41#comment-cm31' },
];

const USER_TARGETS: ReportTarget[] = [
  { type: 'user', id: 'u-901', ownerId: 'u-901', nickname: '광고봇닉네임', contextUrl: '/profile/u-901' },
  { type: 'user', id: 'u-902', ownerId: 'u-902', nickname: '사칭계정', contextUrl: '/profile/u-902' },
  { type: 'user', id: 'u-903', ownerId: 'u-903', nickname: '욕설러', contextUrl: '/profile/u-903' },
];

const REPORTERS = [
  { id: 'u-101', nickname: '여행러버' },
  { id: 'u-102', nickname: '맑은하루' },
  { id: 'u-103', nickname: '카페덕후' },
  { id: 'u-104', nickname: '도시여행자' },
  { id: 'u-105', nickname: '주말산책' },
  { id: 'u-106', nickname: '제주살이' },
  { id: 'u-107', nickname: '서울러' },
  { id: 'u-108', nickname: '나혼자떠나' },
];

interface Spec {
  target: ReportTarget;
  reasonCode: ReportReasonCode;
  status: ReportStatus;
  reportCount: number;
  autoBlinded: boolean;
  operator: string | null;
  ageMinutes: number;
}

const SPECS: Spec[] = [
  { target: COURSE_TARGETS[0], reasonCode: 'FAKE_INFO',  status: 'REVIEWING', reportCount: 7, autoBlinded: true,  operator: 'op-a', ageMinutes: 30 },
  { target: COURSE_TARGETS[0], reasonCode: 'SPAM_AD',    status: 'PENDING',   reportCount: 7, autoBlinded: true,  operator: null,   ageMinutes: 45 },
  { target: COURSE_TARGETS[1], reasonCode: 'ABUSE',      status: 'PENDING',   reportCount: 1, autoBlinded: false, operator: null,   ageMinutes: 90 },
  { target: COURSE_TARGETS[1], reasonCode: 'FAKE_INFO',  status: 'RESOLVED',  reportCount: 3, autoBlinded: false, operator: 'op-a', ageMinutes: 60 * 26 },
  { target: COURSE_TARGETS[2], reasonCode: 'COPYRIGHT',  status: 'PENDING',   reportCount: 2, autoBlinded: false, operator: null,   ageMinutes: 60 * 3 },
  { target: COURSE_TARGETS[2], reasonCode: 'SPAM_AD',    status: 'REJECTED',  reportCount: 2, autoBlinded: false, operator: 'op-b', ageMinutes: 60 * 48 },
  { target: COURSE_TARGETS[3], reasonCode: 'OBSCENE',    status: 'REVIEWING', reportCount: 4, autoBlinded: false, operator: 'op-b', ageMinutes: 60 * 5 },
  { target: COURSE_TARGETS[3], reasonCode: 'ETC',        status: 'PENDING',   reportCount: 4, autoBlinded: false, operator: null,   ageMinutes: 60 * 8 },
  { target: COURSE_TARGETS[4], reasonCode: 'FAKE_INFO',  status: 'PENDING',   reportCount: 1, autoBlinded: false, operator: null,   ageMinutes: 25 },
  { target: COURSE_TARGETS[4], reasonCode: 'ABUSE',      status: 'RESOLVED',  reportCount: 5, autoBlinded: true,  operator: 'op-a', ageMinutes: 60 * 72 },
  { target: COMMENT_TARGETS[0], reasonCode: 'ABUSE',             status: 'PENDING',   reportCount: 2, autoBlinded: false, operator: null,   ageMinutes: 15 },
  { target: COMMENT_TARGETS[0], reasonCode: 'PERSONAL_INFO_LEAK', status: 'REVIEWING', reportCount: 2, autoBlinded: false, operator: 'op-b', ageMinutes: 75 },
  { target: COMMENT_TARGETS[1], reasonCode: 'SPAM_AD',           status: 'RESOLVED',  reportCount: 8, autoBlinded: true,  operator: 'op-a', ageMinutes: 60 * 30 },
  { target: COMMENT_TARGETS[1], reasonCode: 'ABUSE',             status: 'PENDING',   reportCount: 8, autoBlinded: true,  operator: null,   ageMinutes: 60 * 1 },
  { target: COMMENT_TARGETS[2], reasonCode: 'OBSCENE',           status: 'PENDING',   reportCount: 1, autoBlinded: false, operator: null,   ageMinutes: 60 * 12 },
  { target: COMMENT_TARGETS[2], reasonCode: 'ABUSE',             status: 'REVIEWING', reportCount: 3, autoBlinded: false, operator: 'op-c', ageMinutes: 60 * 18 },
  { target: COMMENT_TARGETS[3], reasonCode: 'ABUSE',             status: 'RESOLVED',  reportCount: 6, autoBlinded: true,  operator: 'op-a', ageMinutes: 60 * 96 },
  { target: COMMENT_TARGETS[3], reasonCode: 'ETC',               status: 'PENDING',   reportCount: 6, autoBlinded: true,  operator: null,   ageMinutes: 60 * 4 },
  { target: USER_TARGETS[0], reasonCode: 'IMPROPER_PROFILE', status: 'PENDING',   reportCount: 5, autoBlinded: true,  operator: null,   ageMinutes: 60 * 2 },
  { target: USER_TARGETS[0], reasonCode: 'IMPERSONATION',   status: 'REVIEWING', reportCount: 5, autoBlinded: true,  operator: 'op-a', ageMinutes: 60 * 6 },
  { target: USER_TARGETS[1], reasonCode: 'IMPERSONATION',   status: 'RESOLVED',  reportCount: 3, autoBlinded: false, operator: 'op-b', ageMinutes: 60 * 120 },
  { target: USER_TARGETS[1], reasonCode: 'COPYRIGHT',       status: 'PENDING',   reportCount: 3, autoBlinded: false, operator: null,   ageMinutes: 60 * 10 },
  { target: USER_TARGETS[2], reasonCode: 'IMPROPER_PROFILE', status: 'REJECTED',  reportCount: 2, autoBlinded: false, operator: 'op-c', ageMinutes: 60 * 200 },
  { target: USER_TARGETS[2], reasonCode: 'ETC',             status: 'PENDING',   reportCount: 2, autoBlinded: false, operator: null,   ageMinutes: 50 },
  { target: COURSE_TARGETS[0], reasonCode: 'COPYRIGHT',  status: 'PENDING', reportCount: 7, autoBlinded: true,  operator: null,   ageMinutes: 5 },
  { target: COURSE_TARGETS[2], reasonCode: 'FAKE_INFO',  status: 'PENDING', reportCount: 2, autoBlinded: false, operator: null,   ageMinutes: 60 * 36 },
  { target: COURSE_TARGETS[1], reasonCode: 'SPAM_AD',    status: 'PENDING', reportCount: 1, autoBlinded: false, operator: null,   ageMinutes: 60 * 50 },
  { target: COMMENT_TARGETS[0], reasonCode: 'OBSCENE',   status: 'PENDING', reportCount: 2, autoBlinded: false, operator: null,   ageMinutes: 60 * 70 },
  { target: USER_TARGETS[0], reasonCode: 'ETC',          status: 'PENDING', reportCount: 5, autoBlinded: true,  operator: null,   ageMinutes: 60 * 14 },
  { target: COURSE_TARGETS[3], reasonCode: 'FAKE_INFO',  status: 'REVIEWING', reportCount: 4, autoBlinded: false, operator: 'op-c', ageMinutes: 60 * 22 },
  { target: COMMENT_TARGETS[2], reasonCode: 'PERSONAL_INFO_LEAK', status: 'RESOLVED', reportCount: 3, autoBlinded: false, operator: 'op-a', ageMinutes: 60 * 90 },
  { target: COURSE_TARGETS[4], reasonCode: 'ETC',        status: 'REJECTED', reportCount: 5, autoBlinded: true, operator: 'op-b', ageMinutes: 60 * 150 },
];

const DETAIL_SAMPLES: Partial<Record<ReportReasonCode, string>> = {
  SPAM_AD: '광고 링크가 본문에 반복적으로 포함되어 있습니다.',
  FAKE_INFO: '본문에 적힌 영업시간과 실제가 달랐고, 가격도 다릅니다.',
  OBSCENE: '청소년 유해 표현이 포함되어 있습니다.',
  ABUSE: '특정 사용자를 비방하는 표현이 반복됩니다.',
  COPYRIGHT: '제 사진을 도용한 것으로 보입니다.',
  IMPROPER_PROFILE: '닉네임이 욕설 또는 광고 키워드를 포함합니다.',
  IMPERSONATION: '실제 인물을 사칭하고 있습니다.',
  PERSONAL_INFO_LEAK: '제3자의 전화번호가 노출되어 있습니다.',
  ETC: '운영 정책 위반으로 보입니다.',
};

interface Cache {
  list: AdminReportListItem[];
  historyByReport: Map<string, HistoryEntry[]>;
  detailByReport: Map<string, { detail: string | null; resolution: ReportResolution | null }>;
}

let cache: Cache | null = null;

function buildInitialHistory(item: AdminReportListItem): HistoryEntry[] {
  const entries: HistoryEntry[] = [
    { status: 'PENDING', at: item.createdAt, actor: 'system' },
  ];
  const opActor = item.assignedOperator ? `operator:${item.assignedOperator}` : 'operator:op-a';
  if (item.status === 'REVIEWING') {
    entries.push({ status: 'REVIEWING', at: item.updatedAt, actor: opActor });
  } else if (item.status === 'RESOLVED') {
    const reviewAt = new Date(new Date(item.createdAt).getTime() + 30 * 60 * 1000).toISOString();
    entries.push({ status: 'REVIEWING', at: reviewAt, actor: opActor });
    entries.push({ status: 'RESOLVED', at: item.updatedAt, actor: opActor });
  } else if (item.status === 'REJECTED') {
    entries.push({ status: 'REJECTED', at: item.updatedAt, actor: opActor });
  }
  return entries;
}

function buildInitialResolution(item: AdminReportListItem): ReportResolution | null {
  if (item.status === 'RESOLVED') {
    return item.target.type === 'user' ? 'BANNED' : 'BLINDED';
  }
  if (item.status === 'REJECTED') return 'NO_ACTION';
  return null;
}

function init(): Cache {
  const now = Date.now();
  const list: AdminReportListItem[] = SPECS.map((spec, idx) => {
    const createdAt = new Date(now - spec.ageMinutes * 60 * 1000).toISOString();
    const updatedAt = spec.status === 'PENDING'
      ? createdAt
      : new Date(now - Math.max(0, spec.ageMinutes - 30) * 60 * 1000).toISOString();
    const reporter = REPORTERS[idx % REPORTERS.length];
    return {
      reportId: `r-${1000 + idx}`,
      target: spec.target,
      reasonCode: spec.reasonCode,
      status: spec.status,
      reporterId: reporter.id,
      reporterNickname: reporter.nickname,
      createdAt,
      updatedAt,
      assignedOperator: spec.operator,
      reportCount: spec.reportCount,
      autoBlinded: spec.autoBlinded,
    };
  });

  const historyByReport = new Map<string, HistoryEntry[]>();
  const detailByReport = new Map<string, { detail: string | null; resolution: ReportResolution | null }>();
  list.forEach((item, idx) => {
    historyByReport.set(item.reportId, buildInitialHistory(item));
    const sample = DETAIL_SAMPLES[item.reasonCode] ?? null;
    const detail = item.reasonCode === 'ETC' ? sample : idx % 2 === 0 ? sample : null;
    detailByReport.set(item.reportId, { detail, resolution: buildInitialResolution(item) });
  });

  return { list, historyByReport, detailByReport };
}

function ensure(): Cache {
  if (!cache) cache = init();
  return cache;
}

function buildRelated(currentReportId: string, target: ReportTarget): RelatedReportEntry[] {
  const all = ensure().list;
  return all
    .filter((r) => r.target.type === target.type && r.target.id === target.id && r.reportId !== currentReportId)
    .map((r) => ({
      reportId: r.reportId,
      reasonCode: r.reasonCode,
      reporterNickname: r.reporterNickname,
      createdAt: r.createdAt,
    }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getMockReports(): AdminReportListItem[] {
  return ensure().list;
}

export function getMockReportDetail(reportId: string): AdminReportDetail | null {
  const c = ensure();
  const item = c.list.find((r) => r.reportId === reportId);
  if (!item) return null;
  const history = c.historyByReport.get(reportId) ?? [];
  const extra = c.detailByReport.get(reportId) ?? { detail: null, resolution: null };
  return {
    ...item,
    detail: extra.detail,
    resolution: extra.resolution,
    history,
    relatedReports: buildRelated(reportId, item.target),
  };
}

export function updateMockReportStatus(
  reportId: string,
  status: ReportStatus,
  actor: string = 'operator:admin',
  note?: string,
): AdminReportDetail | null {
  const c = ensure();
  const idx = c.list.findIndex((r) => r.reportId === reportId);
  if (idx === -1) return null;
  const at = new Date().toISOString();
  c.list[idx] = { ...c.list[idx], status, updatedAt: at };
  const hist = c.historyByReport.get(reportId) ?? [];
  hist.push({ status, at, actor, ...(note ? { note } : {}) });
  c.historyByReport.set(reportId, hist);
  if (status === 'REJECTED') {
    const extra = c.detailByReport.get(reportId) ?? { detail: null, resolution: null };
    c.detailByReport.set(reportId, { ...extra, resolution: 'NO_ACTION' });
  }
  return getMockReportDetail(reportId);
}

export function applyMockSanction(
  reportId: string,
  payload: Pick<IssueSanctionPayload, 'type' | 'durationDays' | 'message' | 'resolution'>,
  actor: string = 'operator:admin',
): IssueSanctionResponse | null {
  const c = ensure();
  const item = c.list.find((r) => r.reportId === reportId);
  if (!item) return null;
  const at = new Date().toISOString();
  // 신고 상태를 RESOLVED로 전이
  const idx = c.list.findIndex((r) => r.reportId === reportId);
  c.list[idx] = { ...c.list[idx], status: 'RESOLVED', updatedAt: at };
  const hist = c.historyByReport.get(reportId) ?? [];
  const noteLabel = payload.type === 'TEMP_BAN' && payload.durationDays
    ? `${payload.type} ${payload.durationDays}일: ${payload.message}`
    : `${payload.type}: ${payload.message}`;
  hist.push({ status: 'RESOLVED', at, actor, note: noteLabel });
  c.historyByReport.set(reportId, hist);
  const extra = c.detailByReport.get(reportId) ?? { detail: null, resolution: null };
  c.detailByReport.set(reportId, { ...extra, resolution: payload.resolution });
  const report = getMockReportDetail(reportId);
  if (!report) return null;
  return {
    sanctionId: `s-${Date.now()}`,
    report,
  };
}
