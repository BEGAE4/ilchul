import type { AdminReportListParams } from '../types';

export function reportFiltersToQuery(
  params: AdminReportListParams,
): Record<string, string> {
  const out: Record<string, string> = {};
  if (params.status && params.status !== 'all') out.status = params.status;
  if (params.targetType && params.targetType !== 'all') out.targetType = params.targetType;
  if (params.reasonCode && params.reasonCode !== 'all') out.reasonCode = params.reasonCode;
  if (params.q?.trim()) out.q = params.q.trim();
  if (params.page) out.page = String(params.page);
  if (params.size) out.size = String(params.size);
  if (params.sort) out.sort = params.sort;
  if (params.autoBlindedOnly) out.autoBlindedOnly = 'true';
  return out;
}
