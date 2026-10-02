package com.begae.backend.trip;

import com.begae.backend.global.exception.CustomException;
import com.begae.backend.global.exception.GlobalErrorCode;
import com.begae.backend.plan_place.exception.PlanPlaceErrorCode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

public final class TripTimePolicy {
    public static final int MAX_STOPS = 5;
    private static final Pattern LIMIT = Pattern.compile("(?:(\\d{1,2})시간)?\\s*(?:(\\d{1,3})분)?(?:\\s*이내)?");
    private TripTimePolicy() {}

    public static void validateTransport(String transport) {
        if (transport == null || !Set.of("도보", "대중교통", "자가용").contains(transport)) invalid();
    }

    public static Integer travelLimit(String value) {
        if (value == null || value.isBlank() || "상관없어요".equals(value.trim())) return null;
        var matcher = LIMIT.matcher(value.trim());
        if (!matcher.matches() || (matcher.group(1) == null && matcher.group(2) == null)) invalid();
        int minutes = (matcher.group(1) == null ? 0 : Integer.parseInt(matcher.group(1)) * 60)
                + (matcher.group(2) == null ? 0 : Integer.parseInt(matcher.group(2)));
        if (minutes <= 0 || minutes > 1440) invalid();
        return minutes;
    }

    public static int availableMinutes(LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null) invalid();
        long minutes = Duration.between(start, end).toMinutes();
        if (minutes <= 0 || minutes > 1440) invalid();
        return Math.toIntExact(minutes);
    }

    public static void validateCoordinates(Double x, Double y) {
        if (x == null || y == null || !Double.isFinite(x) || !Double.isFinite(y)
                || x < -180 || x > 180 || y < -90 || y > 90) invalid();
    }

    public static void validateStops(List<Integer> ids, List<Integer> orders, List<Integer> stays) {
        if (ids == null || ids.isEmpty() || ids.size() > MAX_STOPS || orders.size() != ids.size()
                || stays.size() != ids.size() || new HashSet<>(ids).size() != ids.size()) invalid();
        Set<Integer> seen = new HashSet<>();
        for (int i = 0; i < ids.size(); i++) {
            if (ids.get(i) == null || ids.get(i) <= 0 || orders.get(i) == null
                    || orders.get(i) < 1 || orders.get(i) > ids.size() || !seen.add(orders.get(i))
                    || stays.get(i) == null || stays.get(i) < 30 || stays.get(i) > 90) invalid();
        }
    }

    public static boolean fits(TripTimeSummary summary, int available, Integer travelLimit) {
        return summary.totalMinutes() <= available
                && (travelLimit == null || summary.travelMinutes() <= travelLimit);
    }

    public static void enforce(TripTimeSummary summary, int available, Integer travelLimit) {
        if (!fits(summary, available, travelLimit))
            throw new CustomException(PlanPlaceErrorCode.TRIP_TIME_EXCEEDED);
    }

    private static void invalid() { throw new CustomException(GlobalErrorCode.INVALID_INPUT_VALUE); }
}
