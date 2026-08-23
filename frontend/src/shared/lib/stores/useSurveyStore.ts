import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { SurveyData, Place, StartingPoint } from '@/shared/types';
import { DEFAULT_START_COORD } from '@/shared/lib/constants/coords';

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

interface SurveyState {
  step: SurveyStep;
  previousStep: SurveyStep;
  surveyData: Partial<SurveyData>;
  selectedPlaceIds: string[];
  finalStops: Place[];
  viewingPlaceId: string | null;
  isRecalculating: boolean;
  startingPoint: StartingPoint;

  setStep: (step: SurveyStep) => void;
  setPreviousStep: (step: SurveyStep) => void;
  updateSurvey: (key: keyof SurveyData, value: string) => void;
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
  selectedPlaceIds: [] as string[],
  finalStops: [] as Place[],
  viewingPlaceId: null,
  isRecalculating: false,
  startingPoint: initialStartingPoint,
};

// 새로고침 후 그대로 이어서 진행해도 화면이 성립하는 단계들.
// placeSelect 이후는 추천 결과가 컴포넌트 상태(recommendedPlaces)라 함께 복원되지 않으므로,
// 설문 입력은 살리되 출발지 단계로 되돌려 다시 추천을 받게 한다.
const RESUMABLE_STEPS: SurveyStep[] = ['landing', 'survey1', 'survey2', 'survey3', 'startPoint'];

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
      partialize: (state) => ({
        step: state.step,
        surveyData: state.surveyData,
        startingPoint: state.startingPoint,
      }),
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<SurveyState>;
        const step = !saved.step
          ? current.step
          : RESUMABLE_STEPS.includes(saved.step)
            ? saved.step
            : 'startPoint';
        return { ...current, ...saved, step };
      },
    }
  )
);
