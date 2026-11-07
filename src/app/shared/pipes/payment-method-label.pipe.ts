import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'paymentMethodLabel', pure: true })
export class PaymentMethodLabelPipe implements PipeTransform {
  transform(method: string): string {
    switch (method?.toUpperCase()) {
      case 'CREDIT_CARD':
        return 'Credit / Debit Card';
      case 'EFT':
        return 'EFT / Bank Transfer';
      case 'CASH_ON_DELIVERY':
        return 'Cash on Delivery';
      default:
        return method ?? '—';
    }
  }
}
