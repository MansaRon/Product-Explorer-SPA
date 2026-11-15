import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AdminCategoryListService } from '../../../../core/services/admin/admin-category-list.service';
import { DataTableComponent } from '../../../../shared/components/data-table/data-table.component';
import { TableCellDirective } from '../../../../shared/components/data-table/table-cell.directive';

@Component({
  selector: 'app-admin-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AdminCategoryListService],
  imports: [ReactiveFormsModule, DataTableComponent, TableCellDirective],
})
export class CategoryListComponent implements OnInit {
  protected readonly list = inject(AdminCategoryListService);

  ngOnInit(): void {
    this.list.adminCategoryService.loadCategories();
  }
}
