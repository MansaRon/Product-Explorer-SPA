import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, timer } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AdminUserService } from './admin-user.service';
import { AdminUserApi } from '../../models/admin-user';
import { TableColumnDef } from '../../../shared/components/data-table/data-table.component';

@Injectable()
export class AdminUserListService {
  private readonly adminUserService = inject(AdminUserService);
  private readonly destroyRef = inject(DestroyRef);

  readonly users = this.adminUserService.users;
  readonly totalCount = this.adminUserService.totalCount;
  readonly isLoading = this.adminUserService.isLoading;
  readonly statusOptions = this.adminUserService.statusOptions;

  readonly currentPage = computed(() => this.adminUserService.currentParams().page ?? 0);
  readonly pageSize = computed(() => this.adminUserService.currentParams().size ?? 20);

  readonly searchControl = new FormControl('');
  readonly statusFilter = signal('ALL');

  readonly showBlockConfirm = signal(false);
  readonly showUnblockConfirm = signal(false);
  readonly pendingUserId = signal<string | null>(null);
  readonly actionMessage = signal<{ ok: boolean; text: string } | null>(null);

  readonly columns: TableColumnDef[] = [
    { key: 'name', header: 'Name', cellClass: 'td--name' },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone' },
    { key: 'roles', header: 'Roles' },
    { key: 'status', header: 'Status' },
    { key: 'createdAt', header: 'Joined' },
    { key: 'actions', header: '', cellClass: 'td--action' },
  ];

  constructor() {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
        switchMap((value) => {
          this.adminUserService.loadUsers({ search: value ?? '', page: 0 });
          return [];
        })
      )
      .subscribe();
  }

  load(): void {
    this.statusFilter.set('ALL');
    this.searchControl.setValue('', { emitEvent: false });
    this.adminUserService.loadUsers({ page: 0, size: 20, status: undefined, search: undefined });
  }

  goToPage(page: number): void {
    this.adminUserService.loadUsers({ page });
  }

  onStatusChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.statusFilter.set(value);
    this.adminUserService.loadUsers({
      status: value === 'ALL' ? undefined : value,
      page: 0,
    });
  }

  openBlockConfirm(userId: string): void {
    this.pendingUserId.set(userId);
    this.showBlockConfirm.set(true);
  }

  cancelBlock(): void {
    this.showBlockConfirm.set(false);
    this.pendingUserId.set(null);
  }

  executeBlock(): void {
    const id = this.pendingUserId();
    if (!id) return;
    this.showBlockConfirm.set(false);
    this.pendingUserId.set(null);
    this.adminUserService.blockUser(id).subscribe({
      next: () => {
        this.adminUserService.loadUsers({ page: 0 });
        this.flash(true, 'User has been blocked.');
      },
      error: () => this.flash(false, 'Failed to block user.'),
    });
  }

  openUnblockConfirm(userId: string): void {
    this.pendingUserId.set(userId);
    this.showUnblockConfirm.set(true);
  }

  cancelUnblock(): void {
    this.showUnblockConfirm.set(false);
    this.pendingUserId.set(null);
  }

  executeUnblock(): void {
    const id = this.pendingUserId();
    if (!id) return;
    this.showUnblockConfirm.set(false);
    this.pendingUserId.set(null);
    this.adminUserService.unblockUser(id).subscribe({
      next: () => {
        this.adminUserService.loadUsers({ page: 0 });
        this.flash(true, 'User has been unblocked.');
      },
      error: () => this.flash(false, 'Failed to unblock user.'),
    });
  }

  asUser(row: unknown): AdminUserApi {
    return row as AdminUserApi;
  }

  private flash(ok: boolean, text: string): void {
    this.actionMessage.set({ ok, text });
    timer(5000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.actionMessage.set(null));
  }
}
