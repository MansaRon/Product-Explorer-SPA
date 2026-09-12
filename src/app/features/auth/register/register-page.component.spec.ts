import { createComponentFactory, mockProvider, Spectator, SpyObject } from '@ngneat/spectator/jest';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';
import { RegisterPageComponent } from './register-page.component';
import { AuthService } from '../../../core/services/auth/auth.service';

describe.skip(RegisterPageComponent.name, () => {
  let spectator: Spectator<RegisterPageComponent>;
  let authService: SpyObject<AuthService>;
  let router: SpyObject<Router>;

  const createComponent = createComponentFactory({
    component: RegisterPageComponent,
    providers: [
      mockProvider(AuthService, {
        isAuthenticated: signal(false),
        register: jest.fn().mockReturnValue(of(void 0)),
      }),
      mockProvider(Router, {
        navigate: jest.fn().mockResolvedValue(true),
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

  it('should call register and navigate to OTP page on success', () => {
    spectator.component['handleSubmit']({
      mode: 'register',
      name: 'Jane',
      email: 'jane@test.com',
      phone: '0821234567',
      password: 'Password1!',
    });

    expect(authService.register).toHaveBeenCalledWith({
      name: 'Jane',
      email: 'jane@test.com',
      phone: '0821234567',
      password: 'Password1!',
    });
    expect(router.navigate).toHaveBeenCalledWith(['/otp-confirmation'], {
      queryParams: { phone: '0821234567' },
    });
  });

  it('should set error on failure', () => {
    authService.register.mockReturnValue(throwError(() => ({ message: 'Email already exists.' })));
    spectator.component['handleSubmit']({
      mode: 'register',
      name: 'Jane',
      email: 'jane@test.com',
      phone: '0821234567',
      password: 'Password1!',
    });
    expect(spectator.component['error']()).toBe('Email already exists.');
    expect(spectator.component['loading']()).toBe(false);
  });
});
