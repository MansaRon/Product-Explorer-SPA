import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'orderStatusClass', pure: true })
export class OrderStatusClassPipe implements PipeTransform {
  transform(status: string): string {
    switch (status?.toUpperCase()) {
      case 'DELIVERED':
        return 'status--delivered';
      case 'SHIPPED':
        return 'status--shipped';
      case 'CONFIRMED':
      case 'PROCESSING':
        return 'status--processing';
      case 'CANCELLED':
      case 'REFUNDED':
        return 'status--cancelled';
      default:
        return 'status--pending';
    }
  }
}
