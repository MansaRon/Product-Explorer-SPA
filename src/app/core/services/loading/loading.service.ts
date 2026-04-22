import { computed, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private activeRequests = signal(0);
  isLoading = computed(() => this.activeRequests() > 0);

  increment() { this.activeRequests.update(n => n + 1); }
  decrement() { this.activeRequests.update(n => Math.max(0, n - 1)); }
}
