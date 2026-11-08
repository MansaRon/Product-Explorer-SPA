import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-admin-order-list',
  template: `
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">Orders</h1>
        <p class="page-description">Manage and monitor all orders across the platform</p>
      </div>
      <app-empty-state
        icon="info"
        title="Coming soon"
        description="Order management is being built and will be available shortly."
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EmptyStateComponent],
})
export class OrderListComponent {}
