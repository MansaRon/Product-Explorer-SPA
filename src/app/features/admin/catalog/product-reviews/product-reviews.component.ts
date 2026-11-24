import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminProductReviewsService } from '../../../../core/services/admin/admin-product-reviews.service';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';
import { StarRatingPipe } from '../../../../shared/pipes/star-rating.pipe';

@Component({
  selector: 'app-admin-product-reviews',
  templateUrl: './product-reviews.component.html',
  styleUrls: ['./product-reviews.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AdminProductReviewsService],
  imports: [DatePipe, RouterLink, ConfirmModalComponent, StarRatingPipe],
  encapsulation: ViewEncapsulation.Emulated,
})
export class ProductReviewsComponent implements OnInit, OnDestroy {
  protected readonly reviews = inject(AdminProductReviewsService);

  ngOnInit(): void {
    this.reviews.loadAll();
  }

  ngOnDestroy(): void {
    this.reviews.adminProductService.clearSelectedProduct();
  }
}
