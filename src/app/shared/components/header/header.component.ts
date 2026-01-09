import { ChangeDetectionStrategy, Component, computed, ElementRef, input, OnInit, signal, viewChild } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NavItem } from '../../../core/models/navigation';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {

  readonly navItems = input<NavItem[]>([]);
  protected readonly mobileMenuOpen = signal(false);
  protected readonly isOpen = computed(() => this.mobileMenuOpen());
  private readonly navRef = viewChild<ElementRef<HTMLElement>>('nav');

  protected toggleMobileMenu(): void {
    this.mobileMenuOpen.update(open => !open);

    if (!this.mobileMenuOpen()) {
      return;
    }
    queueMicrotask(() => {
      this.navRef()?.nativeElement.querySelector<HTMLElement>('a')?.focus();
    });
  }

  protected closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

}
