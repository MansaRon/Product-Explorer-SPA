import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input, OnInit, signal, viewChild } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NavItem } from '../../../core/models/navigation';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  private readonly authService = inject(AuthService);

  readonly navItems = input<NavItem[]>([]);

  protected readonly mobileMenuOpen = signal(false);
  protected readonly isOpen = computed(() => this.mobileMenuOpen());
  protected readonly isAdmin = this.authService.isAdmin;

  protected toggleMobileMenu(): void {
    this.mobileMenuOpen.update(open => !open);
  }

  protected closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  protected toggleAdmin(): void {
    this.authService.toggleAdmin();
  }
}
