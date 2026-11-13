import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CurrencyPipe, DatePipe, LowerCasePipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminOrderListService } from '../../../../core/services/admin/admin-order-list.service';
import { AdminOrderApi } from '../../../../core/models/admin-order';
import { DataTableComponent } from '../../../../shared/components/data-table/data-table.component';
import { TableCellDirective } from '../../../../shared/components/data-table/table-cell.directive';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';
import { SearchIconComponent } from '../../../../shared/components/icons/search-icon/search-icon.component';
import { TrashIconComponent } from '../../../../shared/components/icons/trash-icon/trash-icon.component';

@Component({
  selector: 'app-admin-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AdminOrderListService],
  imports: [
    CurrencyPipe,
    DatePipe,
    LowerCasePipe,
    ReactiveFormsModule,
    RouterLink,
    DataTableComponent,
    TableCellDirective,
    ConfirmModalComponent,
    SearchIconComponent,
    TrashIconComponent,
  ],
})
export class OrderListComponent implements OnInit {
  protected readonly list = inject(AdminOrderListService);

  protected readonly asOrder = (row: unknown): AdminOrderApi => row as AdminOrderApi;

  ngOnInit(): void {
    this.list.load();
  }
}
