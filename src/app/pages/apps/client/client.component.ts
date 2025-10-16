// src/app/pages/apps/client/client.component.ts
import { DecimalPipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import Swal from 'sweetalert2';
import { ClientRow } from 'src/app/pages/apps/client/client.model';
import { ClientService } from 'src/app/pages/services/client.service';

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.scss'],
  providers: [DecimalPipe]
})
export class ClientComponent implements OnInit {

  // BreadCrumb
  breadCrumbItems!: Array<{}>;

  // البحث والتقسيم
  q = '';
  page = 1;
  pageSize = 8;
  total = 0;
  loading = false;

  // بيانات الجدول
  clientsData: ClientRow[] = [];
  masterSelected = false;
  checkedValGet: number[] = [];

  // متغيرات الحذف
  submitted = false;
  trackById(index: number, item: ClientRow) { return item.id; }


  @ViewChild('deleteModal', { static: false }) deleteModal?: any;

  constructor(
    public service: ClientService,
    private pipe: DecimalPipe
  ) {}

  ngOnInit(): void {
    this.breadCrumbItems = [{ label: 'Tables' }, { label: 'Clients', active: true }];
    this.load();
  }

  load() {
    this.loading = true;
    this.service.search(this.q, this.page, this.pageSize).subscribe({
      next: res => {
        this.clientsData = res.items;
        this.total = res.total;
        this.masterSelected = false;
        this.checkedValGet = [];
      },
      error: err => {
        console.error('Error loading clients:', err);
        this.clientsData = [];
        this.total = 0;
        
        // عرض رسالة خطأ للمستخدم
        Swal.fire({
          title: 'خطأ في تحميل البيانات',
          text: 'حدث خطأ أثناء تحميل بيانات العملاء. يرجى المحاولة مرة أخرى.',
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
    this.clientsData.forEach(x => x.state = ev.target.checked);
    this.syncChecked();
  }

  syncChecked() {
    const checked: number[] = [];
    this.clientsData.forEach(x => { if (x.state) checked.push(x.id); });
    this.checkedValGet = checked;
    this.masterSelected = this.clientsData.length > 0 && this.clientsData.every(x => !!x.state);
  }

  isAllChecked() {
    return this.clientsData.every(x => !!x.state);
  }

  // فتح نافذة حذف متعدد
  deleteRecord() {
    if (this.checkedValGet.length > 0) {
      this.showDeleteModal();
    } else {
      Swal.fire({ 
        text: 'يرجى تحديد عميل واحد على الأقل للحذف', 
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
    this.checkedValGet = [id]; // تعيين العميل المحدد للحذف
    this.showDeleteModal();
  }

  // تنفيذ الحذف مع API
  deleteData() {
    const ids = this.checkedValGet;
    
    if (ids.length === 0) {
      this.closeDeleteModal();
      return;
    }

    // حذف من API
    const deletePromises = ids.map(clientId => 
      this.service.delete(clientId).toPromise()
    );

    Promise.all(deletePromises).then(() => {
      // إعادة تحميل البيانات بعد الحذف
      this.load();
      this.checkedValGet = [];
      this.masterSelected = false;
      this.deleteId = undefined;
      this.closeDeleteModal();
      
      const message = ids.length === 1 ? 'تم حذف العميل بنجاح' : `تم حذف ${ids.length} عملاء بنجاح`;
      Swal.fire({ 
        text: message, 
        icon: 'success', 
        confirmButtonColor: 'rgb(3,142,220)' 
      });
    }).catch(error => {
      console.error('Error deleting clients:', error);
      this.closeDeleteModal();
      
      Swal.fire({ 
        title: 'خطأ في الحذف',
        text: 'حدث خطأ أثناء حذف العملاء. يرجى المحاولة مرة أخرى.',
        icon: 'error', 
        confirmButtonColor: 'rgb(3,142,220)' 
      });
    });
  }

}
