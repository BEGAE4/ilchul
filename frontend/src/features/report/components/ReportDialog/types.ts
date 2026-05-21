import type { ReportReasonCode, ReportResponse, ReportTarget } from '../../types';

export interface ReportDialogProps {
  isOpen: boolean;
  target: ReportTarget;
  isSubmitting?: boolean;
  triggerRef?: React.RefObject<HTMLElement | null>;
  onSubmit: (reasonCode: ReportReasonCode, detail?: string) => Promise<ReportResponse>;
  onClose: () => void;
  onSubmitted?: (response: ReportResponse, target: ReportTarget) => void;
  onHideContent?: (target: ReportTarget) => void;
}
