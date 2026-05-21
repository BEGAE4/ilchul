import type {
  AdminInquiryDetail,
  AdminInquiryListItem,
  InquiryAnswer,
  InquiryAttachment,
  InquiryAuthor,
  InquiryCategory,
  InquiryStatus,
} from '@/features/admin-inquiry/types/adminInquiry';

const AUTHORS: InquiryAuthor[] = [
  { userId: 'u-201', nickname: '여행초보', email: 'beginner@example.com' },
  { userId: 'u-202', nickname: '맑은하루', email: 'sunny@example.com' },
  { userId: 'u-203', nickname: '카페덕후', email: null },
  { userId: 'u-204', nickname: '제주살이', email: 'jeju@example.com' },
  { userId: 'u-205', nickname: '도시탐험가', email: null },
  { userId: 'u-206', nickname: '주말산책', email: 'walk@example.com' },
  { userId: 'u-207', nickname: '바다러버', email: 'sea@example.com' },
  { userId: 'u-208', nickname: '서울러', email: null },
  { userId: 'u-209', nickname: '나혼자떠나', email: 'solo@example.com' },
  { userId: 'u-210', nickname: '맛집헌터', email: 'food@example.com' },
];

interface Spec {
  title: string;
  category: InquiryCategory;
  status: InquiryStatus;
  answerCount: number;
  hasUnread: boolean;
  operator: string | null;
  ageMinutes: number;
}

const SPECS: Spec[] = [
  { title: '비밀번호를 잊어버렸어요',                  category: 'ACCOUNT',       status: 'OPEN',     answerCount: 0, hasUnread: false, operator: null,   ageMinutes: 20 },
  { title: '카카오 로그인 후 닉네임이 안 뜨네요',       category: 'ACCOUNT',       status: 'ANSWERED', answerCount: 1, hasUnread: true,  operator: 'op-a', ageMinutes: 60 * 4 },
  { title: '계정 탈퇴는 어디서 하나요?',               category: 'ACCOUNT',       status: 'CLOSED',   answerCount: 1, hasUnread: false, operator: 'op-a', ageMinutes: 60 * 72 },
  { title: '플랜 등록한 게 안 보여요',                 category: 'CONTENT',       status: 'OPEN',     answerCount: 0, hasUnread: false, operator: null,   ageMinutes: 60 },
  { title: '코스에 장소 추가가 안 됩니다',              category: 'CONTENT',       status: 'ANSWERED', answerCount: 2, hasUnread: false, operator: 'op-b', ageMinutes: 60 * 8 },
  { title: '추천 코스가 너무 적어요',                   category: 'CONTENT',       status: 'ANSWERED', answerCount: 1, hasUnread: true,  operator: 'op-c', ageMinutes: 60 * 12 },
  { title: '제 코스가 갑자기 가려졌어요. 이유 알려주세요', category: 'REPORT_APPEAL', status: 'OPEN',     answerCount: 0, hasUnread: false, operator: null,   ageMinutes: 30 },
  { title: '경고를 받았는데 어떤 부분이 문제였나요?',     category: 'REPORT_APPEAL', status: 'OPEN',     answerCount: 0, hasUnread: false, operator: null,   ageMinutes: 90 },
  { title: '정지 처분에 대한 이의 제기합니다',          category: 'REPORT_APPEAL', status: 'ANSWERED', answerCount: 1, hasUnread: true,  operator: 'op-a', ageMinutes: 60 * 6 },
  { title: '제재 기간이 끝났는데 풀리지 않아요',        category: 'REPORT_APPEAL', status: 'CLOSED',   answerCount: 2, hasUnread: false, operator: 'op-b', ageMinutes: 60 * 100 },
  { title: '앱이 종료된 후 다시 켜면 흰 화면이 떠요',    category: 'BUG',           status: 'OPEN',     answerCount: 0, hasUnread: false, operator: null,   ageMinutes: 15 },
  { title: '지도 핀이 안 보이는데 제 위치 문제인가요?', category: 'BUG',           status: 'ANSWERED', answerCount: 3, hasUnread: false, operator: 'op-c', ageMinutes: 60 * 2 },
  { title: '댓글 작성 시 줄바꿈이 안 됩니다',            category: 'BUG',           status: 'CLOSED',   answerCount: 1, hasUnread: false, operator: 'op-c', ageMinutes: 60 * 120 },
  { title: '검색에서 최근 본 장소 자동완성 됐으면',     category: 'FEATURE',       status: 'OPEN',     answerCount: 0, hasUnread: false, operator: null,   ageMinutes: 50 },
  { title: '코스 공유 시 카카오톡 공유도 됐으면',        category: 'FEATURE',       status: 'ANSWERED', answerCount: 1, hasUnread: false, operator: 'op-a', ageMinutes: 60 * 10 },
  { title: '다크모드를 추가해주세요',                   category: 'FEATURE',       status: 'ANSWERED', answerCount: 2, hasUnread: true,  operator: 'op-b', ageMinutes: 60 * 24 },
  { title: '음성 검색 기능이 있으면 좋겠어요',          category: 'FEATURE',       status: 'CLOSED',   answerCount: 1, hasUnread: false, operator: 'op-a', ageMinutes: 60 * 168 },
  { title: '결제 영수증은 어디서 받나요?',              category: 'ACCOUNT',       status: 'OPEN',     answerCount: 0, hasUnread: false, operator: null,   ageMinutes: 60 * 3 },
  { title: '제가 만든 코스를 다른 사람이 복사해 갔어요', category: 'CONTENT',       status: 'OPEN',     answerCount: 0, hasUnread: false, operator: null,   ageMinutes: 60 * 7 },
  { title: '서비스 정책 페이지가 안 열려요',            category: 'BUG',           status: 'ANSWERED', answerCount: 1, hasUnread: false, operator: 'op-b', ageMinutes: 60 * 16 },
  { title: '제 닉네임으로 다른 사람이 활동하고 있어요', category: 'REPORT_APPEAL', status: 'OPEN',     answerCount: 0, hasUnread: false, operator: null,   ageMinutes: 60 * 5 },
  { title: '리뷰 수정이 안 됩니다',                     category: 'BUG',           status: 'OPEN',     answerCount: 0, hasUnread: false, operator: null,   ageMinutes: 45 },
  { title: '관리자 답변 못 받았어요',                   category: 'ETC',           status: 'OPEN',     answerCount: 0, hasUnread: false, operator: null,   ageMinutes: 60 * 36 },
  { title: '광고 문의드립니다',                         category: 'ETC',           status: 'CLOSED',   answerCount: 1, hasUnread: false, operator: 'op-c', ageMinutes: 60 * 200 },
  { title: '이벤트 당첨 알림이 안 와요',                category: 'ETC',           status: 'ANSWERED', answerCount: 1, hasUnread: false, operator: 'op-a', ageMinutes: 60 * 20 },
  { title: '계정 이메일 변경하고 싶어요',               category: 'ACCOUNT',       status: 'ANSWERED', answerCount: 2, hasUnread: false, operator: 'op-b', ageMinutes: 60 * 30 },
  { title: '플랜 비공개 설정이 안 됩니다',              category: 'BUG',           status: 'OPEN',     answerCount: 0, hasUnread: false, operator: null,   ageMinutes: 60 * 2 },
  { title: '광고/협업 제안 드립니다',                   category: 'ETC',           status: 'OPEN',     answerCount: 0, hasUnread: false, operator: null,   ageMinutes: 60 * 13 },
  { title: '한 코스에 장소가 너무 많이 추가됩니다',     category: 'FEATURE',       status: 'OPEN',     answerCount: 0, hasUnread: false, operator: null,   ageMinutes: 60 * 15 },
  { title: '본인인증 페이지가 멈춰요',                  category: 'BUG',           status: 'ANSWERED', answerCount: 1, hasUnread: true,  operator: 'op-c', ageMinutes: 60 * 5 },
  { title: '신고 처리 결과를 메일로도 받고 싶어요',     category: 'FEATURE',       status: 'CLOSED',   answerCount: 2, hasUnread: false, operator: 'op-a', ageMinutes: 60 * 80 },
  { title: '계정 통합 가능한가요? 두 계정 있어요',      category: 'ACCOUNT',       status: 'OPEN',     answerCount: 0, hasUnread: false, operator: null,   ageMinutes: 60 * 9 },
];

const BODY_BY_CATEGORY: Record<InquiryCategory, string> = {
  ACCOUNT: '안녕하세요. 계정 관련해서 도움을 받고 싶어 문의드립니다. 자세한 내용은 본문에 적었으니 확인 부탁드립니다.',
  CONTENT: '제가 등록한 콘텐츠 관련해서 궁금한 점이 있어 문의드립니다. 확인 후 답변 부탁드려요.',
  REPORT_APPEAL: '신고/제재 처분에 대해 이의제기 드립니다. 처분 사유와 기준을 다시 확인 부탁드립니다.',
  BUG: '서비스 이용 중 오류가 발생해서 신고드립니다. 단말기는 iOS 17 / Android 13 둘 다 재현됩니다.',
  FEATURE: '아래 기능이 추가되면 좋겠습니다. 사용자 입장에서 자주 필요한 기능입니다.',
  ETC: '기타 문의 사항입니다. 답변 부탁드립니다.',
};

const ANSWER_BODY_SAMPLES = [
  '안녕하세요. 문의해주신 내용 확인했습니다. 해당 부분은 확인 후 빠르게 처리해드리겠습니다.',
  '안내드립니다. 말씀하신 증상은 최신 버전(1.5.x)에서 수정됐습니다. 앱 업데이트 후 다시 시도해주세요.',
  '확인 결과 운영 정책상 처분이 정상 적용되어 있습니다. 자세한 기준은 약관 §5조를 참고해주세요.',
  '추가로 확인 필요한 부분이 있어 안내드립니다. 가능하시면 스크린샷을 회신 주시면 더 빠른 처리에 도움이 됩니다.',
];

const OPERATORS = [
  { id: 'op-a', name: '운영자A' },
  { id: 'op-b', name: '운영자B' },
  { id: 'op-c', name: '운영자C' },
];

interface Cache {
  list: AdminInquiryListItem[];
  bodyByInquiry: Map<string, string>;
  attachmentsByInquiry: Map<string, InquiryAttachment[]>;
  answersByInquiry: Map<string, InquiryAnswer[]>;
}

let cache: Cache | null = null;

function buildInitialAnswers(inquiryId: string, count: number, baseAgeMinutes: number): InquiryAnswer[] {
  const result: InquiryAnswer[] = [];
  for (let i = 0; i < count; i += 1) {
    const op = OPERATORS[i % OPERATORS.length];
    const ageMin = Math.max(1, baseAgeMinutes - 30 - i * 60);
    const at = new Date(Date.now() - ageMin * 60 * 1000).toISOString();
    result.push({
      answerId: `a-${inquiryId}-${i + 1}`,
      body: ANSWER_BODY_SAMPLES[i % ANSWER_BODY_SAMPLES.length],
      authorOperatorId: op.id,
      authorOperatorName: op.name,
      createdAt: at,
      updatedAt: at,
    });
  }
  return result;
}

function init(): Cache {
  const now = Date.now();
  const list: AdminInquiryListItem[] = [];
  const bodyByInquiry = new Map<string, string>();
  const attachmentsByInquiry = new Map<string, InquiryAttachment[]>();
  const answersByInquiry = new Map<string, InquiryAnswer[]>();

  SPECS.forEach((spec, idx) => {
    const inquiryId = `q-${2000 + idx}`;
    const createdAt = new Date(now - spec.ageMinutes * 60 * 1000).toISOString();
    const updatedAt = spec.answerCount > 0
      ? new Date(now - Math.max(0, spec.ageMinutes - 30) * 60 * 1000).toISOString()
      : createdAt;
    const author = AUTHORS[idx % AUTHORS.length];

    list.push({
      inquiryId,
      title: spec.title,
      category: spec.category,
      author,
      status: spec.status,
      hasUnreadByAuthor: spec.hasUnread,
      answerCount: spec.answerCount,
      createdAt,
      updatedAt,
      assignedOperator: spec.operator,
    });

    bodyByInquiry.set(inquiryId, BODY_BY_CATEGORY[spec.category]);
    if (spec.category === 'BUG' && idx % 4 === 0) {
      attachmentsByInquiry.set(inquiryId, [
        { id: `att-${inquiryId}-1`, name: 'screenshot.png', url: '#' },
      ]);
    } else {
      attachmentsByInquiry.set(inquiryId, []);
    }
    answersByInquiry.set(inquiryId, buildInitialAnswers(inquiryId, spec.answerCount, spec.ageMinutes));
  });

  return { list, bodyByInquiry, attachmentsByInquiry, answersByInquiry };
}

function ensure(): Cache {
  if (!cache) cache = init();
  return cache;
}

function syncAnswerCount(c: Cache, inquiryId: string): void {
  const idx = c.list.findIndex((r) => r.inquiryId === inquiryId);
  if (idx === -1) return;
  const answers = c.answersByInquiry.get(inquiryId) ?? [];
  c.list[idx] = { ...c.list[idx], answerCount: answers.length };
}

export function getMockInquiries(): AdminInquiryListItem[] {
  return ensure().list;
}

export function getMockInquiryDetail(inquiryId: string): AdminInquiryDetail | null {
  const c = ensure();
  const item = c.list.find((r) => r.inquiryId === inquiryId);
  if (!item) return null;
  const answers = c.answersByInquiry.get(inquiryId) ?? [];
  const body = c.bodyByInquiry.get(inquiryId) ?? '';
  const attachments = c.attachmentsByInquiry.get(inquiryId) ?? [];
  return {
    ...item,
    answerCount: answers.length,
    body,
    attachments,
    answers,
  };
}

export function updateMockInquiryStatus(
  inquiryId: string,
  status: InquiryStatus,
): AdminInquiryDetail | null {
  const c = ensure();
  const idx = c.list.findIndex((r) => r.inquiryId === inquiryId);
  if (idx === -1) return null;
  const at = new Date().toISOString();
  c.list[idx] = { ...c.list[idx], status, updatedAt: at };
  return getMockInquiryDetail(inquiryId);
}

export function createMockInquiryAnswer(
  inquiryId: string,
  body: string,
  closeAfter: boolean,
): AdminInquiryDetail | null {
  const c = ensure();
  const item = c.list.find((r) => r.inquiryId === inquiryId);
  if (!item) return null;
  const answers = c.answersByInquiry.get(inquiryId) ?? [];
  const at = new Date().toISOString();
  const newAnswer: InquiryAnswer = {
    answerId: `a-${inquiryId}-${answers.length + 1}-${Date.now()}`,
    body,
    authorOperatorId: 'op-admin',
    authorOperatorName: '관리자',
    createdAt: at,
    updatedAt: at,
  };
  c.answersByInquiry.set(inquiryId, [...answers, newAnswer]);

  const idx = c.list.findIndex((r) => r.inquiryId === inquiryId);
  const nextStatus: InquiryStatus = closeAfter
    ? 'CLOSED'
    : item.status === 'OPEN'
      ? 'ANSWERED'
      : item.status;
  c.list[idx] = { ...c.list[idx], status: nextStatus, updatedAt: at };
  syncAnswerCount(c, inquiryId);
  return getMockInquiryDetail(inquiryId);
}

export function updateMockInquiryAnswer(
  inquiryId: string,
  answerId: string,
  body: string,
): AdminInquiryDetail | null {
  const c = ensure();
  const answers = c.answersByInquiry.get(inquiryId);
  if (!answers) return null;
  const idx = answers.findIndex((a) => a.answerId === answerId);
  if (idx === -1) return null;
  const at = new Date().toISOString();
  answers[idx] = { ...answers[idx], body, updatedAt: at };
  c.answersByInquiry.set(inquiryId, [...answers]);

  const listIdx = c.list.findIndex((r) => r.inquiryId === inquiryId);
  if (listIdx !== -1) {
    c.list[listIdx] = { ...c.list[listIdx], updatedAt: at };
  }
  return getMockInquiryDetail(inquiryId);
}

export function deleteMockInquiryAnswer(
  inquiryId: string,
  answerId: string,
): AdminInquiryDetail | null {
  const c = ensure();
  const answers = c.answersByInquiry.get(inquiryId);
  if (!answers) return null;
  const next = answers.filter((a) => a.answerId !== answerId);
  if (next.length === answers.length) return null;
  c.answersByInquiry.set(inquiryId, next);

  const idx = c.list.findIndex((r) => r.inquiryId === inquiryId);
  if (idx !== -1) {
    const at = new Date().toISOString();
    const cur = c.list[idx];
    const nextStatus: InquiryStatus =
      next.length === 0 && cur.status === 'ANSWERED' ? 'OPEN' : cur.status;
    c.list[idx] = { ...cur, status: nextStatus, updatedAt: at };
    syncAnswerCount(c, inquiryId);
  }
  return getMockInquiryDetail(inquiryId);
}
