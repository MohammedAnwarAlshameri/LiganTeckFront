import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  loginForm!: UntypedFormGroup;
  submitted = false;
  fieldTextType = false;
  error = '';
  returnUrl = '/';
  loading = false;

  year: number = new Date().getFullYear();

  constructor(
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private auth: AuthenticationService
  ) {}

  ngOnInit(): void {
    // لو المستخدم مسجّل دخول مسبقًا، رجّعه على returnUrl أو الرئيسية
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/';
    if (this.auth.isAuthenticated) {
      this.router.navigateByUrl(this.returnUrl);
      return;
    }

    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
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

    this.auth.login({ email, password }).subscribe({
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

  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }
}
