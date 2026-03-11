import { create } from 'zustand';
import type { SurveyData, Place, StartingPoint } from '@/shared/types';
import { DEFAULT_START_COORD } from '@/shared/data/mockData';

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

export const useSurveyStore = create<SurveyState>((set) => ({
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

  setFinalStops: (stops) => set({ finalStops: stops }),

  setViewingPlaceId: (viewingPlaceId) => set({ viewingPlaceId }),

  setIsRecalculating: (isRecalculating) => set({ isRecalculating }),

  setStartingPoint: (startingPoint) => set({ startingPoint }),

  reset: () => set({ ...initialState, startingPoint: initialStartingPoint }),
}));
