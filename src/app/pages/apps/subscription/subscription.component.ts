// src/app/pages/apps/subscription/subscription.component.ts
import { DecimalPipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import Swal from 'sweetalert2';
import { SubscriptionRow } from 'src/app/pages/apps/subscription/subscription.model';
import { SubscriptionService } from 'src/app/pages/services/subscription.service';

@Component({
  selector: 'app-subscription',
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.scss'],
  providers: [DecimalPipe]
})
export class SubscriptionComponent implements OnInit {

  // BreadCrumb
  breadCrumbItems!: Array<{}>;

  // البحث والتقسيم
  q = '';
  page = 1;
  pageSize = 8;
  total = 0;
  loading = false;

  // بيانات الجدول
  subscriptionsData: SubscriptionRow[] = [];
  masterSelected = false;
  checkedValGet: number[] = [];

  // متغيرات الحذف
  submitted = false;
  trackById(index: number, item: SubscriptionRow) { return item.id; }

  @ViewChild('deleteModal', { static: false }) deleteModal?: any;

  constructor(
    public service: SubscriptionService,
    private pipe: DecimalPipe
  ) {}

  ngOnInit(): void {
    this.breadCrumbItems = [{ label: 'Tables' }, { label: 'Subscriptions', active: true }];
    this.load();
  }

  load() {
    this.loading = true;
    // للاختبار، سنستخدم tenantId = 1
    // في التطبيق الحقيقي، يجب جلب tenantId من المستخدم المسجل دخوله
    const tenantId = 1;
    
    this.service.getByTenant(tenantId).subscribe({
      next: res => {
        this.subscriptionsData = res.map(item => 
          this.service.apiToRow(item, 'Test Tenant', 'Test Plan')
        );
        this.total = this.subscriptionsData.length;
        this.masterSelected = false;
        this.checkedValGet = [];
      },
      error: err => {
        console.error('Error loading subscriptions:', err);
        this.subscriptionsData = [];
        this.total = 0;
        
        // عرض رسالة خطأ للمستخدم
        Swal.fire({
          title: 'خطأ في تحميل البيانات',
          text: 'حدث خطأ أثناء تحميل بيانات الاشتراكات. يرجى المحاولة مرة أخرى.',
          icon: 'error',
          confirmButtonColor: 'rgb(3,142,220)'
        });
      },
      complete: () => this.loading = false
    });
  }

  // تغيير الصفحة
  tablepageChanged(event: PageChangedEvent): void {
    this.page = event.page;
    this.pageSize = event.itemsPerPage;
    this.load();
  }

  // بحث
  doSearch() {
    this.page = 1;
    this.load();
  }

  // checkbox master
  checkUncheckAll(ev: any) {
    this.subscriptionsData.forEach(x => x.state = ev.target.checked);
    this.syncChecked();
  }

  syncChecked() {
    const checked: number[] = [];
    this.subscriptionsData.forEach(x => { if (x.state) checked.push(x.id); });
    this.checkedValGet = checked;
    this.masterSelected = this.subscriptionsData.length > 0 && this.subscriptionsData.every(x => !!x.state);
  }

  isAllChecked() {
    return this.subscriptionsData.every(x => !!x.state);
  }

  // فتح نافذة حذف متعدد
  deleteRecord() {
    if (this.checkedValGet.length > 0) {
      this.showDeleteModal();
    } else {
      Swal.fire({ 
        text: 'يرجى تحديد اشتراك واحد على الأقل للحذف', 
        icon: 'warning',
        confirmButtonColor: 'rgb(3,142,220)' 
      });
    }
  }

  // إظهار مودال الحذف
  showDeleteModal() {
    if (this.deleteModal) {
      this.deleteModal.nativeElement.classList.add('show');
      this.deleteModal.nativeElement.style.display = 'block';
      document.body.classList.add('modal-open');
    }
  }

  // إغلاق مودال الحذف
  closeDeleteModal() {
    if (this.deleteModal) {
      this.deleteModal.nativeElement.classList.remove('show');
      this.deleteModal.nativeElement.style.display = 'none';
      document.body.classList.remove('modal-open');
    }
  }

  // تأكيد حذف عنصر مفرد
  deleteId?: number;
  confirm(id: number) {
    this.deleteId = id;
    this.checkedValGet = [id]; // تعيين الاشتراك المحدد للحذف
    this.showDeleteModal();
  }

  // تنفيذ الحذف (واجهة فقط حالياً - لا يوجد API للحذف)
  deleteData() {
    const ids = this.checkedValGet;
    
    if (ids.length === 0) {
      this.closeDeleteModal();
      return;
    }

    // حذف من الواجهة مؤقتاً (لأنه لا يوجد API للحذف)
    ids.forEach(id => {
      const idx = this.subscriptionsData.findIndex(s => s.id === id);
      if (idx >= 0) this.subscriptionsData.splice(idx, 1);
    });

    this.checkedValGet = [];
    this.masterSelected = false;
    this.deleteId = undefined;
    this.closeDeleteModal();
    
    const message = ids.length === 1 ? 'تم حذف الاشتراك بنجاح' : `تم حذف ${ids.length} اشتراكات بنجاح`;
    Swal.fire({ 
      text: message, 
      icon: 'success', 
      confirmButtonColor: 'rgb(3,142,220)' 
    });
  }

  // تجديد اشتراك
  renewSubscription(id: number) {
    Swal.fire({
      title: 'تأكيد التجديد',
      text: 'هل أنت متأكد من تجديد هذا الاشتراك؟',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: 'rgb(3,142,220)',
      cancelButtonColor: '#d33',
      confirmButtonText: 'نعم، جدد',
      cancelButtonText: 'إلغاء'
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.renew(id).subscribe({
          next: () => {
            Swal.fire({
              title: 'تم التجديد بنجاح',
              text: 'تم تجديد الاشتراك بنجاح',
              icon: 'success',
              confirmButtonColor: 'rgb(3,142,220)'
            });
            this.load(); // إعادة تحميل البيانات
          },
          error: (err) => {
            console.error('Error renewing subscription:', err);
            Swal.fire({
              title: 'خطأ في التجديد',
              text: 'حدث خطأ أثناء تجديد الاشتراك. يرجى المحاولة مرة أخرى.',
              icon: 'error',
              confirmButtonColor: 'rgb(3,142,220)'
            });
          }
        });
      }
    });
  }
}
