import { Component, HostListener, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { AdminAuthService } from 'src/app/core/services/admin-auth.service';
import { LanguageService } from 'src/app/core/services/language.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm!: UntypedFormGroup;
  submitted = false;
  fieldTextType = false;
  error = '';
  returnUrl = '/';
  loading = false;
  isLanguageMenuOpen = false;
  currentLanguage = 'ar';
  isAdminMode = false; // للتبديل بين تسجيل دخول Admin و Customer

  year: number = new Date().getFullYear();

  constructor(
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private auth: AuthenticationService,
    private adminAuth: AdminAuthService,
    private languageService: LanguageService
  ) {}

  ngOnInit(): void {
    // لو المستخدم مسجّل دخول مسبقًا، رجّعه على returnUrl أو الرئيسية
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/';
    if (this.auth.isAuthenticated) {
      this.router.navigateByUrl(this.returnUrl);
      return;
    }

    // تهيئة اللغة
    this.currentLanguage = this.languageService.getCurrentLanguage();
    this.setDocumentLanguage();

    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      remember: [false]
    });
  }

  // getter مختصر للحقل
  get f() { return this.loginForm.controls; }

  onSubmit() {
    this.submitted = true;
    this.error = '';

    if (this.loginForm.invalid) return;

    const email = this.f['email'].value;
    const password = this.f['password'].value;

    this.loading = true;

    // اختيار الـ service المناسب بناءً على النوع
    const authService = this.isAdminMode ? this.adminAuth : this.auth;

    authService.login({ email, password }).subscribe({
      next: _ => {
        this.loading = false;
        this.router.navigateByUrl(this.returnUrl);
      },
      error: err => {
        this.loading = false;
        // الرسالة قادمة من الباك: { message: "..."} أو نص عام
        this.error = err?.error?.message || err?.message || 'Login failed';
      }
    });
  }

  // دالة للتبديل بين وضع Admin و Customer
  toggleLoginMode() {
    this.isAdminMode = !this.isAdminMode;
    this.error = ''; // مسح أي أخطاء عند التبديل
    this.submitted = false;
  }

  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
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
