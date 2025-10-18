// src/app/pages/apps/subscriptions/subscription.model.ts

import { InvoiceDto } from '../invoices/invoice.model';

export interface SubscriptionDto {
  subscriptionId: number;
  tenantId: number;
  planId: number;
  monthsCount: number;
  autoRenew: boolean;
  subStatusid: number;
  startDateUtc: string;
  endDateUtc?: string | null;
  couponId?: number | null;
  invoice?: InvoiceDto | null;
  
  // للعرض فقط
  tenantName?: string;
  planName?: string;
  statusName?: string;
  statusColor?: string;
  state?: boolean; // للـ checkbox
}

export interface SubscriptionListItemDto {
  subscriptionId: number;
  tenantId: number;
  tenantName?: string;
  planId: number;
  planName?: string;
  monthsCount: number;
  autoRenew: boolean;
  subStatusid: number;
  startDateUtc: string;
  endDateUtc?: string | null;
  couponId?: number | null;
  
  // للعرض فقط
  statusName?: string;
  statusColor?: string;
  state?: boolean;
}

export interface CreateSubscriptionRequest {
  tenantId: number;
  planId: number;
  monthsCount: number;
  autoRenew: boolean;
  couponCode?: string | null;
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export enum SubscriptionStatus {
  Active = 1,
  Expired = 2,
  Cancelled = 3
}

