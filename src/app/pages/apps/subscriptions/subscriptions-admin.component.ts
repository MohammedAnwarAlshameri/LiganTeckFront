// src/app/pages/apps/subscriptions/subscriptions-admin.component.ts

import { Component, OnInit } from '@angular/core';
import { SubscriptionListItemDto } from './subscription.model';
import { SubscriptionService } from '../../services/subscription.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-subscriptions-admin',
  templateUrl: './subscriptions-admin.component.html',
  styleUrls: ['./subscriptions-admin.component.scss']
})
export class SubscriptionsAdminComponent implements OnInit {

  // BreadCrumb
  breadCrumbItems!: Array<{}>;

  // البيانات
  subscriptionsData: SubscriptionListItemDto[] = [];
  filteredData: SubscriptionListItemDto[] = [];
  loading = false;

  // البحث والفلترة
  q = '';
  selectedStatus = 'all';

  // Pagination
  page = 1;
  pageSize = 10;
  total = 0;

  masterSelected = false;
  checkedValGet: number[] = [];

  constructor(
    private subscriptionService: SubscriptionService
  ) {}

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'الإدارة' },
      { label: 'الاشتراكات', active: true }
    ];
    
    this.loadAllSubscriptions();
  }

  loadAllSubscriptions() {
    this.loading = true;
    
    // استخدام endpoint الأدمن الجديد
    this.subscriptionService.adminGetAll().subscribe({
      next: (result) => {
        this.subscriptionsData = result.items;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading subscriptions:', err);
        this.loading = false;
        Swal.fire({
          title: 'خطأ',
          text: 'حدث خطأ أثناء تحميل الاشتراكات',
          icon: 'error',
          confirmButtonColor: 'rgb(3,142,220)'
        });
      }
    });
  }

  applyFilters() {
    let filtered = [...this.subscriptionsData];

    // فلترة حسب البحث
    if (this.q) {
      const search = this.q.toLowerCase();
      filtered = filtered.filter(sub =>
        sub.subscriptionId.toString().includes(search) ||
        sub.tenantId.toString().includes(search) ||
        sub.statusName?.toLowerCase().includes(search)
      );
    }

    // فلترة حسب الحالة
    if (this.selectedStatus !== 'all') {
      const statusId = parseInt(this.selectedStatus);
      filtered = filtered.filter(sub => sub.subStatusid === statusId);
    }

    this.filteredData = filtered;
    this.total = filtered.length;
  }

  doSearch() {
    this.page = 1;
    this.applyFilters();
  }

  onStatusFilterChange() {
    this.page = 1;
    this.applyFilters();
  }

  get paginatedData(): SubscriptionListItemDto[] {
    const start = (this.page - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredData.slice(start, end);
  }

  // Checkbox
  checkUncheckAll(ev: any) {
    this.paginatedData.forEach(x => x.state = ev.target.checked);
    this.syncChecked();
  }

  syncChecked() {
    const checked: number[] = [];
    this.paginatedData.forEach(x => { if (x.state) checked.push(x.subscriptionId); });
    this.checkedValGet = checked;
    this.masterSelected = this.paginatedData.length > 0 && this.paginatedData.every(x => !!x.state);
  }

  trackById(index: number, item: SubscriptionListItemDto) {
    return item.subscriptionId;
  }

  // تجديد اشتراك
  renewSubscription(subscriptionId: number) {
    Swal.fire({
      title: 'هل أنت متأكد؟',
      text: 'سيتم تجديد هذا الاشتراك',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'نعم، تجديد',
      cancelButtonText: 'تراجع'
    }).then((result) => {
      if (result.isConfirmed) {
        this.subscriptionService.renew(subscriptionId).subscribe({
          next: () => {
            Swal.fire({
              title: 'تم التجديد',
              text: 'تم تجديد الاشتراك بنجاح',
              icon: 'success',
              confirmButtonColor: 'rgb(3,142,220)'
            });
            this.loadAllSubscriptions();
          },
          error: (err) => {
            console.error('Error renewing subscription:', err);
            Swal.fire({
              title: 'خطأ',
              text: 'حدث خطأ أثناء تجديد الاشتراك',
              icon: 'error',
              confirmButtonColor: 'rgb(3,142,220)'
            });
          }
        });
      }
    });
  }

  // تنسيق التاريخ
  formatDate(date: string | null | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('ar-SA');
  }

  // حساب الأيام المتبقية
  getDaysRemaining(endDate: string | null | undefined): number {
    if (!endDate) return 0;
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  }
}

