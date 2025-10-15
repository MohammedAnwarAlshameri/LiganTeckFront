import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, catchError, exhaustMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Router } from '@angular/router';

import { AuthenticationService, AuthState } from 'src/app/core/services/auth.service';

// لو أكشناتك بهذه الأسماء (كما في ملفك)
import { login, loginSuccess, loginFailure, logout, logoutSuccess, Register } from './authentication.actions';

@Injectable()
export class AuthenticationEffects {

  /** Register -> call API -> navigate -> dispatch loginSuccess(user: AuthState) */
  Register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(Register),
      exhaustMap(({ email, first_name, password }) =>
        // نربط first_name بـ tenantName حسب باك إندك
        this.auth.register({ tenantName: first_name, email, password }).pipe(
          map((state: AuthState) => {
            // الخدمة تحفظ التوكن تلقائياً، نوجّه المستخدم للصفحة الرئيسية
            this.router.navigate(['/']);
            return loginSuccess({ user: state }); // نحافظ على اسم الـ payload (user) كما هو
          }),
          catchError((error) => of(loginFailure({ error: normalizeError(error) })))
        )
      )
    )
  );

  /** Login -> call API -> navigate -> dispatch loginSuccess(user: AuthState) */
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(login),
      exhaustMap(({ email, password }) =>
        this.auth.login({ email, password }).pipe(
          map((state: AuthState) => {
            // الخدمة تحفظ التوكن تلقائياً
            this.router.navigate(['/']);
            return loginSuccess({ user: state }); // user هنا هو AuthState
          }),
          catchError((error) => of(loginFailure({ error: normalizeError(error) })))
        )
      )
    )
  );

  /** Logout -> call service.logout() -> dispatch logoutSuccess */
  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(logout),
      tap(() => { this.auth.logout(); }), // مسح التوكن من التخزين المحلي
      map(() => logoutSuccess())
    )
  );

  constructor(
    private actions$: Actions,
    private auth: AuthenticationService,
    private router: Router
  ) { }
}

/** تطبيع رسالة الخطأ */
function normalizeError(error: any): string {
  return error?.error?.message || error?.message || 'Request failed';
}
