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
      fullName: ['', [Validators.required, Validators.minLength(2)]],
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
    const registerData = {
      tenantName: formData.companyName,
      email: formData.email,
      password: formData.password,
      countryCode: formData.country,
      fullName: formData.fullName,
      phoneNumber: formData.phone,
      username: formData.username
    };

    this.loading = true;

    this.auth.register(registerData).subscribe({
      next: _ => {
        this.loading = false;
        // التوكن محفوظ داخل الخدمة؛ نوجّه المستخدم
        this.router.navigateByUrl('/');
      },
      error: err => {
        this.loading = false;
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

  /**
   * الذهاب إلى صفحة تسجيل الدخول
   */
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
