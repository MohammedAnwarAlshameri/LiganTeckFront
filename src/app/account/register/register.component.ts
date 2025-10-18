import { Component, HostListener, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { LanguageService } from 'src/app/core/services/language.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  signupForm!: UntypedFormGroup;
  submitted = false;
  loading = false;
  error = '';
  fieldTextType = false;
  confirmFieldTextType = false;
  isLanguageMenuOpen = false;
  currentLanguage = 'ar';

  // السنة الحالية للواجهة
  year: number = new Date().getFullYear();

  constructor(
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private auth: AuthenticationService,
    private languageService: LanguageService
  ) {}

  ngOnInit(): void {
    // لو المستخدم مسجّل دخول، وجّهه مباشرة
    if (this.auth.isAuthenticated) {
      this.router.navigateByUrl('/');
      return;
    }

    // تهيئة اللغة
    this.currentLanguage = this.languageService.getCurrentLanguage();
    this.setDocumentLanguage();

    // بناء النموذج
    this.signupForm = this.formBuilder.group({
      companyName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\+[1-9]\d{1,14}$/)]],
      country: ['', [Validators.required]],
      username: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(30), Validators.pattern(/^[a-zA-Z0-9_]+$/)]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)]],
      confirmPassword: ['', [Validators.required]],
      terms: [false, [Validators.requiredTrue]]
    }, { validators: this.passwordMatchValidator });
  }

  // Getter مختصر
  get f() { return this.signupForm.controls; }

  /**
   * Submit
   */
  onSubmit() {
    this.submitted = true;
    this.error = '';

    if (this.signupForm.invalid) return;

    const formData = this.signupForm.value;
    const registerData: any = {
      tenantName: formData.companyName,
      email: formData.email,
      password: formData.password,
      //phoneNumber: formData.phone,
      //username: formData.username,
      countryCode: formData.country || 'SA'
    };

    // إضافة الحقول الاختيارية فقط إذا كانت موجودة
    if (formData.phone && formData.phone.trim()) {
      registerData.phoneNumber = formData.phone.trim();
    }
    if (formData.username && formData.username.trim()) {
      registerData.username = formData.username.trim();
    }

    this.loading = true;

    this.auth.register(registerData).subscribe({
      next: _ => {
        this.loading = false;
        this.router.navigateByUrl('/');
      },
      error: err => {
        this.loading = false;
      
        // صفّر أخطاء duplicate القديمة
        ['email','username','companyName'].forEach(k => {
          const c = this.f[k];
          if (!c) return;
          const errors = { ...(c.errors || {}) };
          delete errors['duplicate'];
          Object.keys(errors).length ? c.setErrors(errors) : c.setErrors(null);
        });
      
        // 409 = تعارض (تكرار)
        if (err?.status === 409) {
          const field = (err?.error?.field || '').toString();
          const msg = (err?.error?.message || '').toString();
      
          // لو السيرفر رجّع field محدد، استخدمه مباشرة
          if (field && this.f[field]) {
            this.f[field].setErrors({ ...(this.f[field].errors || {}), duplicate: true });
          } else {
            // fallback: استدلّ من الرسالة لو ما فيه field
            const raw = msg.toLowerCase();
            if (raw.includes('username')) this.f['username']?.setErrors({ ...(this.f['username']?.errors || {}), duplicate: true });
            else if (raw.includes('tenant name') || raw.includes('company name')) this.f['companyName']?.setErrors({ ...(this.f['companyName']?.errors || {}), duplicate: true });
            else if (raw.includes('email')) this.f['email']?.setErrors({ ...(this.f['email']?.errors || {}), duplicate: true });
          }
      
          // لا تعرض رسالة عامة كبيرة؛ خلّي الرسالة تحت الحقل
          this.error = '';
          return;
        }
      
        // أخطاء أخرى (500, 400, …)
        this.error = err?.error?.message || err?.message || 'Registration failed';
      }      
    });
    
  }

  /**
   * إظهار/إخفاء كلمة المرور
   */
  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }

  /**
   * إظهار/إخفاء تأكيد كلمة المرور
   */
  toggleConfirmFieldTextType() {
    this.confirmFieldTextType = !this.confirmFieldTextType;
  }

  /**
   * التحقق من تطابق كلمة المرور
   */
  passwordMatchValidator(form: UntypedFormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  goToLogin() {
    this.router.navigateByUrl('/auth/login');
  }

  // Language switching methods
  toggleLanguageMenu() {
    this.isLanguageMenuOpen = !this.isLanguageMenuOpen;
  }

  changeLanguage(lang: string) {
    this.currentLanguage = lang;
    this.languageService.setLanguage(lang);
    this.setDocumentLanguage();
    this.isLanguageMenuOpen = false;
  }

  private setDocumentLanguage() {
    document.documentElement.lang = this.currentLanguage;
    document.documentElement.dir = this.currentLanguage === 'ar' ? 'rtl' : 'ltr';
  }

  // Close language menu when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.langbar')) {
      this.isLanguageMenuOpen = false;
    }
  }
}
