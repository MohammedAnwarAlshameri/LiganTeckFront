// src/app/pages/services/invoice.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { InvoiceDto, PayInvoiceRequest, InvoiceStatus, PagedResult } from '../apps/invoices/invoice.model';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private apiUrl = `${environment.apiBaseUrl}/invoices`;

  constructor(private http: HttpClient) {}

  // الحصول على فاتورة واحدة
  getById(invoiceId: number): Observable<InvoiceDto> {
    return this.http.get<InvoiceDto>(`${this.apiUrl}/${invoiceId}`).pipe(
      map(invoice => this.mapInvoiceStatus(invoice))
    );
  }

  // الحصول على جميع فواتير tenant
  getByTenant(tenantId: number): Observable<InvoiceDto[]> {
    return this.http.get<InvoiceDto[]>(`${this.apiUrl}/by-tenant/${tenantId}`).pipe(
      map(invoices => invoices.map(inv => this.mapInvoiceStatus(inv)))
    );
  }

  // الحصول على فواتير اشتراك معين
  getBySubscription(subscriptionId: number): Observable<InvoiceDto[]> {
    return this.http.get<InvoiceDto[]>(`${this.apiUrl}/by-sub/${subscriptionId}`).pipe(
      map(invoices => invoices.map(inv => this.mapInvoiceStatus(inv)))
    );
  }

  // ========== للأدمن ==========
  
  // الحصول على جميع الفواتير (للأدمن)
  adminGetAll(): Observable<PagedResult<InvoiceDto>> {
    return this.http.get<PagedResult<InvoiceDto>>(`${this.apiUrl}/admin/all`).pipe(
      map(result => ({
        ...result,
        items: result.items.map(inv => this.mapInvoiceStatus(inv))
      }))
    );
  }

  // البحث المتقدم (للأدمن)
  adminSearch(
    tenantId?: number | null,
    subscriptionId?: number | null,
    statusId?: number | null,
    fromUtc?: string | null,
    toUtc?: string | null,
    page: number = 1,
    pageSize: number = 20
  ): Observable<PagedResult<InvoiceDto>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (tenantId) params = params.set('tenantId', tenantId.toString());
    if (subscriptionId) params = params.set('subscriptionId', subscriptionId.toString());
    if (statusId) params = params.set('statusId', statusId.toString());
    if (fromUtc) params = params.set('fromUtc', fromUtc);
    if (toUtc) params = params.set('toUtc', toUtc);

    return this.http.get<PagedResult<InvoiceDto>>(`${this.apiUrl}/admin/search`, { params }).pipe(
      map(result => ({
        ...result,
        items: result.items.map(inv => this.mapInvoiceStatus(inv))
      }))
    );
  }

  // دفع فاتورة
  pay(invoiceId: number, request: PayInvoiceRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/${invoiceId}/pay`, request);
  }

  // إلغاء فاتورة
  cancel(invoiceId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${invoiceId}/cancel`, {});
  }

  // Helper لتحويل status id إلى اسم ولون
  private mapInvoiceStatus(invoice: InvoiceDto): InvoiceDto {
    switch (invoice.invoiceStatusid) {
      case InvoiceStatus.Pending:
        invoice.statusName = 'قيد الانتظار';
        invoice.statusColor = 'warning';
        break;
      case InvoiceStatus.Paid:
        invoice.statusName = 'مدفوعة';
        invoice.statusColor = 'success';
        break;
      case InvoiceStatus.Cancelled:
        invoice.statusName = 'ملغاة';
        invoice.statusColor = 'danger';
        break;
      default:
        invoice.statusName = 'غير معروف';
        invoice.statusColor = 'secondary';
    }
    return invoice;
  }
}

