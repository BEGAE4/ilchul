import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { SurveyData, Place, StartingPoint } from '@/shared/types';
import { DEFAULT_START_COORD } from '@/shared/lib/constants/coords';
import { resolveResumeStep, type SurveyStep } from './surveyResume';

export type { SurveyStep } from './surveyResume';

interface SurveyState {
  step: SurveyStep;
  previousStep: SurveyStep;
  surveyData: Partial<SurveyData>;
  // 설문 기반 장소 추천 결과 (POST /api/place/recommend). 새로고침 후에도 장소 선택 단계를
  // 그대로 복원할 수 있도록 컴포넌트 state 가 아니라 스토어에 둔다 (QA C-05).
  recommendedPlaces: Place[];
  selectedPlaceIds: string[];
  finalStops: Place[];
  viewingPlaceId: string | null;
  isRecalculating: boolean;
  startingPoint: StartingPoint;

  setStep: (step: SurveyStep) => void;
  setPreviousStep: (step: SurveyStep) => void;
  updateSurvey: (key: keyof SurveyData, value: string) => void;
  setRecommendedPlaces: (places: Place[]) => void;
  togglePlaceSelection: (placeId: string) => void;
  clearPlaceSelection: () => void;
  setFinalStops: (stops: Place[]) => void;
  setViewingPlaceId: (id: string | null) => void;
  setIsRecalculating: (v: boolean) => void;
  setStartingPoint: (point: StartingPoint) => void;
  reset: () => void;
}

const initialStartingPoint: StartingPoint = {
  type: 'suggestion',
  address: '',
  coord: DEFAULT_START_COORD,
};

const initialState = {
  step: 'landing' as SurveyStep,
  previousStep: 'landing' as SurveyStep,
  surveyData: {} as Partial<SurveyData>,
  recommendedPlaces: [] as Place[],
  selectedPlaceIds: [] as string[],
  finalStops: [] as Place[],
  viewingPlaceId: null,
  isRecalculating: false,
  startingPoint: initialStartingPoint,
};

export const useSurveyStore = create<SurveyState>()(
  persist(
    (set) => ({
      ...initialState,

      setStep: (step) => set({ step }),

      setPreviousStep: (previousStep) => set({ previousStep }),

      updateSurvey: (key, value) =>
        set((state) => ({
          surveyData: { ...state.surveyData, [key]: value },
        })),

      setRecommendedPlaces: (recommendedPlaces) => set({ recommendedPlaces }),

      togglePlaceSelection: (placeId) =>
        set((state) => {
          const ids = state.selectedPlaceIds;
          if (ids.includes(placeId)) {
            return { selectedPlaceIds: ids.filter((id) => id !== placeId) };
          }
          return { selectedPlaceIds: [...ids, placeId] };
        }),

      // 추천을 다시 받으면 이전 목록의 placeId가 더는 유효하지 않으므로 선택을 비운다
      clearPlaceSelection: () => set({ selectedPlaceIds: [] }),

      setFinalStops: (stops) => set({ finalStops: stops }),

      setViewingPlaceId: (viewingPlaceId) => set({ viewingPlaceId }),

      setIsRecalculating: (isRecalculating) => set({ isRecalculating }),

      setStartingPoint: (startingPoint) => set({ startingPoint }),

      reset: () => set({ ...initialState, startingPoint: initialStartingPoint }),
    }),
    {
      name: 'ilchul-survey',
      // 탭을 닫으면 비워지도록 sessionStorage 사용 (플랜 작성은 한 세션 안에서 끝나는 흐름)
      storage: createJSONStorage(() => sessionStorage),
      // 서버 렌더 결과와 어긋나지 않도록 첫 렌더는 기본 상태로 두고,
      // 컴포넌트 마운트 후 rehydrate()로 복원한다.
      skipHydration: true,
      // 화면을 다시 세울 때 필요한 입력·결과만 저장한다. 서버 프리뷰(소요시간/거리)는
      // 컴포넌트 state 로 남기고 finalPlan 복원 시 다시 요청한다.
      partialize: (state) => ({
        step: state.step,
        previousStep: state.previousStep,
        surveyData: state.surveyData,
        startingPoint: state.startingPoint,
        recommendedPlaces: state.recommendedPlaces,
        selectedPlaceIds: state.selectedPlaceIds,
        finalStops: state.finalStops,
      }),
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<SurveyState>;
        const merged = { ...current, ...saved };
        return { ...merged, step: saved.step ? resolveResumeStep(merged) : current.step };
      },
    }
  )
);
