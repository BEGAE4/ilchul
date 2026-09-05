import type { Place } from '@/shared/types';

export type SurveyStep =
  | 'landing'
  | 'survey1'
  | 'survey2'
  | 'survey3'
  | 'generating'
  | 'startPoint'
  | 'placeSelect'
  | 'placeDetail'
  | 'finalPlan';

export interface ResumeSnapshot {
  step: SurveyStep;
  recommendedPlaces: Place[];
  finalStops: Place[];
}

// 새로고침/다른 화면에 다녀온 뒤 코스 작성을 어느 단계에서 이어갈지 정한다.
//  - generating: 추천 요청이 끊겼으므로 출발지로 돌아가 '다음으로' 로 다시 요청한다
//  - placeDetail: 목록 위에 뜨는 화면이라 목록(placeSelect)으로 돌아간다
//  - placeSelect / finalPlan: 복원할 데이터(추천 결과 / 선택 장소)가 없으면 한 단계씩 앞으로 물러난다
// 이전에는 startPoint 이후를 무조건 startPoint 로 되돌려 6단계에서 새로고침하면 4단계로 떨어졌다 (QA C-05).
export function resolveResumeStep(s: ResumeSnapshot): SurveyStep {
  let step = s.step;
  if (step === 'generating') return 'startPoint';
  if (step === 'placeDetail') step = 'placeSelect';
  if (step === 'finalPlan' && s.finalStops.length === 0) step = 'placeSelect';
  if (step === 'placeSelect' && s.recommendedPlaces.length === 0) step = 'startPoint';
  return step;
}
