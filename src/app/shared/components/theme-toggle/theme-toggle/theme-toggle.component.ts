import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ThemeService } from '../../../../core/services/theme/theme.service';

@Component({
  selector: 'app-theme-toggle',
  template: `
  <button type="button" 
    (click)="themeService.toggleTheme()"
    [attr.aria-label]="themeService.theme() === 'light' ? 'Switch to dark mode' : 'Switch to light mode'" 
    class="theme-toggle">
    @if (themeService.theme() === 'light') {
      <span class="icon">🌙</span>
    } @else {
      <span class="icon">☀️</span>
    }
  </button>
  `,
  styles: `
  .theme-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: var(--radius-md);
    background-color: var(--color-bg-secondary);
    border: 1px solid var(--color-border);
    transition: background-color var(--transition-fast);

    &:hover {
      background-color: var(--color-bg-tertiary);
    }

    .icon {
      font-size: 1.25rem;
    }
  }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeToggleComponent {
  themeService = inject(ThemeService);
}
