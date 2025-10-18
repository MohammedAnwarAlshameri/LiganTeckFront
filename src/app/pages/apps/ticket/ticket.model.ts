// src/app/pages/apps/ticket/ticket.model.ts

// كما يرجعها الـ API من الباك-إند (TicketDto)
export interface TicketDto {
  ticketId: number;
  tenantId: number;
  tenantName: string;
  tenantEmail: string;
  subjectLine: string;
  priorityLevel: string;
  ticketStatusId: number;
  ticketStatusName: string;
  createdOn: string;
  modifiedOn?: string;
  chatsCount: number;
  attachmentPath?: string;
}

// محادثة من API
export interface TicketChatApiItem {
  chatId: number;
  ticketId: number;
  tenantId: number;
  tenantText: string;
  adminText: string;
  tenantTextAtUtc: string;
  adminTextAtUtc: string;
  chatLevel: number;
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// نموذج العرض في الجدول
export interface TicketRow {
  id: number;
  subject: string;
  priority: string;
  priority_color: string;
  status: string;
  status_color: string;
  created_date: string;
  tenant_id: number;
  tenant_name: string;
  tenant_email: string;
  chats_count: number;
  state?: boolean; // للـ checkbox
  bodyText?: string; // إضافة النص الكامل
  attachmentPath?: string; // إضافة مسار المرفق
}

// نموذج إنشاء تذكرة جديدة
export interface TicketCreateRequest {
  tenantId: number;
  subjectLine: string;
  priorityLevel: string;
  attachmentPath?: string;
  bodyText: string;
}

// نموذج إضافة محادثة (موحد للعميل والإدارة)
export interface AddChatRequest {
  tenantId: number;
  message: string;
  isAdmin: boolean;
}

// نموذج تحديث الحالة
export interface UpdateStatusRequest {
  statusId: number;
}

// نموذج تحديث الأولوية
export interface UpdatePriorityRequest {
  priority: string;
}

// نموذج التحديث الجماعي
export interface BulkUpdateStatusRequest {
  ticketIds: number[];
  statusId: number;
}

// نموذج عرض التذكرة مع المحادثة
export interface TicketDetail {
  ticket: TicketRow;
  chats: TicketChatRow[];
}

// نموذج رسالة في المحادثة
export interface TicketChatRow {
  id: number;
  isAdmin: boolean;
  message: string;
  timestamp: string;
  chatLevel: number;
}
