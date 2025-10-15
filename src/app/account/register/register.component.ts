import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  signupForm!: UntypedFormGroup;
  submitted = false;
  loading = false;
  error = '';
  fieldTextType = false;

  // السنة الحالية للواجهة
  year: number = new Date().getFullYear();

  constructor(
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private auth: AuthenticationService
  ) {}

  ngOnInit(): void {
    // لو المستخدم مسجّل دخول، وجّهه مباشرة
    if (this.auth.isAuthenticated) {
      this.router.navigateByUrl('/');
      return;
    }

    // بناء النموذج
    this.signupForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      name: ['', [Validators.required]],         // سنمرّرها كـ tenantName
      password: ['', [Validators.required]],     // عندك pattern في الـ HTML بالفعل
    });
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

    const email = this.f['email'].value;
    const tenantName = this.f['name'].value;
    const password = this.f['password'].value;

    this.loading = true;

    this.auth.register({ tenantName, email, password }).subscribe({
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
}
