import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map, Observable, shareReplay, tap, throwError } from 'rxjs';
import { User } from '../../models/user';
import { LoginRequest, RegisterRequest } from '../../models/auth';
import { ApiResponse } from '../../models/api-response';
import { AUTH_STORAGE_KEY, AUTH_USER_KEY } from '../../const/service-keys';
import {
  loadFromStorage,
  removeFromStorage,
  saveToStorage,
} from '../../../shared/utils/storage.util';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly currentUserSignal = signal<User | null>(this.loadStoredUser());

  // Dev-only toggle that layers on top of role-based admin check.
  // When a user with the ADMIN role is logged in, the toggle is irrelevant.
  private readonly adminOverrideSignal = signal(this.loadAdminOverride());

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.currentUserSignal());
  readonly isAdmin = computed(
    () => this.currentUserSignal()?.roles?.includes('ADMIN') ?? this.adminOverrideSignal()
  );

  getAccessToken(): string | null {
    return this.currentUserSignal()?.accessToken ?? null;
  }

  login(credentials: LoginRequest): Observable<User> {
    return this.http.post<ApiResponse<User>>('/auth/login', credentials).pipe(
      map((response) => response.data),
      tap((user) => {
        this.currentUserSignal.set(user);
        this.persistUser(user);
      })
    );
  }

  register(request: RegisterRequest): Observable<void> {
    return this.http
      .post<ApiResponse<unknown>>('/auth/register', {
        name: request.name,
        email: request.email,
        phone: request.phone,
        pwd: request.password,
      })
      .pipe(map(() => void 0));
  }

  confirmOtp(phone: string, otp: string): Observable<void> {
    return this.http
      .post<ApiResponse<unknown>>(
        `/auth/confirm/${encodeURIComponent(phone)}/${encodeURIComponent(otp)}`,
        {}
      )
      .pipe(
        map(() => void 0),
        shareReplay({
          bufferSize: 1,
          refCount: true,
        })
      );
  }

  logout(): void {
    this.currentUserSignal.set(null);
    removeFromStorage(AUTH_USER_KEY);
  }

  logoutAndRedirect(): void {
    this.logout();
    this.router.navigate(['/login']);
  }

  // Kept for dev purposes — lets the header toggle admin mode before real role auth is fully wired.
  toggleAdmin(): void {
    const next = !this.adminOverrideSignal();
    this.adminOverrideSignal.set(next);
    this.saveAdminOverride(next);
  }

  refreshToken(): Observable<string> {
    const user = this.currentUserSignal();
    if (!user?.refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http
      .post<ApiResponse<{ accessToken: string }>>('/auth/refresh', {
        refreshToken: user.refreshToken,
      })
      .pipe(
        map((response) => response.data.accessToken),
        tap((newToken) => {
          this.currentUserSignal.update((u) => (u ? { ...u, accessToken: newToken } : null));
          const updated = this.currentUserSignal();
          if (updated) this.persistUser(updated);
        })
      );
  }

  private loadStoredUser(): User | null {
    return loadFromStorage<User | null>(AUTH_USER_KEY, null);
  }

  private persistUser(user: User): void {
    saveToStorage(AUTH_USER_KEY, user);
  }

  private loadAdminOverride(): boolean {
    try {
      return sessionStorage.getItem(AUTH_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  }

  private saveAdminOverride(value: boolean): void {
    try {
      sessionStorage.setItem(AUTH_STORAGE_KEY, value.toString());
    } catch {
      /* ignore */
    }
  }
}
