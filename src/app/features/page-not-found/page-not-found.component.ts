import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageNotFoundComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);

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
    window.history.back();
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
