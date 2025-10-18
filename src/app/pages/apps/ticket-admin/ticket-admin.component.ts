// src/app/pages/apps/ticket-admin/ticket-admin.component.ts
import { DecimalPipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import Swal from 'sweetalert2';
import { 
  TicketRow, 
  TicketDetail,
  TicketChatRow,
  AddChatRequest,
  UpdateStatusRequest,
  UpdatePriorityRequest,
  BulkUpdateStatusRequest
} from 'src/app/pages/apps/ticket/ticket.model';
import { TicketService } from 'src/app/pages/services/ticket.service';

@Component({
  selector: 'app-ticket-admin',
  templateUrl: './ticket-admin.component.html',
  styleUrls: ['./ticket-admin.component.scss'],
  providers: [DecimalPipe]
})
export class TicketAdminComponent implements OnInit {

  // BreadCrumb
  breadCrumbItems!: Array<{}>;

  // البحث والفلاتر
  q = '';
  tenantFilter = '';
  statusFilter = '';
  priorityFilter = '';
  page = 1;
  pageSize = 10;
  total = 0;
  loading = false;

  // بيانات الجدول
  ticketsData: TicketRow[] = [];
  masterSelected = false;
  checkedValGet: number[] = [];

  // عرض تفاصيل التذكرة
  selectedTicket: TicketDetail | null = null;
  ticketChats: TicketChatRow[] = [];
  replyMessage = '';

  // قوائم الفلاتر
  tenants = [
    { value: '', label: 'كل العملاء' },
    { value: '1', label: 'العميل 1' },
    { value: '2', label: 'العميل 2' }
  ];

  statuses = [
    { value: '', label: 'كل الحالات' },
    { value: '1', label: 'مفتوحة' },
    { value: '2', label: 'قيد المعالجة' },
    { value: '3', label: 'بانتظار العميل' },
    { value: '4', label: 'مغلقة' }
  ];

  priorities = [
    { value: '', label: 'كل الأولويات' },
    { value: 'low', label: 'منخفضة' },
    { value: 'medium', label: 'متوسطة' },
    { value: 'high', label: 'عالية' },
    { value: 'urgent', label: 'عاجلة' }
  ];

  trackById(index: number, item: TicketRow) { return item.id; }

  @ViewChild('detailModal', { static: false }) detailModal?: any;

  constructor(
    public service: TicketService,
    private pipe: DecimalPipe
  ) {}

  ngOnInit(): void {
    this.breadCrumbItems = [{ label: 'Tables' }, { label: 'Admin Tickets', active: true }];
    this.load();
  }

  load() {
    this.loading = true;
    
    const statusId = this.statusFilter ? +this.statusFilter : undefined;
    
    this.service.getAllTickets(
      this.q || undefined,
      this.tenantFilter || undefined,
      statusId,
      this.priorityFilter || undefined,
      this.page,
      this.pageSize
    ).subscribe({
      next: (res) => {
        this.ticketsData = res.items.map(dto => this.service.dtoToRow(dto));
        this.total = res.total;
        this.masterSelected = false;
        this.checkedValGet = [];
      },
      error: (err) => {
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
    this.statusFilter = '';
    this.priorityFilter = '';
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
    
    // جلب محادثات التذكرة
    this.service.getChats(ticket.id).subscribe({
      next: (chats) => {
        this.ticketChats = chats.map(chat => this.service.chatApiToRow(chat));
        this.selectedTicket!.chats = this.ticketChats;
      },
      error: (err) => {
        console.error('Error loading ticket chats:', err);
      }
    });
    
    this.showDetailModal();
  }

  // إظهار مودال التفاصيل
  showDetailModal() {
    if (this.detailModal) {
      this.detailModal.nativeElement.classList.add('show');
      this.detailModal.nativeElement.style.display = 'block';
      document.body.classList.add('modal-open');
      
      // إضافة backdrop
      const backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop fade show';
      backdrop.id = 'modalBackdrop';
      document.body.appendChild(backdrop);
    }
  }

  // إغلاق مودال التفاصيل
  closeDetailModal() {
    if (this.detailModal) {
      this.detailModal.nativeElement.classList.remove('show');
      this.detailModal.nativeElement.style.display = 'none';
      document.body.classList.remove('modal-open');
      
      // إزالة backdrop
      const backdrop = document.getElementById('modalBackdrop');
      if (backdrop) backdrop.remove();
    }
    this.selectedTicket = null;
    this.ticketChats = [];
  }

  // إضافة رد على التذكرة
  addReply() {
    if (!this.replyMessage.trim() || !this.selectedTicket) {
      return;
    }

    const request: AddChatRequest = {
      tenantId: this.selectedTicket.ticket.tenant_id,
      message: this.replyMessage.trim(),
      isAdmin: true
    };

    this.service.addChat(this.selectedTicket.ticket.id, request).subscribe({
      next: () => {
        this.replyMessage = '';
        this.load(); // إعادة تحميل البيانات
        this.viewTicket(this.selectedTicket!.ticket); // إعادة تحميل التفاصيل
        
        Swal.fire({
          title: 'تم إضافة الرد بنجاح',
          text: 'تم إضافة ردك على التذكرة',
          icon: 'success',
          confirmButtonColor: 'rgb(3,142,220)'
        });
      },
      error: (err) => {
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
  updateTicketStatus(newStatus: number) {
    if (!this.selectedTicket) return;

    const request: UpdateStatusRequest = { statusId: newStatus };
    
    this.service.updateStatus(this.selectedTicket.ticket.id, request).subscribe({
      next: () => {
        this.selectedTicket!.ticket.status = this.getStatusName(newStatus);
        this.selectedTicket!.ticket.status_color = this.getStatusColor(newStatus);
        this.load(); // إعادة تحميل الجدول
        
        Swal.fire({
          title: 'تم تحديث الحالة',
          text: 'تم تحديث حالة التذكرة بنجاح',
          icon: 'success',
          confirmButtonColor: 'rgb(3,142,220)'
        });
      },
      error: (err) => {
        console.error('Error updating status:', err);
        Swal.fire({
          title: 'خطأ',
          text: 'حدث خطأ أثناء تحديث الحالة',
          icon: 'error',
          confirmButtonColor: 'rgb(3,142,220)'
        });
      }
    });
  }

  // تحديث أولوية التذكرة
  updateTicketPriority(newPriority: string) {
    if (!this.selectedTicket) return;

    const request: UpdatePriorityRequest = { priority: newPriority };
    
    this.service.updatePriority(this.selectedTicket.ticket.id, request).subscribe({
      next: () => {
        this.selectedTicket!.ticket.priority = this.getPriorityName(newPriority);
        this.selectedTicket!.ticket.priority_color = this.getPriorityColor(newPriority);
        this.load(); // إعادة تحميل الجدول
        
        Swal.fire({
          title: 'تم تحديث الأولوية',
          text: 'تم تحديث أولوية التذكرة بنجاح',
          icon: 'success',
          confirmButtonColor: 'rgb(3,142,220)'
        });
      },
      error: (err) => {
        console.error('Error updating priority:', err);
        Swal.fire({
          title: 'خطأ',
          text: 'حدث خطأ أثناء تحديث الأولوية',
          icon: 'error',
          confirmButtonColor: 'rgb(3,142,220)'
        });
      }
    });
  }

  // عمليات جماعية
  bulkSetStatus(status: number) {
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
      statusId: status
    };

    this.service.bulkUpdateStatus(request).subscribe({
      next: () => {
        this.checkedValGet = [];
        this.masterSelected = false;
        this.load();
        
        Swal.fire({
          title: 'تم التحديث الجماعي',
          text: `تم تحديث حالة التذاكر المحددة`,
          icon: 'success',
          confirmButtonColor: 'rgb(3,142,220)'
        });
      },
      error: (err) => {
        console.error('Error bulk updating:', err);
        Swal.fire({
          title: 'خطأ',
          text: 'حدث خطأ أثناء التحديث الجماعي',
          icon: 'error',
          confirmButtonColor: 'rgb(3,142,220)'
        });
      }
    });
  }

  private getStatusName(statusId: number): string {
    switch (statusId) {
      case 1: return 'مفتوحة';
      case 2: return 'قيد المعالجة';
      case 3: return 'بانتظار العميل';
      case 4: return 'مغلقة';
      default: return 'غير معروف';
    }
  }

  private getStatusColor(statusId: number): string {
    switch (statusId) {
      case 1: return 'info';
      case 2: return 'warning';
      case 3: return 'purple';
      case 4: return 'success';
      default: return 'secondary';
    }
  }

  private getPriorityName(priority: string): string {
    switch (priority.toLowerCase()) {
      case 'low': return 'منخفضة';
      case 'medium': return 'متوسطة';
      case 'high': return 'عالية';
      case 'urgent': return 'عاجلة';
      default: return priority;
    }
  }

  private getPriorityColor(priority: string): string {
    switch (priority.toLowerCase()) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'danger';
      case 'urgent': return 'danger';
      default: return 'secondary';
    }
  }
}
