import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  input,
  output,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { TableCellDirective } from './table-cell.directive';

export interface TableColumnDef {
  key: string;
  header: string;
  cellClass?: string;
  value?: (row: unknown) => unknown;
}

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
})
export class DataTableComponent {
  readonly columns = input.required<TableColumnDef[]>();
  readonly rows = input.required<unknown[]>();
  readonly totalCount = input<number>(0);
  readonly currentPage = input<number>(0);
  readonly pageSize = input<number>(20);
  readonly isLoading = input<boolean>(false);
  readonly skeletonRowCount = input<number>(8);

  readonly pageChange = output<number>();

  private readonly cellTemplates = contentChildren(TableCellDirective);

  // Map built once per content change — avoids repeated find() in the template.
  protected readonly templateMap = computed(
    () => new Map(this.cellTemplates().map((d) => [d.column(), d.template]))
  );

  protected readonly skeletonRows = computed(() => Array(this.skeletonRowCount()));

  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalCount() / this.pageSize()))
  );
  protected readonly pageStart = computed(() =>
    this.rows().length === 0 ? 0 : this.currentPage() * this.pageSize() + 1
  );
  protected readonly pageEnd = computed(
    () => this.currentPage() * this.pageSize() + this.rows().length
  );

  protected getCellValue(row: unknown, col: TableColumnDef): unknown {
    if (col.value) return col.value(row);
    return (row as Record<string, unknown>)[col.key];
  }

  protected prevPage(): void {
    if (this.currentPage() > 0) this.pageChange.emit(this.currentPage() - 1);
  }

  protected nextPage(): void {
    if (this.currentPage() < this.totalPages() - 1) {
      this.pageChange.emit(this.currentPage() + 1);
    }
  }
}
