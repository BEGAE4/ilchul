'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { PlaceDetailPage } from '@/features/place-detail/components';
import PageLayout from '@/shared/ui/PageLayout';

export default function PlacePage() {
  const params = useParams();
  const placeId = params.id as string;

  return (
    <PageLayout>
      <PlaceDetailPage placeId={placeId} />
    </PageLayout>
  );
}
