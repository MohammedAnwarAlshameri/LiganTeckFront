// src/app/pages/apps/client/client.component.ts
import { DecimalPipe } from '@angular/common';
import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
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

  // نموذج إضافة/تعديل (مستقبلاً)
  submitted = false;
  clientForm!: UntypedFormGroup;
  trackById(index: number, item: ClientRow) { return item.id; }


  @ViewChild('showModal',  { static: false }) showModal?: ModalDirective;
  @ViewChild('deleteModal', { static: false }) deleteModal?: ModalDirective;

  constructor(
    public service: ClientService,
    private fb: UntypedFormBuilder,
    private pipe: DecimalPipe
  ) {}

  ngOnInit(): void {
    this.breadCrumbItems = [{ label: 'Tables' }, { label: 'Clients', active: true }];

    this.clientForm = this.fb.group({
      ids: [''],
      customer_name: ['', [Validators.required]],
      username: ['', [Validators.required]],
      email: ['', [Validators.required]],
      phone: ['', [Validators.required]],
      date: [''],
      status: ['']
    });

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
      error: _ => {
        this.clientsData = [];
        this.total = 0;
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

  // فتح نافذة حذف متعدد / مفرد
  deleteRecord() {
    if (this.checkedValGet.length > 0) {
      this.deleteModal?.show();
    } else {
      Swal.fire({ text: 'Please select at least one checkbox', confirmButtonColor: 'rgb(3,142,220)' });
    }
  }

  // تأكيد حذف عنصر مفرد
  deleteId?: number;
  confirm(id: number) {
    this.deleteId = id;
    this.deleteModal?.show();
  }

  // تنفيذ الحذف (استدعاء API إن متاح، وإلا حذف من الواجهة مؤقتًا)
  deleteData(id?: number) {
    const ids = id ? [id] : this.checkedValGet;

    // إذا لديك Endpoint للحذف الجماعي غيّر هذه الجزئية:
    ids.forEach(x => {
      const idx = this.clientsData.findIndex(c => c.id === x);
      if (idx >= 0) this.clientsData.splice(idx, 1);
    });

    this.checkedValGet = [];
    this.masterSelected = false;
    this.deleteModal?.hide();
    Swal.fire({ text: 'Deleted successfully', icon: 'success', confirmButtonColor: 'rgb(3,142,220)' });
  }

  // فتح نافذة تعديل (مودال)
  editModal(index: number) {
    this.submitted = false;
    const updateBtn = document.getElementById('add-btn') as HTMLAreaElement;
    if (updateBtn) updateBtn.innerHTML = 'Update';
    this.showModal?.show();

    const listData = this.clientsData[index];
    this.clientForm.patchValue({
      ids: listData.id,
      customer_name: listData.customer_name,
      username: listData.username,
      email: listData.email,
      phone: listData.phone,
      date: listData.date,
      status: listData.status
    });
  }

  // حفظ (واجهة فقط حالياً)
  saveClient() {
    if (!this.clientForm.valid) { this.submitted = true; return; }

    const idVal = this.clientForm.get('ids')?.value;
    if (idVal) {
      // تحديث على الواجهة
      this.clientsData = this.clientsData.map(d => d.id === idVal ? {
        ...d,
        customer_name: this.clientForm.get('customer_name')?.value,
        username: this.clientForm.get('username')?.value,
        email: this.clientForm.get('email')?.value,
        phone: this.clientForm.get('phone')?.value,
        date: this.clientForm.get('date')?.value,
        status: this.clientForm.get('status')?.value
      } : d);
    } else {
      // إضافة (واجهة فقط) - يمكنك ربط API لاحقًا
      const newItem: ClientRow = {
        id: Math.max(0, ...this.clientsData.map(x => x.id)) + 1,
        customer_name: this.clientForm.get('customer_name')?.value,
        username: this.clientForm.get('username')?.value,
        email: this.clientForm.get('email')?.value,
        phone: this.clientForm.get('phone')?.value,
        date: this.clientForm.get('date')?.value || '',
        status: this.clientForm.get('status')?.value || 'Active',
        status_color: 'success',
        state: false
      };
      this.clientsData = [newItem, ...this.clientsData];
    }

    this.showModal?.hide();
    setTimeout(() => this.clientForm.reset(), 200);
    this.submitted = true;
  }
}
