# ملاحظات التنفيذ - صفحات الفواتير والاشتراكات

## ما تم إنجازه

### 1. Models (النماذج)
تم إنشاء النماذج التالية:
- `src/app/pages/apps/invoices/invoice.model.ts` - نموذج الفواتير
- `src/app/pages/apps/subscriptions/subscription.model.ts` - نموذج الاشتراكات

### 2. Services (الخدمات)
تم إنشاء الخدمات التالية:
- `src/app/pages/services/invoice.service.ts` - خدمة الفواتير للتواصل مع الـ API
- `src/app/pages/services/subscription.service.ts` - خدمة الاشتراكات للتواصل مع الـ API

### 3. Components (المكونات)

#### صفحات الفواتير:
- **للأدمن:** `src/app/pages/apps/invoices/invoices-admin.component.*`
  - عرض جميع الفواتير
  - البحث والفلترة حسب الحالة
  - تسجيل الدفع
  - إلغاء الفاتورة
  
- **للعميل:** `src/app/pages/apps/invoices/my-invoices.component.*`
  - عرض فواتير العميل فقط
  - البحث والفلترة
  - طباعة الفاتورة

#### صفحات الاشتراكات:
- **للأدمن:** `src/app/pages/apps/subscriptions/subscriptions-admin.component.*`
  - عرض جميع الاشتراكات
  - البحث والفلترة حسب الحالة
  - تجديد الاشتراك
  - عرض الأيام المتبقية
  
- **للعميل:** `src/app/pages/apps/subscriptions/my-subscriptions.component.*`
  - عرض اشتراكات العميل فقط
  - البحث والفلترة
  - تجديد الاشتراك

### 4. Routing (التوجيه)
تم إضافة المسارات التالية في `src/app/pages/apps/apps-routing.module.ts`:
- `/apps/invoices-admin` - صفحة الفواتير للأدمن
- `/apps/my-invoices` - صفحة فواتيري للعميل
- `/apps/subscriptions-admin` - صفحة الاشتراكات للأدمن
- `/apps/my-subscriptions` - صفحة اشتراكاتي للعميل

### 5. Menu (القائمة الجانبية)
تم تحديث القائمة الجانبية في:
- `src/app/layouts/sidebar/menu.ts`
- `src/assets/i18n/en.json` - الترجمة الإنجليزية
- `src/assets/i18n/ar.json` - الترجمة العربية

## ملاحظات مهمة للتطوير المستقبلي

### 1. Endpoints مطلوبة في الباك إند

حالياً، صفحات الأدمن تستخدم نفس الـ endpoints الموجودة للحصول على البيانات. لتحسين الأداء، يُنصح بإضافة الـ endpoints التالية في الباك إند:

#### للفواتير:
```csharp
// في InvoicesController.cs
[HttpGet("all")]
[Authorize(Policy = "AdminsOnly")]
public async Task<ActionResult<List<InvoiceDto>>> GetAll(
    [FromQuery] int page = 1, 
    [FromQuery] int pageSize = 10,
    [FromQuery] int? statusId = null,
    CancellationToken ct = default)
{
    // تنفيذ logic للحصول على جميع الفواتير مع pagination
}
```

#### للاشتراكات:
```csharp
// في SubscriptionsController.cs
[HttpGet("all")]
[Authorize(Policy = "AdminsOnly")]
public async Task<ActionResult<List<SubscriptionDto>>> GetAll(
    [FromQuery] int page = 1, 
    [FromQuery] int pageSize = 10,
    [FromQuery] int? statusId = null,
    CancellationToken ct = default)
{
    // تنفيذ logic للحصول على جميع الاشتراكات مع pagination
}
```

### 2. Tenant ID الحالي

في الوقت الحالي، تستخدم صفحات العميل `tenantId = 1` كقيمة مؤقتة. يجب تحديث الكود للحصول على الـ tenantId من:
- Auth Service
- User Token
- User Profile

مثال:
```typescript
// في MyInvoicesComponent و MySubscriptionsComponent
constructor(
    private invoiceService: InvoiceService,
    private authService: AuthService  // أضف هذا
) {}

ngOnInit(): void {
    // بدلاً من:
    // this.currentTenantId = 1;
    
    // استخدم:
    this.currentTenantId = this.authService.getCurrentUser().tenantId;
}
```

### 3. Authorization (الصلاحيات)

يُنصح بإضافة Guards للتحقق من صلاحيات المستخدم:
- صفحات الأدمن: يجب أن تكون متاحة فقط للأدمن
- صفحات العميل: يجب أن تكون متاحة للعملاء المسجلين فقط

مثال في `apps-routing.module.ts`:
```typescript
{
    path: "invoices-admin",
    component: InvoicesAdminComponent,
    canActivate: [AdminGuard]  // أضف هذا
},
{
    path: "my-invoices",
    component: MyInvoicesComponent,
    canActivate: [AuthGuard]  // أضف هذا
}
```

### 4. طباعة الفاتورة

حالياً، زر الطباعة في صفحة "فواتيري" يعرض رسالة فقط. يُنصح بتنفيذ:
- تحميل PDF من الباك إند
- أو إنشاء PDF في الفرونت إند باستخدام مكتبة مثل `jspdf`

### 5. Payment Methods

في modal الدفع، يتم استخدام `paymentMethodId` ثابت. يُنصح بجلب قائمة طرق الدفع من الباك إند.

## كيفية الاستخدام

1. تأكد من تشغيل الباك إند على `https://localhost:7066/api`
2. قم بتشغيل المشروع: `ng serve -o`
3. انتقل إلى أحد المسارات:
   - للأدمن: `/apps/invoices-admin` أو `/apps/subscriptions-admin`
   - للعميل: `/apps/my-invoices` أو `/apps/my-subscriptions`

## التحسينات المستقبلية

1. ✅ إضافة Pagination من الـ Server-side بدلاً من Client-side
2. ✅ إضافة Sorting للجداول
3. ✅ إضافة Export إلى Excel/PDF
4. ✅ إضافة Filters متقدمة (حسب التاريخ، المبلغ، إلخ)
5. ✅ إضافة Dashboard cards لعرض إحصائيات سريعة
6. ✅ إضافة Real-time notifications عند إنشاء فاتورة جديدة
7. ✅ إضافة History/Audit log للتغييرات

---

تم إنشاء هذه الصفحات بتاريخ: 2025-10-18
المطور: AI Assistant (Cursor)

