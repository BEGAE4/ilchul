'use client';

import { useCallback, useState } from 'react';
import {
  createInquiryAnswer,
  deleteInquiryAnswer,
  updateInquiryAnswer,
} from '../api';
import type { AdminInquiryDetail } from '../types';

interface UseAnswerMutationsResult {
  isPending: boolean;
  create: (body: string, closeAfter: boolean) => Promise<AdminInquiryDetail>;
  update: (answerId: string, body: string) => Promise<AdminInquiryDetail>;
  remove: (answerId: string) => Promise<AdminInquiryDetail>;
}

export function useAnswerMutations(inquiryId: string): UseAnswerMutationsResult {
  const [isPending, setIsPending] = useState(false);

  const create = useCallback(
    async (body: string, closeAfter: boolean) => {
      setIsPending(true);
      try {
        return await createInquiryAnswer(inquiryId, { body, closeAfter });
      } finally {
        setIsPending(false);
      }
    },
    [inquiryId],
  );

  const update = useCallback(
    async (answerId: string, body: string) => {
      setIsPending(true);
      try {
        return await updateInquiryAnswer(inquiryId, answerId, { body });
      } finally {
        setIsPending(false);
      }
    },
    [inquiryId],
  );

  const remove = useCallback(
    async (answerId: string) => {
      setIsPending(true);
      try {
        return await deleteInquiryAnswer(inquiryId, answerId);
      } finally {
        setIsPending(false);
      }
    },
    [inquiryId],
  );

  return { isPending, create, update, remove };
}
