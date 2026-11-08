import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { NavItem } from '../../core/models/navigation';
import { AppRoutes } from '../../shared/enums/app-routes-enum';

@Component({
  selector: 'app-consumer-shell',
  templateUrl: './consumer-shell.component.html',
  styleUrls: ['./consumer-shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, HeaderComponent],
})
export class ConsumerShellComponent {
  readonly navItems: NavItem[] = [
    { label: 'Catalog', link: `/${AppRoutes.CATALOG}` },
    { label: 'Favorites', link: `/${AppRoutes.FAVOURITE}` },
    { label: 'Orders', link: `/${AppRoutes.ORDERS}`, requiresAuth: true },
    { label: 'Admin', link: `/${AppRoutes.ADMIN}`, requiresAdmin: true },
  ];
}
