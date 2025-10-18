// src/app/pages/apps/invoices/invoice.model.ts

export interface InvoiceDto {
  invoiceId: number;
  subscriptionId: number;
  invoiceNumber: string;
  currencyCode: string;
  amountSubtotal: number;
  discountAmount: number;
  taxAmount: number;
  amountTotal: number;
  invoiceStatusid: number;
  issueDateUtc: string;
  dueDateUtc?: string | null;
  paidAtUtc?: string | null;
  
  // للعرض فقط
  statusName?: string;
  statusColor?: string;
  state?: boolean; // للـ checkbox
}

export interface PayInvoiceRequest {
  paymentMethodId: number;
  paidAtUtc?: string | null;
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export enum InvoiceStatus {
  Pending = 1,
  Paid = 2,
  Cancelled = 3
}

