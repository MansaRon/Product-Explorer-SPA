import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { CurrencyPipe, DatePipe, LowerCasePipe, TitleCasePipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminUserService } from '../../../../core/services/admin/admin-user.service';
import { AdminUserFormService } from '../../../../core/services/admin/admin-user-form.service';
import { DataTableComponent } from '../../../../shared/components/data-table/data-table.component';
import { TableCellDirective } from '../../../../shared/components/data-table/table-cell.directive';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';
import { ArrowLeftIconComponent } from '../../../../shared/components/icons/arrow-left-icon/arrow-left-icon.component';

@Component({
  selector: 'app-admin-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AdminUserFormService],
  imports: [
    CurrencyPipe,
    DatePipe,
    LowerCasePipe,
    TitleCasePipe,
    ReactiveFormsModule,
    RouterLink,
    DataTableComponent,
    TableCellDirective,
    ConfirmModalComponent,
    ArrowLeftIconComponent,
  ],
})
export class UserDetailComponent implements OnInit, OnDestroy {
  protected readonly adminUserService = inject(AdminUserService);
  protected readonly forms = inject(AdminUserFormService);

  protected readonly user = this.adminUserService.selectedUser;
  protected readonly isLoadingDetail = this.adminUserService.isLoadingDetail;
  protected readonly isMutating = this.adminUserService.isMutating;
  protected readonly userOrders = this.adminUserService.userOrders;
  protected readonly isLoadingOrders = this.adminUserService.isLoadingOrders;

  protected readonly isSuspended = computed(() => this.user()?.status === 'SUSPENDED');
  protected readonly userInitials = computed(() => {
    const name = this.user()?.name ?? '';
    return name
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join('');
  });

  ngOnInit(): void {
    this.adminUserService.loadUser(this.forms.userId);
    this.adminUserService.loadUserOrders(this.forms.userId);
  }

  ngOnDestroy(): void {
    this.adminUserService.clearSelectedUser();
  }
}
