import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminProductFormService } from '../../../../core/services/admin/admin-product-form.service';

@Component({
  selector: 'app-admin-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AdminProductFormService],
  imports: [ReactiveFormsModule, RouterLink],
})
export class ProductFormComponent implements OnInit, OnDestroy {
  protected readonly forms = inject(AdminProductFormService);

  ngOnInit(): void {
    if (this.forms.categories().length === 0) {
      this.forms.adminProductService.loadProducts({ page: 0, size: 100 });
    }
    if (this.forms.isEditMode && this.forms.productId) {
      this.forms.adminProductService.loadProduct(this.forms.productId);
    }
  }

  ngOnDestroy(): void {
    this.forms.adminProductService.clearSelectedProduct();
  }
}
