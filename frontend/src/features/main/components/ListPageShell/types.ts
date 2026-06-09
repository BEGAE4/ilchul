import type { ReactNode } from 'react';
import type { InfiniteScrollSentinelRef } from '../../hooks/useInfiniteScroll';

export interface ListPageShellProps {
  title: string;
  totalCount: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasNext: boolean;
  error: Error | null;
  isEmpty: boolean;
  sentinelRef: InfiniteScrollSentinelRef;
  onRetry: () => void;
  children: ReactNode;
}
