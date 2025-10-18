# تحديثات الباك إند - تم الانتهاء ✅

## ✅ ما تم إضافته في الباك إند

### 1. Endpoints الفواتير
- ✅ `GET /api/invoices/admin/all` - الحصول على جميع الفواتير (أول 50)
- ✅ `GET /api/invoices/admin/search` - البحث المتقدم بالفلاتر

### 2. Endpoints الاشتراكات  
- ✅ `GET /api/subscriptions/admin/all` - الحصول على جميع الاشتراكات (أول 50)
- ✅ `GET /api/subscriptions/admin/search` - البحث المتقدم بالفلاتر

---

# ملاحظات مهمة للباك إند

## 1. إضافة TenantName و PlanName في الـ DTO

للحصول على أفضل تجربة في الفرونت إند، تأكد من إضافة `TenantName` و `PlanName` في الـ DTO المُرجع من الـ endpoint `/admin/search` للاشتراكات:

```csharp
public class SubscriptionListItemDto
{
    public long SubscriptionId { get; set; }
    public long TenantId { get; set; }
    public string? TenantName { get; set; }  // ← مهم للعرض
    public long PlanId { get; set; }
    public string? PlanName { get; set; }     // ← مهم للعرض
    public int MonthsCount { get; set; }
    public bool AutoRenew { get; set; }
    public int SubStatusid { get; set; }
    public DateTime StartDateUtc { get; set; }
    public DateTime? EndDateUtc { get; set; }
    public long? CouponId { get; set; }
}
```

في الـ Service أو Controller، قم بعمل join مع جداول Tenant و Plan:

```csharp
var query = from s in _db.Set<Subscription>().AsNoTracking()
            join t in _db.Set<Tenant>().AsNoTracking()
                on s.TenantId equals t.TenantId
            join p in _db.Set<Plan>().AsNoTracking()
                on s.PlanId equals p.PlanId
            where !s.IsDeleted && !t.IsDeleted
            select new SubscriptionListItemDto
            {
                SubscriptionId = s.SubscriptionId,
                TenantId = s.TenantId,
                TenantName = t.TenantName,  // ← من جدول Tenant
                PlanId = s.PlanId,
                PlanName = p.PlanName,      // ← من جدول Plan
                MonthsCount = s.MonthsCount,
                AutoRenew = s.AutoRenew,
                SubStatusid = s.SubStatusid,
                StartDateUtc = s.StartDateUtc,
                EndDateUtc = s.EndDateUtc,
                CouponId = s.CouponId
            };
```

## 2. إضافة PagedResult للتوافق

---

## البديل المؤقت (إذا لم تستطع تعديل الباك إند الآن):

يمكنك في الفرونت إند الحصول على جميع الفواتير بطريقة بديلة:

```typescript
// في invoices-admin.component.ts
loadAllInvoices() {
    this.loading = true;
    
    // الحل المؤقت: جلب فواتير جميع الـ tenants
    // (يتطلب معرفة قائمة الـ tenants أو استخدام endpoint خاص)
    
    // أو استخدام endpoint موجود بشكل مؤقت
    this.invoiceService.getByTenant(1).subscribe({
        next: (invoices) => {
            this.invoicesData = invoices;
            this.applyFilters();
            this.loading = false;
        },
        error: (err) => {
            console.error('Error loading invoices:', err);
            this.loading = false;
        }
    });
}
```

ولكن **الحل الأفضل** هو إضافة الـ endpoints في الباك إند كما هو موضح أعلاه.

