import { UrlTree } from '@angular/router';

export interface NavItem {
  readonly label: string;
  readonly link: string | UrlTree | null | undefined;
  readonly requiresAuth?: boolean;
  readonly requiresAdmin?: boolean;
}
