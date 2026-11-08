import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-admin-user-list',
  template: `
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">Users</h1>
        <p class="page-description">View and manage all registered users</p>
      </div>
      <app-empty-state
        icon="info"
        title="Coming soon"
        description="User management is being built and will be available shortly."
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EmptyStateComponent],
})
export class UserListComponent {}
