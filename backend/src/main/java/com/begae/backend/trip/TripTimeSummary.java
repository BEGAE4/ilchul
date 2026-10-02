package com.begae.backend.trip;

import java.util.List;

/** Minutes throughout. legMinutes[i] is the incoming leg of stop i; return is separate. */
public record TripTimeSummary(
        List<Integer> legMinutes, int returnMinutes, int travelMinutes,
        int stayMinutes, int totalMinutes, int totalDistanceKm, boolean estimated) {
    public TripTimeSummary {
        legMinutes = List.copyOf(legMinutes);
    }
}
