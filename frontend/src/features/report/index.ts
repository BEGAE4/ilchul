// 외부 노출 barrel. named exports only — default export 금지.
// PR-3(components) 항목은 해당 PR 머지 시 추가 예정.

export type {
  ReportTargetType,
  ReportReasonCode,
  ReportTarget,
  ReportPayload,
  ReportStatus,
  ReportResponse,
  CurrentUser,
} from './types';

export { REASON_LABELS } from './types';

export {
  REASONS_BY_TARGET,
  add,
  remove,
  has,
  markReported,
  getAll,
  clear,
  buildIdempotencyKey,
} from './utils';

// hooks (PR-2)
export { useReport, useReportEligibility, isSelfReport } from './hooks';

// api (PR-2)
export { submitReport } from './api';
