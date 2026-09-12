import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NavItem } from '../../../core/models/navigation';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ThemeService } from '../../../core/services/theme/theme.service';
import { CartService } from '../../../core/services/cart/cart.service';
import { CartIconComponent } from '../icons/cart-icon/cart-icon.component';
import { MenuIconComponent } from '../icons/menu-icon/menu-icon.component';
import { CloseIconComponent } from '../icons/close-icon/close-icon.component';
import { MoonIconComponent } from '../icons/moon-icon/moon-icon.component';
import { SunIconComponent } from '../icons/sun-icon/sun-icon.component';
import { UserCircleIconComponent } from '../icons/user-circle-icon/user-circle-icon.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [
    RouterLink,
    RouterLinkActive,
    CartIconComponent,
    MenuIconComponent,
    CloseIconComponent,
    MoonIconComponent,
    SunIconComponent,
    UserCircleIconComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  private readonly authService = inject(AuthService);
  private readonly themeService = inject(ThemeService);
  private readonly cartService = inject(CartService);

  readonly navItems = input<NavItem[]>([]);

  protected readonly mobileMenuOpen = signal(false);
  protected readonly profileMenuOpen = signal(false);

  protected readonly isOpen = computed(() => this.mobileMenuOpen());
  protected readonly isAdmin = this.authService.isAdmin;
  protected readonly isAuthenticated = this.authService.isAuthenticated;
  protected readonly currentUser = this.authService.currentUser;
  protected readonly theme = this.themeService.theme;
  protected readonly cartCount = this.cartService.itemCount;

  protected readonly userInitial = computed(
    () => this.authService.currentUser()?.name?.[0]?.toUpperCase() ?? '?'
  );

  protected toggleMobileMenu(): void {
    this.mobileMenuOpen.update((open) => !open);
  }

  protected closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  protected toggleProfileMenu(): void {
    this.profileMenuOpen.update((open) => !open);
  }

  protected closeProfileMenu(): void {
    this.profileMenuOpen.set(false);
  }

  protected logout(): void {
    this.profileMenuOpen.set(false);
    this.authService.logoutAndRedirect();
  }

  protected toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
