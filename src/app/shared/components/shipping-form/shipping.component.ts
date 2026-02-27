import { ChangeDetectionStrategy, Component, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ShippingAddress, SOUTH_AFRICAN_PROVINCES } from '../../../core/models/checkout';
import { CheckoutValidators, getFormErrorMessage, hasFormError } from '../../utils/validators.util';

@Component({
  selector: 'app-shipping',
  templateUrl: './shipping.component.html',
  styleUrls: ['./shipping.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule]
})
export class ShippingDumbComponent {
  private readonly fb = inject(FormBuilder);

  initialData = input<ShippingAddress | undefined>();
  submitTrigger = input<number>(0);

  formSubmit = output<ShippingAddress>();
  formValidility = output<boolean>();

  protected readonly provinces = SOUTH_AFRICAN_PROVINCES;
  protected readonly form: FormGroup = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    phoneNumber: ['', [Validators.required, CheckoutValidators.saPhoneNumber]],
    email: ['', [Validators.required, Validators.email]],
    streetAddress: ['', [Validators.required, Validators.minLength(5)]],
    apartment: [''],
    city: ['', [Validators.required, Validators.minLength(2)]],
    province: ['', Validators.required],
    postalCode: ['', [Validators.required, CheckoutValidators.saPostalCode]],
    country: ['South Africa']
  });

  constructor() {
    effect(() => {
      const data = this.initialData();
      if (data) {
        this.form.patchValue(data);
      }
    });

    effect(() => {
      this.form.statusChanges.subscribe(() => {
        this.formValidility.emit(this.form.valid);
      });
      this.formValidility.emit(this.form.valid);
    });

    effect(() => {
      const trigger = this.submitTrigger();
      if (trigger > 0) {
        this.onSubmit();
      }
    });
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.markAllTouched();
    } else {
      this.formSubmit.emit(this.form.value as ShippingAddress);  
    }
  }

  protected getErrorMessage(fieldName: string): string {
    return getFormErrorMessage(this.form.get(fieldName), fieldName);
  }

  protected hasError(fieldName: string): boolean {
    return hasFormError(this.form.get(fieldName));
  }
  
  private markAllTouched(): void {
    Object.keys(this.form.controls).forEach(key => {
      this.form.get(key)?.markAsTouched();
    });
  }
}
