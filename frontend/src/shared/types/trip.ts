export interface TripTimeSummary {
  legMinutes: number[];
  returnMinutes: number;
  travelMinutes: number;
  stayMinutes: number;
  totalMinutes: number;
  totalDistanceKm: number;
  estimated: boolean;
}
