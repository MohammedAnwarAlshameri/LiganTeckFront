// src/app/pages/services/subscription.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SubscriptionApiItem, SubscriptionRow, PagedResult, CreateSubscriptionRequest } from 'src/app/pages/apps/subscription/subscription.model';

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private http = inject(HttpClient);
  private base = environment.apiBaseUrl; // مثال: http://localhost:7066/api

  /**
   * استرجاع الاشتراكات حسب المستأجر:
   * GET /api/subscriptions/by-tenant/{tenantId}
   */
  getByTenant(tenantId: number): Observable<SubscriptionApiItem[]> {
    return this.http.get<SubscriptionApiItem[]>(`${this.base}/subscriptions/by-tenant/${tenantId}`);
  }

  /**
   * إنشاء اشتراك جديد:
   * POST /api/subscriptions
   */
  create(request: CreateSubscriptionRequest): Observable<SubscriptionApiItem> {
    return this.http.post<SubscriptionApiItem>(`${this.base}/subscriptions`, request);
  }

  /**
   * تجديد اشتراك:
   * POST /api/subscriptions/{id}/renew
   */
  renew(id: number): Observable<any> {
    return this.http.post(`${this.base}/subscriptions/${id}/renew`, {});
  }

  // تحويل عنصر API إلى صيغة الجدول الحالية
  apiToRow(api: SubscriptionApiItem, tenantName: string = 'Unknown Tenant', planName: string = 'Unknown Plan'): SubscriptionRow {
    const startDate = api.startDateUtc ? new Date(api.startDateUtc) : null;
    const endDate = api.endDateUtc ? new Date(api.endDateUtc) : null;
    
    const startDateStr = startDate
      ? startDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : '';
    
    const endDateStr = endDate
      ? endDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : '';

    const status = this.getStatusName(api.subStatusid);
    const statusColor = this.getStatusColor(api.subStatusid);

    const amount = api.invoice?.amountTotal || 0;
    const currency = api.invoice?.currencyCode || 'SAR';

    return {
      id: api.subscriptionId,
      tenant_name: tenantName,
      plan_name: planName,
      months_count: api.monthsCount,
      auto_renew: api.autoRenew,
      status: status,
      status_color: statusColor,
      start_date: startDateStr,
      end_date: endDateStr,
      amount: amount,
      currency: currency,
      state: false
    };
  }

  private getStatusName(statusId: number): string {
    switch (statusId) {
      case 1: return 'Active';
      case 2: return 'Expired';
      case 3: return 'Cancelled';
      case 4: return 'Suspended';
      default: return 'Unknown';
    }
  }

  private getStatusColor(statusId: number): string {
    switch (statusId) {
      case 1: return 'success';    // Active
      case 2: return 'danger';     // Expired
      case 3: return 'secondary';  // Cancelled
      case 4: return 'warning';    // Suspended
      default: return 'secondary';
    }
  }
}
