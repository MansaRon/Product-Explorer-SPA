import { createComponentFactory, mockProvider, Spectator, SpyObject } from '@ngneat/spectator/jest';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';
import { LoginPageComponent } from './login-page.component';
import { AuthService } from '../../../core/services/auth/auth.service';
import { fromPartial } from '@total-typescript/shoehorn';
import { User } from '../../../core/models/user';

describe.skip(LoginPageComponent.name, () => {
  let spectator: Spectator<LoginPageComponent>;
  let authService: SpyObject<AuthService>;
  let router: SpyObject<Router>;

  const mockUser: User = fromPartial({ id: '1', name: 'Jane', email: 'jane@test.com', roles: [] });

  const createComponent = createComponentFactory({
    component: LoginPageComponent,
    providers: [
      mockProvider(AuthService, {
        isAuthenticated: signal(false),
        login: jest.fn().mockReturnValue(of(mockUser)),
      }),
      mockProvider(Router, {
        navigate: jest.fn().mockResolvedValue(true),
        navigateByUrl: jest.fn().mockResolvedValue(true),
      }),
      mockProvider(ActivatedRoute, {
        snapshot: { queryParamMap: { get: jest.fn().mockReturnValue(null) } },
      }),
    ],
    shallow: true,
    detectChanges: false,
  });

  beforeEach(() => {
    spectator = createComponent();
    authService = spectator.inject(AuthService);
    router = spectator.inject(Router);
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });

  it('should navigate to catalog on successful login', () => {
    spectator.component['handleSubmit']({
      mode: 'login',
      email: 'jane@test.com',
      password: 'pass123',
    });
    expect(authService.login).toHaveBeenCalledWith({ email: 'jane@test.com', password: 'pass123' });
    expect(router.navigateByUrl).toHaveBeenCalledWith('/catalog');
  });

  it('should set error signal when login fails', () => {
    authService.login.mockReturnValue(throwError(() => ({ message: 'Invalid credentials' })));
    spectator.component['handleSubmit']({
      mode: 'login',
      email: 'bad@test.com',
      password: 'wrong',
    });
    expect(spectator.component['error']()).toBe('Invalid credentials');
  });

  it('should reset loading on error', () => {
    authService.login.mockReturnValue(throwError(() => ({})));
    spectator.component['handleSubmit']({
      mode: 'login',
      email: 'bad@test.com',
      password: 'wrong',
    });
    expect(spectator.component['loading']()).toBe(false);
  });

  it('should navigate to returnUrl when present', () => {
    const route = spectator.inject(ActivatedRoute);
    route.snapshot.queryParamMap.get = jest.fn().mockReturnValue('/checkout');
    spectator.component['handleSubmit']({
      mode: 'login',
      email: 'jane@test.com',
      password: 'pass123',
    });
    expect(router.navigateByUrl).toHaveBeenCalledWith('/checkout');
  });
});
