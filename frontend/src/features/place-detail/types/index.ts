export interface PlaceDetail {
  id: string;
  name: string;
  images: string[];
  location: {
    address: string;
    city: string;
    district: string;
    category: string;
  };
  description: string;
  travelTime?: string;
  operatingHours: {
    [key: string]: string; // 예: 'monday': '오전 8:30 ~ 오후 10:00'
  };
  phone: string;
  hashtags: string[];
  bookmarkCount: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export type PlaceDetailTab = 'dailylog' | 'info' | 'nearby' | 'curation';

export interface PlaceDetailPageProps {
  placeId: string;
}
