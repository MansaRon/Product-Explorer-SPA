import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, timer } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AdminOrderService } from './admin-order.service';
import { AdminOrderApi } from '../../models/admin-order';
import { TableColumnDef } from '../../../shared/components/data-table/data-table.component';

@Injectable()
export class AdminOrderListService {
  private readonly adminOrderService = inject(AdminOrderService);
  private readonly destroyRef = inject(DestroyRef);

  // Pass-through reads so the template only needs one service reference
  readonly orders = this.adminOrderService.orders;
  readonly totalCount = this.adminOrderService.totalCount;
  readonly isLoading = this.adminOrderService.isLoading;
  readonly statusOptions = this.adminOrderService.statusOptions;

  // Current page / size — passed to the table as inputs
  readonly currentPage = computed(() => this.adminOrderService.currentParams().page ?? 0);
  readonly pageSize = computed(() => this.adminOrderService.currentParams().size ?? 20);

  // Filter state
  readonly searchControl = new FormControl('');
  readonly statusFilter = signal('ALL');

  // Confirmation / feedback
  readonly showDeleteConfirm = signal(false);
  readonly deleteMessage = signal<{ ok: boolean; text: string } | null>(null);

  // Column definitions — the table component computes totals / pagination internally
  readonly columns: TableColumnDef[] = [
    { key: 'orderNumber', header: 'Order #', cellClass: 'td--mono' },
    {
      key: 'customer',
      header: 'Customer',
      cellClass: 'td--name',
      value: (row) => (row as AdminOrderApi).customerInfo?.name ?? '—',
    },
    { key: 'orderStatus', header: 'Status' },
    { key: 'totalAmount', header: 'Total', cellClass: 'td--price' },
    { key: 'createdAt', header: 'Date' },
    { key: 'actions', header: '' },
  ];

  constructor() {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
        switchMap((value) => {
          this.adminOrderService.loadOrders({ search: value ?? '', page: 0 });
          return [];
        })
      )
      .subscribe();
  }

  load(): void {
    this.adminOrderService.loadOrders();
  }

  goToPage(page: number): void {
    this.adminOrderService.loadOrders({ page });
  }

  onStatusChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.statusFilter.set(value);
    this.adminOrderService.loadOrders({
      status: value === 'ALL' ? undefined : value,
      page: 0,
    });
  }

  openDeleteConfirm(): void {
    this.showDeleteConfirm.set(true);
  }

  cancelDelete(): void {
    this.showDeleteConfirm.set(false);
  }

  executeDeleteStale(): void {
    this.showDeleteConfirm.set(false);
    this.adminOrderService.deleteStale().subscribe({
      next: (msg) => {
        this.deleteMessage.set({ ok: true, text: msg });
        this.adminOrderService.loadOrders({ page: 0 });
        timer(5000)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => this.deleteMessage.set(null));
      },
      error: () => {
        this.deleteMessage.set({ ok: false, text: 'Failed to delete stale orders.' });
        timer(5000)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => this.deleteMessage.set(null));
      },
    });
  }
}
