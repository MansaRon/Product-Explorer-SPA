import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'starRating', pure: true })
export class StarRatingPipe implements PipeTransform {
  transform(rate: number): string {
    const filled = Math.min(5, Math.max(0, Math.round(rate ?? 0)));
    return '★'.repeat(filled) + '☆'.repeat(5 - filled);
  }
}
