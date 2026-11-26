import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AdminCouponListService } from '../../../../core/services/admin/admin-coupon-list.service';
import { DataTableComponent } from '../../../../shared/components/data-table/data-table.component';
import { TableCellDirective } from '../../../../shared/components/data-table/table-cell.directive';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-admin-coupon-list',
  templateUrl: './coupon-list.component.html',
  styleUrls: ['./coupon-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AdminCouponListService],
  imports: [
    ReactiveFormsModule,
    DataTableComponent,
    TableCellDirective,
    ConfirmModalComponent,
    CurrencyPipe,
    DatePipe,
  ],
  encapsulation: ViewEncapsulation.Emulated,
})
export class CouponListComponent implements OnInit {
  protected readonly list = inject(AdminCouponListService);

  ngOnInit(): void {
    this.list.adminCouponService.loadCoupons();
  }
}
