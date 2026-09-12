import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';
import { AuthFormData } from '../../../core/models/auth';
import { AuthFormComponent } from '../../../shared/components/auth-form/auth-form.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-register-page',
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AuthFormComponent, RouterLink],
})
export class RegisterPageComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  constructor() {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/catalog']);
    }
  }

  protected handleSubmit(data: AuthFormData): void {
    if (data.mode !== 'register') return;

    this.loading.set(true);
    this.error.set(null);

    this.authService
      .register({ name: data.name, email: data.email, phone: data.phone, password: data.password })
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: () => {
          this.router.navigate(['/otp-confirmation'], {
            queryParams: { phone: data.phone },
          });
        },
        error: (err: { message?: string }) => {
          this.error.set(err.message ?? 'Registration failed. Please try again.');
          this.loading.set(false);
        },
      });
  }
}
