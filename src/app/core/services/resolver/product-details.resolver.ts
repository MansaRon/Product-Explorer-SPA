import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { EMPTY, filter, of, switchMap, take } from 'rxjs';
import { Product } from '../../models/product';
import { ProductService } from '../product/product.service';

export const productDetailsResolver: ResolveFn<Product> = (route) => {
  const productService = inject(ProductService);
  const router = inject(Router);
  const id = route.paramMap.get('id') ?? '';

  return toObservable(productService.loading).pipe(
    filter(loading => !loading),
    take(1),
    switchMap(() => {
      const product = productService.getProductById(id);
      if (!product) {
        router.navigate(['/catalog']);
        return EMPTY;
      }
      return of(product);
    })
  );
};
