'use client';

import { useCallback, useState } from 'react';
import { issueSanction as issueSanctionApi } from '../api';
import type {
  IssueSanctionPayload,
  IssueSanctionResponse,
} from '../types';

export function useIssueSanction() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const issue = useCallback(
    async (payload: IssueSanctionPayload): Promise<IssueSanctionResponse> => {
      setIsSubmitting(true);
      try {
        return await issueSanctionApi(payload);
      } finally {
        setIsSubmitting(false);
      }
    },
    [],
  );

  return { issue, isSubmitting };
}
