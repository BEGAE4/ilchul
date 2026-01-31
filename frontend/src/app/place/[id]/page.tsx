'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { PlaceDetailPage } from '@/features/place-detail/components';

export default function PlacePage() {
  const params = useParams();
  const placeId = params.id as string;

  return <PlaceDetailPage placeId={placeId} />;
}
