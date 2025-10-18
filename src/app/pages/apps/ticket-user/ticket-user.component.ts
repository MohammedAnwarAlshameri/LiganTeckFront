// src/app/pages/apps/ticket-user/ticket-user.component.ts
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
  AddChatRequest
} from 'src/app/pages/apps/ticket/ticket.model';
import { TicketService } from 'src/app/pages/services/ticket.service';

@Component({
  selector: 'app-ticket-user',
  templateUrl: './ticket-user.component.html',
  styleUrls: ['./ticket-user.component.scss'],
  providers: [DecimalPipe]
})
export class TicketUserComponent implements OnInit {

  // BreadCrumb
  breadCrumbItems!: Array<{}>;

  // البحث والفلاتر
  q = '';
  priorityFilter = '';
  page = 1;
  pageSize = 10;
  total = 0;
  loading = false;

  // بيانات الجدول
  ticketsData: TicketRow[] = [];

  // نموذج إنشاء تذكرة جديدة
  ticketForm!: FormGroup;
  submitted = false;

  // عرض تفاصيل التذكرة
  selectedTicket: TicketDetail | null = null;
  ticketChats: TicketChatRow[] = [];
  replyMessage = '';

  // قوائم الفلاتر
  priorities = [
    { value: '', label: 'كل الأولويات' },
    { value: 'low', label: 'منخفضة' },
    { value: 'medium', label: 'متوسطة' },
    { value: 'high', label: 'عالية' }
  ];

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
      { label: 'طلب تذكرة دعم', active: true }
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
    const tenantId = 1; // في التطبيق الحقيقي، جلب من المستخدم المسجل
    
    this.service.getUserTickets(tenantId).subscribe({
      next: res => {
        this.ticketsData = res.map(item => this.service.dtoToRow(item));
        this.total = this.ticketsData.length;
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
    this.priorityFilter = '';
    this.load();
  }

  // فتح نافذة إنشاء تذكرة جديدة
  openCreateModal() {
    this.submitted = false;
    this.ticketForm.reset();
    this.ticketForm.patchValue({ priorityLevel: 'medium' });
  }


  // إنشاء تذكرة جديدة
  createTicket() {
    this.submitted = true;
    
    if (!this.ticketForm.valid) {
      return;
    }

    const request: TicketCreateRequest = {
      tenantId: 1, // في التطبيق الحقيقي، جلب من المستخدم المسجل
      subjectLine: this.ticketForm.get('subjectLine')?.value,
      priorityLevel: this.ticketForm.get('priorityLevel')?.value,
      bodyText: this.ticketForm.get('bodyText')?.value
    };

    this.service.create(request).subscribe({
      next: (response) => {
        this.ticketForm.reset();
        this.ticketForm.patchValue({ priorityLevel: 'medium' });
        this.submitted = false;
        this.load();
        
        Swal.fire({
          title: 'تم إنشاء التذكرة بنجاح',
          text: `تم إنشاء التذكرة برقم ${response.ticketId}`,
          icon: 'success',
          confirmButtonColor: 'rgb(3,142,220)',
          timer: 2000,
          showConfirmButton: false
        });
        
        // عرض التذكرة الجديدة
        const newTicket = this.ticketsData.find(t => t.id === response.ticketId);
        if (newTicket) this.viewTicket(newTicket);
      },
      error: (err: any) => {
        console.error('Error creating ticket:', err);
        Swal.fire({
          title: 'خطأ في إنشاء التذكرة',
          text: 'حدث خطأ أثناء إنشاء التذكرة. يرجى المحاولة مرة أخرى.',
          icon: 'error',
          confirmButtonColor: 'rgb(3,142,220)'
        });
      }
    });
  }

  // عرض تفاصيل التذكرة
  viewTicket(ticket: TicketRow) {
    this.selectedTicket = { ticket: ticket, chats: [] };
    this.ticketChats = [];
    this.replyMessage = '';
    
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

  // إغلاق التفاصيل
  closeDetails() {
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
      isAdmin: false // هذه واجهة العميل
    };

    this.service.addChat(this.selectedTicket.ticket.id, request).subscribe({
      next: () => {
        this.replyMessage = '';
        this.viewTicket(this.selectedTicket!.ticket);
        this.load();
        
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
}
