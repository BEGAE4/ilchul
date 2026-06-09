import type { CurrentUser, ReportTarget } from '../../types';

export interface ReportMenuItemProps {
  target: ReportTarget;
  currentUser: CurrentUser;
  onSelect: () => void;
}
