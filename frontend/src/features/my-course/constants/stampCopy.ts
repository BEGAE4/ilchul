// 기억 스탬프(머문 곳 기록) 문구. 힐링 여행 톤 — '인증', '기간 종료' 같은 과제 느낌을 피한다.
// 이름·문구를 바꿀 때는 이 파일만 고친다.
import type { TripPhase } from '@/features/plan/utils/tripPhase';

export const STAMP_COPY = {
  recordButton: '사진으로 머문 곳 기록하기',
  recordLaterButton: '여기 왔다면 오늘 기록하기',
  restedLabel: '이번엔 쉬어간 곳',
  stampedBadge: '기록됨',
  stampMark: '기억',
  modalTitle: '기억 스탬프 찍기',
  modalBodyLine1: '지금 이곳에 머물고 있나요?',
  modalBodyLine2: '사진 한 장으로 오늘을 남겨요.',
  recordingTitle: '기록하는 중...',
  successToast: '기억 스탬프를 찍었어요',
  guide: {
    during: '마음에 드는 곳에서 사진 한 장 남겨보세요. 순서도 시간도 자유예요.',
    before: '여행 날이 되면 바로 기록할 수 있어요. 먼저 가게 됐다면 오늘 여행으로 바꿔 기록해도 돼요.',
    unscheduled: '일정이 없어도 괜찮아요. 그곳에 있다면 오늘 여행으로 정하고 기록할 수 있어요.',
    after: '지난 여행이에요. 다시 들렀다면 오늘 여행으로 바꿔 기록할 수 있어요.',
  } satisfies Record<TripPhase, string>,
  progressLabel: '머문 곳',
  allStampedBanner: '모든 곳에 머물렀어요',
  partialBanner: (stamped: number, total: number) => `이번 여행, ${total}곳 중 ${stamped}곳에 머물렀어요`,
  partialBannerAction: '기록 남기기',
  celebrationTitle: '모든 곳을 담았어요',
  celebrationBody: (total: number) => `${total}곳의 기억 스탬프를 모았어요 ✨`,
  moveModal: {
    title: '오늘 여행으로 바꿀까요?',
    bodyScheduled: (from: string, today: string) =>
      `여행 날짜를 ${from}에서 오늘(${today})로 옮기고 바로 기록할게요. 시간은 그대로예요.`,
    bodyUnscheduled: (start: string, end: string) => `오늘 ${start}~${end} 일정으로 정하고 바로 기록할게요.`,
    confirm: '오늘로 바꾸고 기록하기',
    saving: '바꾸는 중...',
    cancel: '그대로 둘게요',
    failToast: '여행 날짜를 바꾸지 못했어요. 다시 시도해주세요.',
    lockedToast: '이미 기록이 있는 여행이라 날짜는 그대로 두고 기록할게요.',
  },
  noLocation: {
    title: '현재 위치를 확인할 수 없어요.',
    description: '위치 권한을 허용한 뒤 다시 시도해주세요.',
  },
  error: {
    outOfRange: {
      title: '장소에서 조금 떨어져 있어요.',
      description: '장소 가까이(150m 안)에서 다시 남겨주세요.',
    },
    alreadyStamped: {
      title: '이미 기록한 곳이에요.',
      description: '화면을 새로 불러올게요.',
    },
    generic: {
      title: '기록하지 못했어요.',
      description: '위치와 네트워크 상태를 확인한 뒤 다시 시도해주세요.',
    },
  },
} as const;
