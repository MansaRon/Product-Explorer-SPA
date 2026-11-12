import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ThemeService } from '../../../core/services/theme/theme.service';
import { AppRoutes } from '../../../shared/enums/app-routes-enum';
import { BrandLogoComponent } from '../../../shared/components/icons/brand-logo/brand-logo.component';
import { HomeIconComponent } from '../../../shared/components/icons/home-icon/home-icon.component';
import { TruckIconComponent } from '../../../shared/components/icons/truck-icon/truck-icon.component';
import { UserCircleIconComponent } from '../../../shared/components/icons/user-circle-icon/user-circle-icon.component';
import { TableIconComponent } from '../../../shared/components/icons/table-icon/table-icon.component';
import { CheckCircleIconComponent } from '../../../shared/components/icons/check-circle-icon/check-circle-icon.component';
import { BanknoteIconComponent } from '../../../shared/components/icons/banknote-icon/banknote-icon.component';
import { MoonIconComponent } from '../../../shared/components/icons/moon-icon/moon-icon.component';
import { SunIconComponent } from '../../../shared/components/icons/sun-icon/sun-icon.component';

@Component({
  selector: 'app-admin-shell',
  templateUrl: './admin-shell.component.html',
  styleUrls: ['./admin-shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    BrandLogoComponent,
    HomeIconComponent,
    TruckIconComponent,
    UserCircleIconComponent,
    TableIconComponent,
    CheckCircleIconComponent,
    BanknoteIconComponent,
    MoonIconComponent,
    SunIconComponent,
  ],
})
export class AdminShellComponent {
  private readonly authService = inject(AuthService);
  private readonly themeService = inject(ThemeService);

  protected readonly theme = this.themeService.theme;

  protected readonly currentUser = this.authService.currentUser;
  protected readonly userInitial = computed(
    () => this.currentUser()?.name?.[0]?.toUpperCase() ?? 'A'
  );

  protected readonly routes = {
    dashboard: `/${AppRoutes.ADMIN}/${AppRoutes.ADMIN_DASHBOARD}`,
    orders: `/${AppRoutes.ADMIN}/${AppRoutes.ADMIN_ORDERS}`,
    users: `/${AppRoutes.ADMIN}/${AppRoutes.ADMIN_USERS}`,
    catalog: `/${AppRoutes.ADMIN}/${AppRoutes.ADMIN_CATALOG}`,
    categories: `/${AppRoutes.ADMIN}/${AppRoutes.ADMIN_CATEGORIES}`,
    coupons: `/${AppRoutes.ADMIN}/${AppRoutes.ADMIN_COUPONS}`,
  };

  protected toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  protected logout(): void {
    this.authService.logoutAndRedirect();
  }
}
