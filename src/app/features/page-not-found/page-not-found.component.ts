import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HomeIconComponent } from '../../shared/components/icons/home-icon/home-icon.component';
import { ArrowLeftIconComponent } from '../../shared/components/icons/arrow-left-icon/arrow-left-icon.component';
import { SearchIconComponent } from '../../shared/components/icons/search-icon/search-icon.component';
import { AlertTriangleIconComponent } from '../../shared/components/icons/alert-triangle-icon/alert-triangle-icon.component';

@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    HomeIconComponent,
    ArrowLeftIconComponent,
    SearchIconComponent,
    AlertTriangleIconComponent,
  ],
})
export class PageNotFoundComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly countdown = signal(10);
  private countdownInterval?: number;

  ngOnInit(): void {
    this.startCountdown();
  }

  protected goHome(): void {
    this.clearCountdown();
    this.router.navigate(['/']);
  }

  protected goBack(): void {
    this.clearCountdown();
    const previousUrl =
      this.router.lastSuccessfulNavigation?.previousNavigation?.finalUrl?.toString();
    this.router.navigateByUrl(previousUrl ?? '/');
  }

  private startCountdown(): void {
    this.countdownInterval = window.setInterval(() => {
      const current = this.countdown();
      if (current <= 1) {
        this.clearCountdown();
        this.router.navigate(['/']);
      } else {
        this.countdown.set(current - 1);
      }
    }, 1000);
  }

  private clearCountdown(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = undefined;
    }
  }

  ngOnDestroy(): void {
    this.clearCountdown();
  }
}
