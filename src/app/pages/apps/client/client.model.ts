// src/app/pages/apps/client/client.model.ts

// كما يرجعها الـ API من الباك-إند
export interface ClientApiItem {
  tenantId: number;
  tenantName: string;
  username: string;
  tenantEmail: string;
  phoneNumber: string;
  createdOn?: string | null;
  tenantStatusName: string;
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// نموذج العرض المتوافق مع جدولك الحالي
export interface ClientRow {
  id: number;                // tenantId
  customer_name: string;     // tenantName
  username: string;          // username
  email: string;             // tenantEmail
  phone: string;             // phoneNumber
  date: string;              // createdOn -> عرض فقط
  status: string;            // tenantStatusName (Active/...)
  status_color: string;      // CSS helper
  state?: boolean;           // للـ checkbox
}
