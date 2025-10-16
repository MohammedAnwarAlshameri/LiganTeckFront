// src/app/pages/apps/subscription/subscription.model.ts

// كما يرجعها الـ API من الباك-إند
export interface SubscriptionApiItem {
  subscriptionId: number;
  tenantId: number;
  planId: number;
  monthsCount: number;
  autoRenew: boolean;
  subStatusid: number;
  startDateUtc: string;
  endDateUtc?: string;
  couponId?: number;
  invoice?: InvoiceDto;
}

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
  dueDateUtc: string;
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// نموذج العرض المتوافق مع جدولك الحالي
export interface SubscriptionRow {
  id: number;                    // subscriptionId
  tenant_name: string;           // اسم المستأجر
  plan_name: string;             // اسم الخطة
  months_count: number;          // عدد الأشهر
  auto_renew: boolean;           // التجديد التلقائي
  status: string;                // حالة الاشتراك
  status_color: string;          // لون الحالة
  start_date: string;            // تاريخ البداية
  end_date: string;              // تاريخ النهاية
  amount: number;                // المبلغ
  currency: string;              // العملة
  state?: boolean;               // للـ checkbox
}

// نموذج إنشاء اشتراك جديد
export interface CreateSubscriptionRequest {
  tenantId: number;
  planId: number;
  monthsCount: number;
  autoRenew: boolean;
  couponCode?: string;
}
