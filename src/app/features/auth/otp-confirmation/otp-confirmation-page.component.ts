import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth/auth.service';
import { getFormErrorMessage, hasFormError } from '../../../shared/utils/validators.util';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-otp-confirmation-page',
  templateUrl: './otp-confirmation-page.component.html',
  styleUrls: ['./otp-confirmation-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink],
})
export class OtpConfirmationPageComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  protected readonly phone = this.route.snapshot.queryParamMap.get('phone') ?? '';

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this.fb.group({
    otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
  });

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.get('otp')?.markAsTouched();
      return;
    }

    if (!this.phone) {
      this.error.set('Phone number missing. Please register again.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.authService
      .confirmOtp(this.phone, this.form.value.otp!)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: () => {
          this.router.navigate(['/login'], {
            queryParams: { confirmed: 'true' },
          });
        },
        error: (err: { message?: string }) => {
          this.error.set(err.message ?? 'Invalid OTP. Please try again.');
          this.loading.set(false);
        },
      });
  }

  protected getErrorMessage(field: string): string {
    return getFormErrorMessage(this.form.get(field));
  }

  protected hasError(field: string): boolean {
    return hasFormError(this.form.get(field));
  }
}
