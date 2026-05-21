import type { AdminInquiryListParams } from '../types';

export function inquiryFiltersToQuery(
  params: AdminInquiryListParams,
): Record<string, string> {
  const out: Record<string, string> = {};
  if (params.status && params.status !== 'all') out.status = params.status;
  if (params.category && params.category !== 'all') out.category = params.category;
  if (params.q?.trim()) out.q = params.q.trim();
  if (params.page) out.page = String(params.page);
  if (params.size) out.size = String(params.size);
  if (params.sort) out.sort = params.sort;
  return out;
}
