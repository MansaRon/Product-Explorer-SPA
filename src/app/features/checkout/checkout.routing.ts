import { Routes } from '@angular/router';
import { AppRoutes } from '../../shared/enums/app-routes-enum';

export const CHECKOUT: Routes = [
  {
    path: AppRoutes.HOME,
    loadComponent: () => import('./checkout.component').then(checkout => checkout.CheckoutComponent),
    children: [
      {
        path: AppRoutes.HOME,
        redirectTo: 'shipping',
        pathMatch: 'full'
      },
      {
        path: AppRoutes.SHIPPING,
        loadComponent: () => import('./shipping-container/shipping.component').then(m => m.ShippingComponent)
      },
      {
        path: AppRoutes.DELIVERY,
        loadComponent: () => import('./delivery-container/delivery.component').then(m => m.DeliveryComponent)
      },
      {
        path: AppRoutes.PAYMENT, 
        loadComponent: () => import('./payment-container/payment.component').then(m => m.PaymentComponent)
      },
      {
        path: AppRoutes.REVIEW,
        loadComponent: () => import('./review-container/review.component').then(m => m.ReviewComponent)
      }
    ]
  }
];

