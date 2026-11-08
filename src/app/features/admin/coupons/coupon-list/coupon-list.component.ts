import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-admin-coupon-list',
  template: `
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">Coupons</h1>
        <p class="page-description">Create and manage promo codes and discount coupons</p>
      </div>
      <app-empty-state
        icon="info"
        title="Coming soon"
        description="Coupon management is being built and will be available shortly."
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EmptyStateComponent],
})
export class CouponListComponent {}
