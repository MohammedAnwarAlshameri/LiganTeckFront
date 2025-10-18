// src/app/pages/services/subscription.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { SubscriptionDto, CreateSubscriptionRequest, SubscriptionStatus, SubscriptionListItemDto, PagedResult } from '../apps/subscriptions/subscription.model';
import { SubscriptionRow } from '../apps/subscription/subscription.model';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private apiUrl = `${environment.apiBaseUrl}/subscriptions`;

  constructor(private http: HttpClient) {}

  // إنشاء اشتراك جديد
  create(request: CreateSubscriptionRequest): Observable<SubscriptionDto> {
    return this.http.post<SubscriptionDto>(this.apiUrl, request).pipe(
      map(sub => this.mapSubscriptionStatus(sub))
    );
  }

  // تجديد اشتراك
  renew(subscriptionId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${subscriptionId}/renew`, {});
  }

  // الحصول على اشتراكات tenant معين
  getByTenant(tenantId: number): Observable<SubscriptionDto[]> {
    return this.http.get<SubscriptionDto[]>(`${this.apiUrl}/by-tenant/${tenantId}`).pipe(
      map(subs => subs.map(sub => this.mapSubscriptionStatus(sub)))
    );
  }

  // ========== للأدمن ==========
  
  // الحصول على جميع الاشتراكات (للأدمن)
  adminGetAll(): Observable<PagedResult<SubscriptionListItemDto>> {
    return this.http.get<PagedResult<SubscriptionListItemDto>>(`${this.apiUrl}/admin/all`).pipe(
      map(result => ({
        ...result,
        items: result.items.map(sub => this.mapSubscriptionListItemStatus(sub))
      }))
    );
  }

  // البحث المتقدم (للأدمن)
  adminSearch(
    tenantId?: number | null,
    planId?: number | null,
    statusId?: number | null,
    fromUtc?: string | null,
    toUtc?: string | null,
    page: number = 1,
    pageSize: number = 20
  ): Observable<PagedResult<SubscriptionListItemDto>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (tenantId) params = params.set('tenantId', tenantId.toString());
    if (planId) params = params.set('planId', planId.toString());
    if (statusId) params = params.set('statusId', statusId.toString());
    if (fromUtc) params = params.set('fromUtc', fromUtc);
    if (toUtc) params = params.set('toUtc', toUtc);

    return this.http.get<PagedResult<SubscriptionListItemDto>>(`${this.apiUrl}/admin/search`, { params }).pipe(
      map(result => ({
        ...result,
        items: result.items.map(sub => this.mapSubscriptionListItemStatus(sub))
      }))
    );
  }

  // Helper لتحويل من DTO إلى Row للعرض في الجدول القديم
  apiToRow(dto: SubscriptionDto, tenantName: string, planName: string): SubscriptionRow {
    return {
      id: dto.subscriptionId,
      tenant_name: tenantName,
      plan_name: planName,
      months_count: dto.monthsCount,
      auto_renew: dto.autoRenew,
      status: dto.statusName || this.getStatusName(dto.subStatusid),
      status_color: dto.statusColor || this.getStatusColor(dto.subStatusid),
      start_date: new Date(dto.startDateUtc).toLocaleDateString('ar-SA'),
      end_date: dto.endDateUtc ? new Date(dto.endDateUtc).toLocaleDateString('ar-SA') : '-',
      amount: dto.invoice?.amountTotal || 0,
      currency: dto.invoice?.currencyCode || 'SAR',
      state: false
    };
  }

  // Helper لتحويل status id إلى اسم ولون
  private mapSubscriptionStatus(subscription: SubscriptionDto): SubscriptionDto {
    switch (subscription.subStatusid) {
      case SubscriptionStatus.Active:
        subscription.statusName = 'نشط';
        subscription.statusColor = 'success';
        break;
      case SubscriptionStatus.Expired:
        subscription.statusName = 'منتهي';
        subscription.statusColor = 'danger';
        break;
      case SubscriptionStatus.Cancelled:
        subscription.statusName = 'ملغى';
        subscription.statusColor = 'secondary';
        break;
      default:
        subscription.statusName = 'غير معروف';
        subscription.statusColor = 'secondary';
    }
    return subscription;
  }

  private getStatusName(statusId: number): string {
    switch (statusId) {
      case SubscriptionStatus.Active: return 'نشط';
      case SubscriptionStatus.Expired: return 'منتهي';
      case SubscriptionStatus.Cancelled: return 'ملغى';
      default: return 'غير معروف';
    }
  }

  private getStatusColor(statusId: number): string {
    switch (statusId) {
      case SubscriptionStatus.Active: return 'success';
      case SubscriptionStatus.Expired: return 'danger';
      case SubscriptionStatus.Cancelled: return 'secondary';
      default: return 'secondary';
    }
  }

  private mapSubscriptionListItemStatus(subscription: SubscriptionListItemDto): SubscriptionListItemDto {
    switch (subscription.subStatusid) {
      case SubscriptionStatus.Active:
        subscription.statusName = 'نشط';
        subscription.statusColor = 'success';
        break;
      case SubscriptionStatus.Expired:
        subscription.statusName = 'منتهي';
        subscription.statusColor = 'danger';
        break;
      case SubscriptionStatus.Cancelled:
        subscription.statusName = 'ملغى';
        subscription.statusColor = 'secondary';
        break;
      default:
        subscription.statusName = 'غير معروف';
        subscription.statusColor = 'secondary';
    }
    return subscription;
  }
}
