// src/app/pages/apps/invoices/invoices-admin.component.ts

import { Component, OnInit, ViewChild } from '@angular/core';
import { InvoiceDto } from './invoice.model';
import { InvoiceService } from '../../services/invoice.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-invoices-admin',
  templateUrl: './invoices-admin.component.html',
  styleUrls: ['./invoices-admin.component.scss']
})
export class InvoicesAdminComponent implements OnInit {

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

  masterSelected = false;
  checkedValGet: number[] = [];

  @ViewChild('payModal', { static: false }) payModal?: any;
  selectedInvoice?: InvoiceDto;
  paymentMethodId = 1;

  constructor(
    private invoiceService: InvoiceService
  ) {}

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'الإدارة' },
      { label: 'الفواتير', active: true }
    ];
    
    this.loadAllInvoices();
  }

  loadAllInvoices() {
    this.loading = true;
    
    // استخدام endpoint الأدمن الجديد
    this.invoiceService.adminGetAll().subscribe({
      next: (result) => {
        this.invoicesData = result.items;
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

  // Checkbox
  checkUncheckAll(ev: any) {
    this.paginatedData.forEach(x => x.state = ev.target.checked);
    this.syncChecked();
  }

  syncChecked() {
    const checked: number[] = [];
    this.paginatedData.forEach(x => { if (x.state) checked.push(x.invoiceId); });
    this.checkedValGet = checked;
    this.masterSelected = this.paginatedData.length > 0 && this.paginatedData.every(x => !!x.state);
  }

  trackById(index: number, item: InvoiceDto) {
    return item.invoiceId;
  }

  // فتح modal للدفع
  openPayModal(invoice: InvoiceDto) {
    this.selectedInvoice = invoice;
    this.paymentMethodId = 1;
    this.showPayModal();
  }

  showPayModal() {
    if (this.payModal) {
      this.payModal.nativeElement.classList.add('show');
      this.payModal.nativeElement.style.display = 'block';
      document.body.classList.add('modal-open');
    }
  }

  closePayModal() {
    if (this.payModal) {
      this.payModal.nativeElement.classList.remove('show');
      this.payModal.nativeElement.style.display = 'none';
      document.body.classList.remove('modal-open');
    }
  }

  // تأكيد الدفع
  confirmPay() {
    if (!this.selectedInvoice) return;

    this.invoiceService.pay(this.selectedInvoice.invoiceId, {
      paymentMethodId: this.paymentMethodId,
      paidAtUtc: new Date().toISOString()
    }).subscribe({
      next: () => {
        Swal.fire({
          title: 'نجح!',
          text: 'تم تسجيل الدفع بنجاح',
          icon: 'success',
          confirmButtonColor: 'rgb(3,142,220)'
        });
        this.closePayModal();
        this.loadAllInvoices();
      },
      error: (err) => {
        console.error('Error paying invoice:', err);
        Swal.fire({
          title: 'خطأ',
          text: 'حدث خطأ أثناء تسجيل الدفع',
          icon: 'error',
          confirmButtonColor: 'rgb(3,142,220)'
        });
      }
    });
  }

  // إلغاء فاتورة
  cancelInvoice(invoiceId: number) {
    Swal.fire({
      title: 'هل أنت متأكد؟',
      text: 'سيتم إلغاء هذه الفاتورة',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'نعم، إلغاء',
      cancelButtonText: 'تراجع'
    }).then((result) => {
      if (result.isConfirmed) {
        this.invoiceService.cancel(invoiceId).subscribe({
          next: () => {
            Swal.fire({
              title: 'تم الإلغاء',
              text: 'تم إلغاء الفاتورة بنجاح',
              icon: 'success',
              confirmButtonColor: 'rgb(3,142,220)'
            });
            this.loadAllInvoices();
          },
          error: (err) => {
            console.error('Error cancelling invoice:', err);
            Swal.fire({
              title: 'خطأ',
              text: 'حدث خطأ أثناء إلغاء الفاتورة',
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

  // تنسيق المبلغ
  formatAmount(amount: number): string {
    return amount.toFixed(2);
  }
}

