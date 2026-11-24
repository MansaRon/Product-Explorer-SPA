import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { CurrencyPipe, NgClass } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminProductListService } from '../../../../core/services/admin/admin-product-list.service';
import { Product } from '../../../../core/models/product';
import { DataTableComponent } from '../../../../shared/components/data-table/data-table.component';
import { TableCellDirective } from '../../../../shared/components/data-table/table-cell.directive';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';
import { SearchInputComponent } from '../../../../shared/components/search-input/search-input.component';
import { TrashIconComponent } from '../../../../shared/components/icons/trash-icon/trash-icon.component';
import { StarRatingPipe } from '../../../../shared/pipes/star-rating.pipe';

@Component({
  selector: 'app-admin-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AdminProductListService],
  imports: [
    CurrencyPipe,
    NgClass,
    ReactiveFormsModule,
    RouterLink,
    DataTableComponent,
    TableCellDirective,
    ConfirmModalComponent,
    SearchInputComponent,
    TrashIconComponent,
    StarRatingPipe,
  ],
  encapsulation: ViewEncapsulation.Emulated,
})
export class ProductListComponent implements OnInit {
  protected readonly list = inject(AdminProductListService);

  protected readonly asProduct = (row: unknown): Product => row as Product;

  ngOnInit(): void {
    this.list.load();
  }
}
