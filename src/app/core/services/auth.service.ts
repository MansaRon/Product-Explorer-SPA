import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

const AUTH_STORAGE_KEY = 'isAdmin';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly router = inject(Router);
  
  private readonly isAdminSignal = signal(this.loadAdminStatus());
  readonly isAdmin = this.isAdminSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.isAdminSignal());
  
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
