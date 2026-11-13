import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { CurrencyPipe, DatePipe, LowerCasePipe, TitleCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { AdminOrderService } from '../../../../core/services/admin/admin-order.service';
import { AdminOrderFormService } from '../../../../core/services/admin/admin-order-form.service';
import { ArrowLeftIconComponent } from '../../../../shared/components/icons/arrow-left-icon/arrow-left-icon.component';
import { UserCircleIconComponent } from '../../../../shared/components/icons/user-circle-icon/user-circle-icon.component';
import { CreditCardIconComponent } from '../../../../shared/components/icons/credit-card-icon/credit-card-icon.component';
import { TruckIconComponent } from '../../../../shared/components/icons/truck-icon/truck-icon.component';
import { CheckCircleIconComponent } from '../../../../shared/components/icons/check-circle-icon/check-circle-icon.component';
import { CurrencyIconComponent } from '../../../../shared/components/icons/currency-icon/currency-icon.component';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AdminOrderFormService],
  imports: [
    CurrencyPipe,
    DatePipe,
    LowerCasePipe,
    TitleCasePipe,
    RouterLink,
    ReactiveFormsModule,
    ArrowLeftIconComponent,
    UserCircleIconComponent,
    CreditCardIconComponent,
    TruckIconComponent,
    CheckCircleIconComponent,
    CurrencyIconComponent,
    ConfirmModalComponent,
  ],
})
export class OrderDetailComponent implements OnInit, OnDestroy {
  private readonly adminOrderService = inject(AdminOrderService);
  protected readonly forms = inject(AdminOrderFormService);

  protected readonly order = this.adminOrderService.selectedOrder;
  protected readonly isLoadingDetail = this.adminOrderService.isLoadingDetail;
  protected readonly isMutating = this.adminOrderService.isMutating;

  protected readonly canRebook = computed(() => {
    const s = this.order()?.orderStatus;
    return s === 'CANCELLED' || s === 'REFUNDED';
  });

  protected readonly statusHistory = computed(() =>
    [...(this.order()?.statusHistory ?? [])].reverse()
  );

  ngOnInit(): void {
    this.adminOrderService.loadOrder(this.forms.orderId);
  }

  ngOnDestroy(): void {
    this.adminOrderService.clearSelectedOrder();
  }
}
