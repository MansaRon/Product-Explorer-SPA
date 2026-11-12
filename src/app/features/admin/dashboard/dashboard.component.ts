import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe, LowerCasePipe, PercentPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product/product.service';
import { AdminStatsService } from '../../../core/services/admin/admin-stats.service';
import { AppRoutes } from '../../../shared/enums/app-routes-enum';
import { SalesChartComponent } from '../../../shared/components/charts/sales-chart/sales-chart.component';
import { TableIconComponent } from '../../../shared/components/icons/table-icon/table-icon.component';
import { CurrencyIconComponent } from '../../../shared/components/icons/currency-icon/currency-icon.component';
import { AlertTriangleIconComponent } from '../../../shared/components/icons/alert-triangle-icon/alert-triangle-icon.component';
import { XCircleIconComponent } from '../../../shared/components/icons/x-circle-icon/x-circle-icon.component';
import { StarIconComponent } from '../../../shared/components/icons/star-icon/star-icon.component';
import { UserCircleIconComponent } from '../../../shared/components/icons/user-circle-icon/user-circle-icon.component';
import { BanknoteIconComponent } from '../../../shared/components/icons/banknote-icon/banknote-icon.component';
import { TruckIconComponent } from '../../../shared/components/icons/truck-icon/truck-icon.component';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CurrencyPipe,
    DatePipe,
    PercentPipe,
    RouterLink,
    SalesChartComponent,
    TableIconComponent,
    CurrencyIconComponent,
    AlertTriangleIconComponent,
    XCircleIconComponent,
    StarIconComponent,
    UserCircleIconComponent,
    BanknoteIconComponent,
    TruckIconComponent,
    LowerCasePipe,
    DecimalPipe,
  ],
})
export class DashboardComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly adminStatsService = inject(AdminStatsService);

  protected readonly adminRoutes = {
    orders: `/${AppRoutes.ADMIN}/${AppRoutes.ADMIN_ORDERS}`,
    catalog: `/${AppRoutes.ADMIN}/${AppRoutes.ADMIN_CATALOG}`,
  };

  protected readonly stats = this.adminStatsService.stats;
  protected readonly isLoading = this.adminStatsService.isLoading;
  protected readonly recentOrders = this.adminStatsService.recentOrders;
  protected readonly isLoadingOrders = this.adminStatsService.isLoadingOrders;

  protected readonly salesByDay = computed(() => this.stats()?.salesByDay ?? []);
  protected readonly topProducts = computed(() => this.stats()?.topSellingProducts ?? []);

  protected readonly statusBreakdown = computed(() => {
    const s = this.stats();
    if (!s) return [];
    const total = s.totalOrders || 1;
    return [
      {
        label: 'Delivered',
        count: s.deliveredOrders,
        pct: s.deliveredOrders / total,
        mod: 'success',
      },
      {
        label: 'Confirmed',
        count: s.confirmedOrders,
        pct: s.confirmedOrders / total,
        mod: 'primary',
      },
      {
        label: 'Processing',
        count: s.processingOrders,
        pct: s.processingOrders / total,
        mod: 'info',
      },
      { label: 'Shipped', count: s.shippedOrders, pct: s.shippedOrders / total, mod: 'secondary' },
      { label: 'Pending', count: s.pendingOrders, pct: s.pendingOrders / total, mod: 'warning' },
      {
        label: 'Cancelled',
        count: s.cancelledOrders,
        pct: s.cancelledOrders / total,
        mod: 'danger',
      },
      { label: 'Refunded', count: s.refundedOrders, pct: s.refundedOrders / total, mod: 'neutral' },
    ];
  });

  private readonly products = this.productService.filterProducts;

  protected readonly productStats = computed(() => {
    const all = this.products();
    return {
      total: all.length,
      lowStock: all.filter((p) => p.quantity > 0 && p.quantity < 10).length,
      outOfStock: all.filter((p) => p.quantity === 0).length,
      avgRating: all.length > 0 ? all.reduce((s, p) => s + p.rate, 0) / all.length : 0,
    };
  });

  ngOnInit(): void {
    this.adminStatsService.loadStats();
    this.adminStatsService.loadRecentOrders();
  }
}
