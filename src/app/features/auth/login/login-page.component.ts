import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';
import { AuthFormData } from '../../../core/models/auth';
import { AuthFormComponent } from '../../../shared/components/auth-form/auth-form.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AuthFormComponent, RouterLink],
})
export class LoginPageComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destryRef = inject(DestroyRef);

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  constructor() {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/catalog']);
    }
  }

  protected handleSubmit(data: AuthFormData): void {
    if (data.mode !== 'login') return;

    this.loading.set(true);
    this.error.set(null);

    this.authService
      .login({ email: data.email, password: data.password })
      .pipe(takeUntilDestroyed(this.destryRef))
      .subscribe({
        next: () => {
          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/catalog';
          this.router.navigateByUrl(returnUrl);
        },
        error: (err: { message?: string }) => {
          this.error.set(err.message ?? 'Login failed. Please check your credentials.');
          this.loading.set(false);
        },
      });
  }
}
