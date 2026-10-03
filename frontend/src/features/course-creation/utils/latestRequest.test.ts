import { LatestRequestGate } from './latestRequest';

it('이전 응답이 늦게 와도 현재 결과를 덮어쓰지 못한다', async () => {
  const gate = new LatestRequestGate();
  const first = gate.begin();
  const second = gate.begin();
  let displayed = '';
  await Promise.resolve().then(() => { if (second.isCurrent()) displayed = 'new'; });
  await Promise.resolve().then(() => { if (first.isCurrent()) displayed = 'old'; });
  expect(first.signal.aborted).toBe(true);
  expect(displayed).toBe('new');
  gate.cancel();
  expect(second.isCurrent()).toBe(false);
});
