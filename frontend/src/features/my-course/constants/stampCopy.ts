// 기억 스탬프(머문 곳 기록) 문구. 힐링 여행 톤 — '인증', '기간 종료' 같은 과제 느낌을 피한다.
// 이름·문구를 바꿀 때는 이 파일만 고친다.
import type { TripPhase } from '@/features/plan/utils/tripPhase';

export const STAMP_COPY = {
  recordButton: '사진으로 머문 곳 기록하기',
  restedLabel: '이번엔 쉬어간 곳',
  stampedBadge: '기록됨',
  stampMark: '기억',
  modalTitle: '기억 스탬프 찍기',
  modalBodyLine1: '지금 이곳에 머물고 있나요?',
  modalBodyLine2: '사진 한 장으로 오늘을 남겨요.',
  cameraButton: '카메라 켜기',
  // 카메라를 못 쓰거나(권한 거부·저조도) 이미 찍어둔 사진으로 남기고 싶을 때의 보조 동선.
  // 현장 확인은 서버의 좌표 검사(150m)가 하므로 사진 출처는 인증 강도와 무관하다.
  galleryButton: '앨범에서 선택',
  recordingTitle: '기록하는 중...',
  successToast: '기억 스탬프를 찍었어요',
  guide: {
    during: '마음에 드는 곳에서 사진 한 장 남겨보세요. 순서도 시간도 자유예요.',
    before: '여행 날이 되면 하루 종일 기록할 수 있어요.',
    unscheduled: '일정을 정하면 그날 기록할 수 있어요.',
    after: '지난 여행이에요. 다시 가고 싶다면 복제해서 새 일정으로 떠나요.',
  } satisfies Record<TripPhase, string>,
  // 여행 날이 아닐 때 장소 카드의 비활성 문구 ('M/D')
  lockedBefore: (date: string) => `여행 날(${date})에 기록할 수 있어요`,
  lockedUnscheduled: '일정을 정하면 그날 기록할 수 있어요',
  cloneCta: '복제해서 새 일정으로 떠나기',
  // 기록이 있는 여행은 그 날짜의 현장 기록이라 일정을 옮기지 않는다
  scheduleLockedStamped: '기록을 남긴 여행은 일정을 바꿀 수 없어요',
  progressLabel: '머문 곳',
  allStampedBanner: '모든 곳에 머물렀어요',
  partialBanner: (stamped: number, total: number) => `이번 여행, ${total}곳 중 ${stamped}곳에 머물렀어요`,
  partialBannerAction: '기록 남기기',
  celebrationTitle: '모든 곳을 담았어요',
  celebrationBody: (total: number) => `${total}곳의 기억 스탬프를 모았어요 ✨`,
  noLocation: {
    title: '현재 위치를 확인할 수 없어요.',
    description: '위치 권한을 허용한 뒤 다시 시도해주세요.',
  },
  error: {
    outOfRange: {
      title: '장소에서 조금 떨어져 있어요.',
      description: '장소 가까이(150m 안)에서 다시 남겨주세요.',
    },
    // 위치 오차가 판정 반경보다 커서 '떨어져 있다'고 단정할 수 없을 때. 실내·지하에서 잦다.
    inaccurateLocation: {
      title: '위치를 정확히 잡지 못했어요.',
      description: '실내라면 창가나 바깥에서 잠시 후 다시 시도해주세요.',
    },
    alreadyStamped: {
      title: '이미 기록한 곳이에요.',
      description: '화면을 새로 불러올게요.',
    },
    tooLarge: {
      title: '사진 용량이 너무 커요.',
      description: '다른 사진으로 다시 남겨주세요.',
    },
    generic: {
      title: '기록하지 못했어요.',
      description: '위치와 네트워크 상태를 확인한 뒤 다시 시도해주세요.',
    },
  },
} as const;
