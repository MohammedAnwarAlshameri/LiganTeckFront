// src/app/pages/apps/ticket/ticket.component.ts
import { DecimalPipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import Swal from 'sweetalert2';
import { 
  TicketRow, 
  TicketCreateRequest, 
  TicketDetail,
  TicketChatRow,
  AddChatRequest,
  UpdateStatusRequest,
  UpdatePriorityRequest,
  BulkUpdateStatusRequest
} from 'src/app/pages/apps/ticket/ticket.model';
import { TicketService } from 'src/app/pages/services/ticket.service';

@Component({
  selector: 'app-ticket',
  templateUrl: './ticket.component.html',
  styleUrls: ['./ticket.component.scss'],
  providers: [DecimalPipe]
})
export class TicketComponent implements OnInit {

  // BreadCrumb
  breadCrumbItems!: Array<{}>;

  // البحث والفلاتر
  q = '';
  tenantFilter = '';
  statusFilter?: number;
  priorityFilter = '';
  page = 1;
  pageSize = 10;
  total = 0;
  loading = false;

  // بيانات الجدول
  ticketsData: TicketRow[] = [];
  masterSelected = false;
  checkedValGet: number[] = [];

  // نموذج إنشاء تذكرة جديدة
  ticketForm!: FormGroup;
  submitted = false;

  // عرض تفاصيل التذكرة
  selectedTicket: TicketDetail | null = null;
  ticketChats: TicketChatRow[] = [];
  replyMessage = '';
  selectedStatus?: number;
  selectedPriority = '';

  trackById(index: number, item: TicketRow) { return item.id; }

  // دالة للحصول على رابط تحميل المرفق
  getAttachmentUrl(attachmentPath: string): string {
    if (!attachmentPath) return '#';
    
    // إذا كان المسار كامل URL
    if (attachmentPath.startsWith('http')) {
      return attachmentPath;
    }
    
    // إذا كان المسار نسبي، أضف base URL للباك إند
    return `https://localhost:7066${attachmentPath}`;
  }

  constructor(
    public service: TicketService,
    private fb: FormBuilder,
    private pipe: DecimalPipe
  ) {}

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'الرئيسية' },
      { label: 'الدعم الفني' },
      { label: 'لوحة موظف العملاء', active: true }
    ];
    
    this.initializeForms();
    this.load();
  }

  initializeForms() {
    // نموذج إنشاء تذكرة جديدة
    this.ticketForm = this.fb.group({
      subjectLine: ['', [Validators.required, Validators.minLength(5)]],
      priorityLevel: ['medium', [Validators.required]],
      bodyText: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  load() {
    this.loading = true;
    
    this.service.getAllTickets(
      this.q || undefined,
      this.tenantFilter || undefined,
      this.statusFilter,
      this.priorityFilter || undefined,
      this.page,
      this.pageSize
    ).subscribe({
      next: res => {
        this.ticketsData = res.items.map(item => this.service.dtoToRow(item));
        this.total = res.total;
        this.masterSelected = false;
        this.checkedValGet = [];
      },
      error: (err: any) => {
        console.error('Error loading tickets:', err);
        this.ticketsData = [];
        this.total = 0;
        
        Swal.fire({
          title: 'خطأ في تحميل البيانات',
          text: 'حدث خطأ أثناء تحميل بيانات التذاكر. يرجى المحاولة مرة أخرى.',
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

  // مسح الفلاتر
  clearFilters() {
    this.q = '';
    this.tenantFilter = '';
    this.statusFilter = undefined;
    this.priorityFilter = '';
    this.page = 1;
    this.load();
  }

  // checkbox master
  checkUncheckAll(ev: any) {
    this.ticketsData.forEach(x => x.state = ev.target.checked);
    this.syncChecked();
  }

  syncChecked() {
    const checked: number[] = [];
    this.ticketsData.forEach(x => { if (x.state) checked.push(x.id); });
    this.checkedValGet = checked;
    this.masterSelected = this.ticketsData.length > 0 && this.ticketsData.every(x => !!x.state);
  }

  isAllChecked() {
    return this.ticketsData.every(x => !!x.state);
  }



  // عرض تفاصيل التذكرة
  viewTicket(ticket: TicketRow) {
    this.selectedTicket = { ticket: ticket, chats: [] };
    this.ticketChats = [];
    this.replyMessage = '';
    this.selectedStatus = ticket.id; // سنحتاج لربط الحالة بناءً على التذكرة
    this.selectedPriority = ticket.priority;
    
    // جلب محادثات التذكرة
    this.service.getChats(ticket.id).subscribe({
      next: (chats: any) => {
        this.ticketChats = chats.map((chat: any) => this.service.chatApiToRow(chat));
        this.selectedTicket!.chats = this.ticketChats;
      },
      error: (err: any) => {
        console.error('Error loading ticket chats:', err);
      }
    });
  }

  // إضافة رد على التذكرة
  addReply() {
    if (!this.replyMessage.trim() || !this.selectedTicket) {
      return;
    }

    const request: AddChatRequest = {
      tenantId: this.selectedTicket.ticket.tenant_id,
      message: this.replyMessage.trim(),
      isAdmin: true // هذه واجهة الإدارة
    };

    this.service.addChat(this.selectedTicket.ticket.id, request).subscribe({
      next: () => {
        this.replyMessage = '';
        this.viewTicket(this.selectedTicket!.ticket); // إعادة تحميل التفاصيل
        this.load(); // إعادة تحميل البيانات
        
        Swal.fire({
          title: 'تم إضافة الرد بنجاح',
          text: 'تم إضافة ردك على التذكرة',
          icon: 'success',
          confirmButtonColor: 'rgb(3,142,220)',
          timer: 1500,
          showConfirmButton: false
        });
      },
      error: (err: any) => {
        console.error('Error adding reply:', err);
        Swal.fire({
          title: 'خطأ في إضافة الرد',
          text: 'حدث خطأ أثناء إضافة الرد. يرجى المحاولة مرة أخرى.',
          icon: 'error',
          confirmButtonColor: 'rgb(3,142,220)'
        });
      }
    });
  }

  // تحديث حالة التذكرة
  updateStatus(ticketId: number, statusId: number) {
    const request: UpdateStatusRequest = { statusId };
    
    this.service.updateStatus(ticketId, request).subscribe({
      next: () => {
        this.load();
        if (this.selectedTicket && this.selectedTicket.ticket.id === ticketId) {
          const ticket = this.ticketsData.find(t => t.id === ticketId);
          if (ticket) this.viewTicket(ticket);
        }
        
        Swal.fire({
          title: 'تم تحديث الحالة',
          icon: 'success',
          confirmButtonColor: 'rgb(3,142,220)',
          timer: 1500,
          showConfirmButton: false
        });
      },
      error: (err: any) => {
        console.error('Error updating status:', err);
        Swal.fire({
          title: 'خطأ في تحديث الحالة',
          text: 'حدث خطأ أثناء تحديث الحالة. يرجى المحاولة مرة أخرى.',
          icon: 'error',
          confirmButtonColor: 'rgb(3,142,220)'
        });
      }
    });
  }

  // تحديث أولوية التذكرة
  updatePriority(ticketId: number, priority: string) {
    const request: UpdatePriorityRequest = { priority };
    
    this.service.updatePriority(ticketId, request).subscribe({
      next: () => {
        this.load();
        if (this.selectedTicket && this.selectedTicket.ticket.id === ticketId) {
          const ticket = this.ticketsData.find(t => t.id === ticketId);
          if (ticket) this.viewTicket(ticket);
        }
        
        Swal.fire({
          title: 'تم تحديث الأولوية',
          icon: 'success',
          confirmButtonColor: 'rgb(3,142,220)',
          timer: 1500,
          showConfirmButton: false
        });
      },
      error: (err: any) => {
        console.error('Error updating priority:', err);
        Swal.fire({
          title: 'خطأ في تحديث الأولوية',
          text: 'حدث خطأ أثناء تحديث الأولوية. يرجى المحاولة مرة أخرى.',
          icon: 'error',
          confirmButtonColor: 'rgb(3,142,220)'
        });
      }
    });
  }

  // تحديث جماعي للحالة
  bulkUpdateStatus(statusId: number) {
    if (this.checkedValGet.length === 0) {
      Swal.fire({ 
        text: 'يرجى تحديد تذكرة واحدة على الأقل', 
        icon: 'warning',
        confirmButtonColor: 'rgb(3,142,220)' 
      });
      return;
    }

    const request: BulkUpdateStatusRequest = {
      ticketIds: this.checkedValGet,
      statusId: statusId
    };

    this.service.bulkUpdateStatus(request).subscribe({
      next: () => {
        this.checkedValGet = [];
        this.masterSelected = false;
        this.load();
        
        Swal.fire({
          title: 'تم تحديث الحالة',
          text: `تم تحديث حالة ${request.ticketIds.length} تذكرة`,
          icon: 'success',
          confirmButtonColor: 'rgb(3,142,220)',
          timer: 1500,
          showConfirmButton: false
        });
      },
      error: (err: any) => {
        console.error('Error bulk updating status:', err);
        Swal.fire({
          title: 'خطأ في تحديث الحالة',
          text: 'حدث خطأ أثناء تحديث الحالة. يرجى المحاولة مرة أخرى.',
          icon: 'error',
          confirmButtonColor: 'rgb(3,142,220)'
        });
      }
    });
  }

}
