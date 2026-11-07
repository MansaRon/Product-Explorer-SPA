import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'shippingMethodLabel', pure: true })
export class ShippingMethodLabelPipe implements PipeTransform {
  transform(method: string): string {
    switch (method?.toUpperCase()) {
      case 'EXPRESS':
        return 'Express Delivery (2–3 days)';
      case 'OVERNIGHT':
        return 'Overnight Delivery (next day)';
      case 'FREE':
        return 'Free Delivery (5–7 days)';
      default:
        return 'Standard Delivery (5–7 days)';
    }
  }
}
