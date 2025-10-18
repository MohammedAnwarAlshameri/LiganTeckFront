// src/app/pages/apps/invoices/my-invoices.component.ts

import { Component, OnInit } from '@angular/core';
import { InvoiceDto } from './invoice.model';
import { InvoiceService } from '../../services/invoice.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-my-invoices',
  templateUrl: './my-invoices.component.html',
  styleUrls: ['./my-invoices.component.scss']
})
export class MyInvoicesComponent implements OnInit {

  // BreadCrumb
  breadCrumbItems!: Array<{}>;

  // البيانات
  invoicesData: InvoiceDto[] = [];
  filteredData: InvoiceDto[] = [];
  loading = false;

  // البحث والفلترة
  q = '';
  selectedStatus = 'all';

  // Pagination
  page = 1;
  pageSize = 10;
  total = 0;

  // TODO: احصل على tenantId من المستخدم المسجل دخوله
  currentTenantId = 1; // مؤقتاً - يجب الحصول عليه من الـ auth service

  constructor(
    private invoiceService: InvoiceService
  ) {}

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'الحساب' },
      { label: 'فواتيري', active: true }
    ];
    
    this.loadMyInvoices();
  }

  loadMyInvoices() {
    this.loading = true;
    
    this.invoiceService.getByTenant(this.currentTenantId).subscribe({
      next: (invoices) => {
        this.invoicesData = invoices;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading invoices:', err);
        this.loading = false;
        Swal.fire({
          title: 'خطأ',
          text: 'حدث خطأ أثناء تحميل الفواتير',
          icon: 'error',
          confirmButtonColor: 'rgb(3,142,220)'
        });
      }
    });
  }

  applyFilters() {
    let filtered = [...this.invoicesData];

    // فلترة حسب البحث
    if (this.q) {
      const search = this.q.toLowerCase();
      filtered = filtered.filter(inv =>
        inv.invoiceNumber.toLowerCase().includes(search) ||
        inv.statusName?.toLowerCase().includes(search)
      );
    }

    // فلترة حسب الحالة
    if (this.selectedStatus !== 'all') {
      const statusId = parseInt(this.selectedStatus);
      filtered = filtered.filter(inv => inv.invoiceStatusid === statusId);
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

  get paginatedData(): InvoiceDto[] {
    const start = (this.page - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredData.slice(start, end);
  }

  trackById(index: number, item: InvoiceDto) {
    return item.invoiceId;
  }

  // تنسيق التاريخ
  formatDate(date: string | null | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('ar-SA');
  }

  // تنسيق المبلغ
  formatAmount(amount: number): string {
    return amount.toFixed(2);
  }

  // طباعة الفاتورة
  printInvoice(invoice: InvoiceDto) {
    // TODO: تنفيذ الطباعة أو تحميل PDF
    Swal.fire({
      title: 'طباعة الفاتورة',
      text: 'سيتم تنفيذ طباعة الفاتورة رقم: ' + invoice.invoiceNumber,
      icon: 'info',
      confirmButtonColor: 'rgb(3,142,220)'
    });
  }
}

