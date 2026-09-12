import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthFormData, AuthMode } from '../../../core/models/auth';
import {
  CheckoutValidators,
  getFormErrorMessage,
  hasFormError,
  passwordMatchValidator,
} from '../../utils/validators.util';

@Component({
  selector: 'app-auth-form',
  templateUrl: './auth-form.component.html',
  styleUrls: ['./auth-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
})
export class AuthFormComponent {
  private readonly fb = inject(FormBuilder);

  readonly mode = input.required<AuthMode>();
  readonly loading = input<boolean>(false);
  readonly error = input<string | null>(null);

  readonly formSubmit = output<AuthFormData>();

  protected readonly form = this.fb.group(
    {
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, CheckoutValidators.saPhoneNumber]],
      password: ['', [Validators.required, Validators.minLength(4)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordMatchValidator }
  );

  constructor() {
    effect(() => this.applyModeControls(this.mode()));
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.markAllTouched();
      return;
    }

    const mode = this.mode();
    const v = this.form.value;

    if (mode === 'login') {
      this.formSubmit.emit({ mode, email: v.email!, password: v.password! });
    } else if (mode === 'register') {
      this.formSubmit.emit({
        mode,
        name: v.name!,
        email: v.email!,
        phone: v.phone!,
        password: v.password!,
      });
    } else {
      this.formSubmit.emit({ mode: 'forgot-password', email: v.email! });
    }
  }

  protected getErrorMessage(field: string): string {
    return getFormErrorMessage(this.form.get(field));
  }

  protected hasError(field: string): boolean {
    return hasFormError(this.form.get(field));
  }

  protected get hasPasswordMismatch(): boolean {
    const confirm = this.form.get('confirmPassword');
    return !!(confirm?.touched && this.form.hasError('passwordMismatch'));
  }

  private applyModeControls(mode: AuthMode): void {
    const registerOnly = ['name', 'phone', 'confirmPassword'];
    const passwordControl = this.form.get('password');

    if (mode === 'login') {
      registerOnly.forEach((c) => this.form.get(c)?.disable());
      passwordControl?.enable();
    } else if (mode === 'register') {
      registerOnly.forEach((c) => this.form.get(c)?.enable());
      passwordControl?.enable();
    } else {
      registerOnly.forEach((c) => this.form.get(c)?.disable());
      passwordControl?.disable();
    }

    this.form.reset();
  }

  private markAllTouched(): void {
    Object.keys(this.form.controls).forEach((key) => this.form.get(key)?.markAsTouched());
  }
}
