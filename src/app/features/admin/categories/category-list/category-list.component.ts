import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-admin-category-list',
  template: `
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">Categories</h1>
        <p class="page-description">Manage product categories</p>
      </div>
      <app-empty-state
        icon="info"
        title="Coming soon"
        description="Category management is being built and will be available shortly."
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EmptyStateComponent],
})
export class CategoryListComponent {}
