import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { EMPTY, catchError } from 'rxjs';
import { Product } from '../../models/product';
import { ProductService } from '../product/product.service';

export const productDetailsResolver: ResolveFn<Product> = (route) => {
  const productService = inject(ProductService);
  const router = inject(Router);
  const id = route.paramMap.get('id') ?? '';

  return productService.fetchProductById(id).pipe(
    catchError(() => {
      router.navigate(['/catalog']);
      return EMPTY;
    })
  );
};
