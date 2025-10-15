import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  private base = environment.apiBaseUrl.replace(/\/+$/, ''); // https://localhost:7066/api

  constructor(private auth: AuthenticationService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // استثنِ طلبات الدخول/التسجيل
    const isAuthEndpoint =
      request.url.startsWith(`${this.base}/auth/login`) ||
      request.url.startsWith(`${this.base}/auth/register`) ||
      request.url.startsWith(`${this.base}/admin/auth/login`);

    if (!isAuthEndpoint) {
      const token = this.auth.token; // مأخوذ من localStorage أو الحالة الحالية
      if (token) {
        request = request.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
      }
    }

    return next.handle(request);
  }
}

//قراءة التوكن الحقيقي فقط
/*@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private auth: AuthenticationService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const user = this.auth.currentUser(); // يجب أن يعيد { token: string } عند تسجيل الدخول
    if (user?.token) {
      req = req.clone({ setHeaders: { Authorization: `Bearer ${user.token}` } });
    }
    return next.handle(req);
  }
}*/