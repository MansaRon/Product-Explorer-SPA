import { Routes } from '@angular/router';

export const CHECKOUT: Routes = [
  {
    path: '',
    loadComponent: () => import('./checkout.component').then(checkout => checkout.CheckoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'shipping',
        pathMatch: 'full'
      },
      {
        path: 'shipping',
        loadComponent: () => import('./shipping-container/shipping.component').then(m => m.ShippingComponent)
      },
      {
        path: 'delivery',
        loadComponent: () => import('./delivery-container/delivery.component').then(m => m.DeliveryComponent)
      },
      {
        path: 'payment', 
        loadComponent: () => import('./payment-container/payment.component').then(m => m.PaymentComponent)
      },
      {
        path: 'review',
        loadComponent: () => import('./review-container/review.component').then(m => m.ReviewComponent)
      }
    ]
  }
];

