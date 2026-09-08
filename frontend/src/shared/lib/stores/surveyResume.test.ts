import { resolveResumeStep } from './surveyResume';
import type { Place } from '@/shared/types';

const p = (id: string): Place => ({
  id,
  name: `장소${id}`,
  category: '카페',
  time: '60분',
  description: '',
  image: '',
  address: '서울',
  phone: '',
  tags: [],
});

describe('resolveResumeStep', () => {
  it('설문·출발지 단계는 그대로 이어간다', () => {
    for (const step of ['landing', 'survey1', 'survey2', 'survey3', 'startPoint'] as const) {
      expect(resolveResumeStep({ step, recommendedPlaces: [], finalStops: [] })).toBe(step);
    }
  });

  it('추천 요청 중(generating)이었으면 출발지로 돌아가 다시 요청한다', () => {
    expect(resolveResumeStep({ step: 'generating', recommendedPlaces: [p('1')], finalStops: [] })).toBe(
      'startPoint'
    );
  });

  it('추천 결과가 저장돼 있으면 장소 선택 단계를 그대로 복원한다 (QA C-05)', () => {
    expect(resolveResumeStep({ step: 'placeSelect', recommendedPlaces: [p('1')], finalStops: [] })).toBe(
      'placeSelect'
    );
  });

  it('장소 선택 단계인데 추천 결과가 없으면 출발지로', () => {
    expect(resolveResumeStep({ step: 'placeSelect', recommendedPlaces: [], finalStops: [] })).toBe('startPoint');
  });

  it('장소 상세는 목록 위에 뜨는 화면이라 장소 선택으로 돌아간다', () => {
    expect(resolveResumeStep({ step: 'placeDetail', recommendedPlaces: [p('1')], finalStops: [] })).toBe(
      'placeSelect'
    );
  });

  it('최종 플랜은 선택 장소가 있으면 그대로, 없으면 장소 선택으로', () => {
    expect(resolveResumeStep({ step: 'finalPlan', recommendedPlaces: [p('1')], finalStops: [p('1')] })).toBe(
      'finalPlan'
    );
    expect(resolveResumeStep({ step: 'finalPlan', recommendedPlaces: [p('1')], finalStops: [] })).toBe(
      'placeSelect'
    );
    expect(resolveResumeStep({ step: 'finalPlan', recommendedPlaces: [], finalStops: [] })).toBe('startPoint');
  });
});
