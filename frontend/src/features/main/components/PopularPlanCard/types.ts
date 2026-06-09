import type { PopularPlan } from '../../types';

export interface PopularPlanCardProps {
  plan: PopularPlan;
  onClick?: () => void;
}
