import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminAuthState {
  token: string;
  tenantId: number;
  email: string;
  tenantName: string; // في حالة Admin، هذا سيكون DisplayName
  userType?: string;  // للتمييز بين Admin و Tenant
  role?: string;      // الدور (Admin)
}

const BASE = environment.apiBaseUrl.replace(/\/+$/, '');    // https://localhost:7066/api
const ADMIN_AUTH_BASE = `${BASE}/admin/auth`;
const JSON_HEADERS = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };

@Injectable({ providedIn: 'root' })
export class AdminAuthService {
  private _state$ = new BehaviorSubject<AdminAuthState | null>(readAdminFromStorage());

  constructor(private http: HttpClient) {}

  /** POST /api/admin/auth/login */
  login(req: AdminLoginRequest): Observable<AdminAuthState> {
    return this.http.post<any>(`${ADMIN_AUTH_BASE}/login`, req, JSON_HEADERS).pipe(
      map(normalizeAdminLoginResponse),
      tap(persistAdmin(this._state$))
    );
  }

  logout(): void {
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('token'); // للتوافق مع النظام الحالي
    this._state$.next(null);
  }

  authState$(): Observable<AdminAuthState | null> {
    return this._state$.asObservable();
  }

  get token(): string | null {
    return this._state$.value?.token ?? localStorage.getItem('adminToken') ?? localStorage.getItem('token');
  }

  get isAuthenticated(): boolean {
    return !!this.token;
  }

  get currentUser(): AdminAuthState | null {
    return this._state$.value;
  }

  get isAdmin(): boolean {
    const state = this._state$.value;
    return state?.userType === 'Admin' || state?.role === 'Admin';
  }
}

// ===== Helpers =====
function normalizeAdminLoginResponse(res: any): AdminAuthState {
  const token      = res?.token      ?? res?.Token;
  const tenantId   = res?.tenantId   ?? res?.TenantId   ?? 0;
  const email      = res?.email      ?? res?.Email;
  const tenantName = res?.tenantName ?? res?.TenantName;

  if (!token) throw new Error('Invalid admin login response: token is missing.');
  
  return { 
    token, 
    tenantId, 
    email, 
    tenantName,
    userType: 'Admin',
    role: 'Admin'
  };
}

function persistAdmin(state$: BehaviorSubject<AdminAuthState | null>) {
  return (state: AdminAuthState) => {
    localStorage.setItem('adminAuth', JSON.stringify(state));
    localStorage.setItem('adminToken', state.token);
    localStorage.setItem('token', state.token); // للتوافق مع النظام الحالي
    state$.next(state);
  };
}

function readAdminFromStorage(): AdminAuthState | null {
  try {
    const raw = localStorage.getItem('adminAuth');
    if (raw) return JSON.parse(raw) as AdminAuthState;
    
    // fallback: إذا كان المستخدم مسجل دخول كـ admin في النظام القديم
    const oldAuth = localStorage.getItem('auth');
    if (oldAuth) {
      const parsed = JSON.parse(oldAuth);
      if (parsed.userType === 'Admin' || parsed.role === 'Admin') {
        return parsed as AdminAuthState;
      }
    }
    return null;
  } catch { 
    return null; 
  }
}

