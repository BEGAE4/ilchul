import { estimateLegMinutes, estimateRoundTripMinutes } from './travelEstimate';

const start = { lat: 37.5, lng: 127 };
const stop = { lat: 37.5, lng: 127.004 };

it('한 장소도 출발 이동과 귀환을 모두 합한다', () => {
  expect(estimateRoundTripMinutes(start, [stop], '도보')).toBe(2 * estimateLegMinutes(start, stop, '도보'));
});

it('같은 좌표의 이동은 0분이며 걷기와 교통수단 추정은 구분한다', () => {
  expect(estimateRoundTripMinutes(start, [start], '도보')).toBe(0);
  expect(estimateLegMinutes(start, { lat: 37.55, lng: 127.05 }, '도보')).toBeGreaterThan(
    estimateLegMinutes(start, { lat: 37.55, lng: 127.05 }, '대중교통'));
});
