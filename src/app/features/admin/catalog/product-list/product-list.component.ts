import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-admin-product-list',
  template: `
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">Catalog</h1>
        <p class="page-description">Add, edit, and manage the product catalog</p>
      </div>
      <app-empty-state
        icon="info"
        title="Coming soon"
        description="Product catalog management is being built and will be available shortly."
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EmptyStateComponent],
})
export class ProductListComponent {}
