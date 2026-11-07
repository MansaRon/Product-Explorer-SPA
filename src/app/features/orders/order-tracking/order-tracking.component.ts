import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order/order.service';
import { NotificationService } from '../../../core/services/notification/notification.service';
import { AppRoutes } from '../../../shared/enums/app-routes-enum';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { OrderStatusClassPipe } from '../../../shared/pipes/order-status-class.pipe';
import { ShippingMethodLabelPipe } from '../../../shared/pipes/shipping-method-label.pipe';

const STEP_ORDER = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] as const;

const STEP_LABELS: Record<string, string> = {
  PENDING: 'Order Placed',
  CONFIRMED: 'Order Confirmed',
  PROCESSING: 'Preparing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
};

interface StepViewModel {
  step: string;
  label: string;
  timestamp: string | undefined;
  stepClass: 'step--completed' | 'step--active' | 'step--inactive';
  connectorClass: 'connector--completed' | '';
}

@Component({
  selector: 'app-order-tracking',
  templateUrl: './order-tracking.component.html',
  styleUrls: ['./order-tracking.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    RouterLink,
    LoaderComponent,
    EmptyStateComponent,
    OrderStatusClassPipe,
    ShippingMethodLabelPipe,
  ],
})
export class OrderTrackingComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly orderService = inject(OrderService);
  private readonly notifications = inject(NotificationService);

  protected readonly trackingData = this.orderService.trackingData;
  protected readonly isLoading = this.orderService.isLoadingTracking;

  protected readonly orderId = signal('');
  protected readonly showCancelForm = signal(false);
  protected cancelReason = '';
  protected readonly isCancelling = signal(false);

  protected readonly detailRoute = computed(() => `/${AppRoutes.ORDERS}/${this.orderId()}`);

  protected readonly isCancellable = computed(() => this.trackingData()?.cancellable ?? false);

  protected readonly isTerminal = computed(() => {
    const s = this.trackingData()?.currentStatus ?? '';
    return s === 'CANCELLED' || s === 'REFUNDED';
  });

  private readonly currentStepIndex = computed(() => {
    const status = this.trackingData()?.currentStatus ?? '';
    return STEP_ORDER.indexOf(status as (typeof STEP_ORDER)[number]);
  });

  protected readonly computedSteps = computed<StepViewModel[]>(() => {
    const data = this.trackingData();
    const terminal = this.isTerminal();
    const currentIdx = this.currentStepIndex();

    return STEP_ORDER.map((step, i) => {
      let stepClass: StepViewModel['stepClass'];
      if (terminal || currentIdx === -1) {
        stepClass = 'step--inactive';
      } else if (i < currentIdx) {
        stepClass = 'step--completed';
      } else if (i === currentIdx) {
        stepClass = 'step--active';
      } else {
        stepClass = 'step--inactive';
      }

      return {
        step,
        label: STEP_LABELS[step] ?? step,
        timestamp: data?.history?.find((h) => h.status === step)?.timestamp,
        stepClass,
        connectorClass:
          !terminal && currentIdx !== -1 && i < currentIdx ? 'connector--completed' : '',
      };
    });
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      void this.router.navigate([AppRoutes.ORDERS]);
      return;
    }
    this.orderId.set(id);
    this.orderService.loadTrackingData(id);
  }

  protected onCancelReasonInput(event: Event): void {
    this.cancelReason = (event.target as HTMLTextAreaElement).value;
  }

  protected confirmCancel(): void {
    this.isCancelling.set(true);
    const id = this.orderId();
    this.orderService.cancelOrder(id, this.cancelReason || undefined, {
      onSuccess: () => {
        this.isCancelling.set(false);
        this.showCancelForm.set(false);
        this.cancelReason = '';
        this.notifications.success('Your order has been cancelled.');
        this.orderService.refreshOrders();
        this.orderService.loadTrackingData(id);
      },
      onError: (msg) => {
        this.isCancelling.set(false);
        this.notifications.error(msg);
      },
    });
  }
}
