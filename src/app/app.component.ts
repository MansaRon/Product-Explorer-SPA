import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { NavItem } from './core/models/navigation';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  readonly navItems: NavItem[] = [
    { label: 'Catalog', link: '/catalog' },
    { label: 'Favorites', link: '/favorites' },
    { label: 'Admin', link: '/admin' },
    // { label: 'Cart', link: '/cart' }
  ];
}
