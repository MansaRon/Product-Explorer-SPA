import { AbstractControl, ValidationErrors } from '@angular/forms';

export class CheckoutValidators {

  static saPhoneNumber(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    const valid = /^0[0-9]{9}$/.test(control.value);
    return valid ? null : { saPhoneNumber: true };
  }

  static saPostalCode(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    const valid = /^[0-9]{4}$/.test(control.value);
    return valid ? null : { saPostalCode: true };
  }
}

export function getFormErrorMessage(
  control: AbstractControl | null,
  fieldName?: string
): string {
  if (!control || !control.touched || !control.errors) {
    return '';
  }

  const errors = control.errors;

  if (errors['required']) {
    return 'This field is required';
  }

  if (errors['email']) {
    return 'Please enter a valid email address';
  }

  if (errors['saPhoneNumber']) {
    return 'Please enter a valid SA phone number (e.g., 0821234567)';
  }

  if (errors['saPostalCode']) {
    return 'Please enter a valid 4-digit postal code';
  }

  if (errors['minlength']) {
    const required = errors['minlength'].requiredLength;
    return `Must be at least ${required} characters`;
  }

  if (errors['maxlength']) {
    const required = errors['maxlength'].requiredLength;
    return `Must not exceed ${required} characters`;
  }

  if (errors['pattern']) {
    return `Invalid format`;
  }

  return 'Invalid value';
}

export function hasFormError(control: AbstractControl | null): boolean {
  return !!(control && control.invalid && control.touched);
}