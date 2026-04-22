import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AUTH_STORAGE_KEY } from '../../const/service-keys';
import { Observable, of } from 'rxjs';

const MOCK_ACCESS_TOKEN = 'mock-access-token.dev-only';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly router = inject(Router);
  
  private readonly isAdminSignal = signal(this.loadAdminStatus());
  readonly isAdmin = this.isAdminSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.isAdminSignal());

    /**
   * Returns the current access token.
   * Returns null when not authenticated so the interceptor skips the header.
   *
   * TODO (Railway integration):
   *   Read the real JWT from an in-memory store or a secure cookie.
   *   Avoid localStorage for tokens — httpOnly cookies are ideal.
   */
    getAccessToken(): string | null {
      return this.isAuthenticated() ? MOCK_ACCESS_TOKEN : null;
    }
   
    /**
     * Simulates a silent token refresh.
     * Emits the mock token immediately so the interceptor's switchMap works.
     *
     * TODO (Railway integration): replace with:
     *   return this.http.post<{ accessToken: string }>(
     *     '/auth/refresh',
     *     { refreshToken: this.storedRefreshToken }
     *   ).pipe(map(res => res.accessToken));
     */
    refreshToken(): Observable<string> {
      console.warn('[AuthService] Mock refreshToken() called — returning static token.');
      return of(MOCK_ACCESS_TOKEN);
    }
  
  private loadAdminStatus(): boolean {
    try {
      return sessionStorage.getItem(AUTH_STORAGE_KEY) === 'true';
    } catch (error) {
      console.error('Error loading admin status:', error);
      return false;
    }
  }
  
  private saveAdminStatus(status: boolean): void {
    try {
      sessionStorage.setItem(AUTH_STORAGE_KEY, status.toString());
    } catch (error) {
      console.error('Error saving admin status:', error);
    }
  }
  
  login(): void {
    this.isAdminSignal.set(true);
    this.saveAdminStatus(true);
  }
  
  logout(): void {
    this.isAdminSignal.set(false);
    this.saveAdminStatus(false);
  }
  
  toggleAdmin(): void {
    const newValue = !this.isAdminSignal();
    this.isAdminSignal.set(newValue);
    this.saveAdminStatus(newValue);
  }
  
  logoutAndRedirect(): void {
    this.logout();
    this.router.navigate(['/catalog']);
  }
}
