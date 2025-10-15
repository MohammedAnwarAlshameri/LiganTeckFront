// src/app/pages/services/client.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ClientApiItem, ClientRow, PagedResult } from 'src/app/pages/apps/client/client.model';

@Injectable({ providedIn: 'root' })
export class ClientService {
  private http = inject(HttpClient);
  private base = environment.apiBaseUrl; // مثال: http://localhost:7066/api

  /**
   * استرجاع العملاء مع بحث وتقسيم صفحات من API:
   * GET /api/admin/tenants/search?q=&page=&pageSize=
   */
  search(q = '', page = 1, pageSize = 10): Observable<PagedResult<ClientRow>> {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (q) params = params.set('q', q);

    return this.http
      .get<PagedResult<ClientApiItem>>(`${this.base}/admin/tenants/search`, { params })
      .pipe(map(res => ({
        page: res.page,
        pageSize: res.pageSize,
        total: res.total,
        items: res.items.map(this.apiToRow)
      })));
  }

  /** حذف (سوفت ديليت) - إن كان لديك Endpoint */
  delete(id: number) {
    return this.http.delete(`${this.base}/admin/tenants/${id}`);
  }

  // تحويل عنصر API إلى صيغة الجدول الحالية
  private apiToRow(api: ClientApiItem): ClientRow {
    const created = api.createdOn ? new Date(api.createdOn) : null;
    const dateStr = created
      ? created.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : '';

    const status = api.tenantStatusName || 'Unknown';
    const statusColor =
      status.toLowerCase().includes('active') ? 'success' :
      status.toLowerCase().includes('block')  ? 'danger'  :
      status.toLowerCase().includes('trial')  ? 'info'    :
      'secondary';

    return {
      id: api.tenantId,
      customer_name: api.tenantName,
      username: api.username,
      email: api.tenantEmail,
      phone: api.phoneNumber,
      date: dateStr,
      status: status,
      status_color: statusColor,
      state: false
    };
  }
}
