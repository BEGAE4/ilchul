// reporterId + target.type + target.id + reasonCode + 마운트당 UUID (Critic C-2)
// — 분 단위 윈도우 폐기. 정상 재시도가 분 경계를 넘어도 동일 키 유지.
export function buildIdempotencyKey(input: {
  reporterId: string;
  attemptId: string;
  target: { type: string; id: string };
  reasonCode: string;
}): string {
  return [
    input.reporterId,
    input.target.type,
    input.target.id,
    input.reasonCode,
    input.attemptId,
  ].join(':');
}
