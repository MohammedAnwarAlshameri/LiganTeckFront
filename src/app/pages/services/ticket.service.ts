// src/app/pages/services/ticket.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  TicketDto,
  TicketRow, 
  TicketCreateRequest, 
  AddChatRequest,
  UpdateStatusRequest,
  UpdatePriorityRequest,
  BulkUpdateStatusRequest,
  TicketChatApiItem,
  TicketChatRow,
  PagedResult
} from '../apps/ticket/ticket.model';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private base = `${environment.apiBaseUrl}/tickets`;

  constructor(private http: HttpClient) {}

  // إنشاء تذكرة جديدة
  create(request: TicketCreateRequest): Observable<{ ticketId: number }> {
    return this.http.post<{ ticketId: number }>(`${this.base}`, request);
  }

  // جلب تذاكر المستخدم
  getUserTickets(tenantId: number): Observable<TicketDto[]> {
    return this.http.get<TicketDto[]>(`${this.base}/user/${tenantId}`);
  }

  // جلب جميع التذاكر (للإدارة) مع فلاتر وصفحات
  getAllTickets(
    q?: string,
    tenantId?: string,
    statusId?: number,
    priority?: string,
    page: number = 1,
    pageSize: number = 10
  ): Observable<PagedResult<TicketDto>> {
    let params: any = { page, pageSize };
    if (q) params.q = q;
    if (tenantId) params.tenantId = tenantId;
    if (statusId) params.statusId = statusId;
    if (priority) params.priority = priority;

    return this.http.get<PagedResult<TicketDto>>(`${this.base}/admin/all`, { params });
  }

  // جلب محادثات التذكرة
  getChats(ticketId: number): Observable<TicketChatApiItem[]> {
    return this.http.get<TicketChatApiItem[]>(`${this.base}/${ticketId}/chat`);
  }

  // إضافة محادثة جديدة (موحدة للعميل والإدارة)
  addChat(ticketId: number, request: AddChatRequest): Observable<any> {
    return this.http.post(`${this.base}/${ticketId}/chat`, request);
  }

  // تحديث حالة التذكرة
  updateStatus(ticketId: number, request: UpdateStatusRequest): Observable<any> {
    return this.http.put(`${this.base}/${ticketId}/status`, request);
  }

  // تحديث أولوية التذكرة
  updatePriority(ticketId: number, request: UpdatePriorityRequest): Observable<any> {
    return this.http.put(`${this.base}/${ticketId}/priority`, request);
  }

  // تحديث جماعي للحالة
  bulkUpdateStatus(request: BulkUpdateStatusRequest): Observable<any> {
    return this.http.put(`${this.base}/bulk/status`, request);
  }

  // تحويل TicketDto إلى TicketRow
  dtoToRow(dto: TicketDto, bodyText?: string): TicketRow {
    return {
      id: dto.ticketId,
      subject: dto.subjectLine,
      priority: this.getPriorityName(dto.priorityLevel),
      priority_color: this.getPriorityColor(dto.priorityLevel),
      status: dto.ticketStatusName || this.getStatusName(dto.ticketStatusId),
      status_color: this.getStatusColor(dto.ticketStatusId),
      created_date: dto.createdOn ? new Date(dto.createdOn).toLocaleString('ar-SA', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) : '',
      tenant_id: dto.tenantId,
      tenant_name: dto.tenantName,
      tenant_email: dto.tenantEmail,
      chats_count: dto.chatsCount,
      state: false,
      bodyText: bodyText,
      attachmentPath: dto.attachmentPath
    };
  }

  // تحويل محادثة API إلى صيغة العرض
  chatApiToRow(api: TicketChatApiItem): TicketChatRow {
    const isAdmin = !!(api.adminText && api.adminText.trim().length > 0);
    const message = isAdmin ? api.adminText : api.tenantText;
    const timestamp = isAdmin 
      ? new Date(api.adminTextAtUtc) 
      : new Date(api.tenantTextAtUtc);

    return {
      id: api.chatId,
      isAdmin: isAdmin,
      message: message,
      timestamp: timestamp.toLocaleString('ar-SA', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      chatLevel: api.chatLevel
    };
  }

  private getPriorityName(priority: string): string {
    switch (priority.toLowerCase()) {
      case 'low': return 'منخفضة';
      case 'medium': return 'متوسطة';
      case 'high': return 'عالية';
      case 'urgent': return 'عاجلة';
      default: return priority;
    }
  }

  private getPriorityColor(priority: string): string {
    switch (priority.toLowerCase()) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'danger';
      case 'urgent': return 'danger';
      default: return 'secondary';
    }
  }

  private getStatusName(statusId: number): string {
    switch (statusId) {
      case 1: return 'مفتوحة';
      case 2: return 'قيد المعالجة';
      case 3: return 'بانتظار العميل';
      case 4: return 'مغلقة';
      default: return 'غير معروف';
    }
  }

  private getStatusColor(statusId: number): string {
    switch (statusId) {
      case 1: return 'info';
      case 2: return 'warning';
      case 3: return 'purple';
      case 4: return 'success';
      default: return 'secondary';
    }
  }

  // دوال مساعدة للتوافق مع الكود القديم
  getByTenant(tenantId: number): Observable<TicketDto[]> {
    return this.getUserTickets(tenantId);
  }

  apiToRow(item: any, lastReply?: string): TicketRow {
    return this.dtoToRow(item, lastReply);
  }
}
