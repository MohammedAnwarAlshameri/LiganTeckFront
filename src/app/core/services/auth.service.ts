import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface RegisterRequest {
  tenantName: string;
  email: string;
  password: string;
  countryCode?: string; // اختياري - الباك يجعلها SA افتراضيًا
  phoneNumber?: string;
  username?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthState {
  token: string;
  tenantId: number;
  email: string;
  tenantName: string;
}

const BASE = environment.apiBaseUrl.replace(/\/+$/, '');    // https://localhost:7066/api
const AUTH_BASE = `${BASE}/auth`;
const JSON_HEADERS = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  private _state$ = new BehaviorSubject<AuthState | null>(readFromStorage());

  constructor(private http: HttpClient) {}

  /** POST /api/auth/register */
  register(req: RegisterRequest): Observable<AuthState> {
    return this.http.post<any>(`${AUTH_BASE}/register`, req, JSON_HEADERS).pipe(
      map(normalizeLoginResponse),
      tap(persist(this._state$))
    );
  }

  /** POST /api/auth/login */
  login(req: LoginRequest): Observable<AuthState> {
    return this.http.post<any>(`${AUTH_BASE}/login`, req, JSON_HEADERS).pipe(
      map(normalizeLoginResponse),
      tap(persist(this._state$))
    );
  }

  logout(): void {
    localStorage.removeItem('auth');
    localStorage.removeItem('token');
    this._state$.next(null);
  }

  authState$(): Observable<AuthState | null> {
    return this._state$.asObservable();
  }

  get token(): string | null {
    return this._state$.value?.token ?? localStorage.getItem('token');
  }

  get isAuthenticated(): boolean {
    return !!this.token;
  }
}

// ===== Helpers =====
function normalizeLoginResponse(res: any): AuthState {
  const token      = res?.token      ?? res?.Token;
  const tenantId   = res?.tenantId   ?? res?.TenantId;
  const email      = res?.email      ?? res?.Email;
  const tenantName = res?.tenantName ?? res?.TenantName;

  if (!token) throw new Error('Invalid login response: token is missing.');
  return { token, tenantId, email, tenantName };
}

function persist(state$: BehaviorSubject<AuthState | null>) {
  return (state: AuthState) => {
    localStorage.setItem('auth', JSON.stringify(state));
    localStorage.setItem('token', state.token);
    state$.next(state);
  };
}

function readFromStorage(): AuthState | null {
  try {
    const raw = localStorage.getItem('auth');
    return raw ? JSON.parse(raw) as AuthState : null;
  } catch { return null; }
}

