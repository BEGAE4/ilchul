import type { PopularPlace } from '../../types';

export interface PopularPlaceCardProps {
  place: PopularPlace;
  onClick?: () => void;
}
