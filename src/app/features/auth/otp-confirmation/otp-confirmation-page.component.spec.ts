import { createComponentFactory, mockProvider, Spectator, SpyObject } from '@ngneat/spectator/jest';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { OtpConfirmationPageComponent } from './otp-confirmation-page.component';
import { AuthService } from '../../../core/services/auth/auth.service';

describe.skip(OtpConfirmationPageComponent.name, () => {
  let spectator: Spectator<OtpConfirmationPageComponent>;
  let authService: SpyObject<AuthService>;
  let router: SpyObject<Router>;

  const createComponent = createComponentFactory({
    component: OtpConfirmationPageComponent,
    providers: [
      mockProvider(AuthService, {
        confirmOtp: jest.fn().mockReturnValue(of(void 0)),
      }),
      mockProvider(Router, {
        navigate: jest.fn().mockResolvedValue(true),
      }),
      mockProvider(ActivatedRoute, {
        snapshot: { queryParamMap: { get: jest.fn().mockReturnValue('0821234567') } },
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

  it('should read phone from query params', () => {
    expect(spectator.component['phone']).toBe('0821234567');
  });

  it('should call confirmOtp and navigate to login on success', () => {
    spectator.component['form'].patchValue({ otp: '123456' });
    spectator.component['onSubmit']();

    expect(authService.confirmOtp).toHaveBeenCalledWith('0821234567', '123456');
    expect(router.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { confirmed: 'true' },
    });
  });

  it('should set error on invalid OTP', () => {
    authService.confirmOtp.mockReturnValue(throwError(() => ({ message: 'Invalid OTP.' })));
    spectator.component['form'].patchValue({ otp: '000000' });
    spectator.component['onSubmit']();

    expect(spectator.component['error']()).toBe('Invalid OTP.');
    expect(spectator.component['loading']()).toBe(false);
  });

  it('should not submit when form is invalid', () => {
    spectator.component['onSubmit']();
    expect(authService.confirmOtp).not.toHaveBeenCalled();
  });
});
