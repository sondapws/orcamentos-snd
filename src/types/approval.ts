// Tipos compartilhados para o sistema de aprovação

export interface PendingQuote {
  id: string;
  form_data: any;
  product_type: 'comply_edocs' | 'comply_fiscal';
  submitted_at: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by?: string | null;
  approved_at?: string | null;
  rejected_by?: string | null;
  rejected_at?: string | null;
  rejection_reason?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ApprovalNotification {
  id: string;
  type: 'new_quote_pending' | 'quote_approved' | 'quote_rejected';
  message: string;
  quote_id: string;
  read: boolean;
  created_at: string;
}

export interface ApprovalSettings {
  id: string;
  email_notifications: boolean;
  approver_email: string;
  auto_approval_domains: string[];
  created_at?: string;
  updated_at?: string;
}

export interface PaginationResult<T> {
  data: T[];
  total: number;
  hasMore: boolean;
}

export interface NotificationsPaginationResult {
  notifications: ApprovalNotification[];
  total: number;
  hasMore: boolean;
}

export interface ApprovalHistoryResult {
  quotes: PendingQuote[];
  total: number;
  hasMore: boolean;
}